-- ======================================================
-- file_data table
-- ======================================================
CREATE TABLE IF NOT EXISTS "file_data" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- sync flags
    "deleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "new" BOOLEAN NOT NULL DEFAULT FALSE,
    "modified_columns" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "sent_to_server" BOOLEAN NOT NULL DEFAULT FALSE,

    "backup" JSONB
);

CREATE INDEX IF NOT EXISTS "file_data_type_idx" ON "file_data" ("type");
CREATE INDEX IF NOT EXISTS "file_data_user_idx" ON "file_data" ("user_id");
CREATE INDEX IF NOT EXISTS "file_data_user_type_idx" ON "file_data" ("user_id", "type");
CREATE INDEX IF NOT EXISTS "file_data_deleted_idx" ON "file_data" ("deleted");

-- ======================================================
-- DELETE Trigger
-- ======================================================
CREATE OR REPLACE FUNCTION handle_delete()
RETURNS TRIGGER AS $$
DECLARE
    bypass_triggers BOOLEAN;
BEGIN
    SELECT COALESCE(NULLIF(current_setting('electric.bypass_triggers', true), ''), 'false')::boolean
    INTO bypass_triggers;

    -- Physical delete (GC / sync)
    IF bypass_triggers THEN
        RETURN OLD;
    END IF;

    -- Local new not sent to server → True delete
    IF OLD.new AND OLD.sent_to_server = FALSE THEN
        RETURN OLD;
    END IF;

    -- Prevent duplicate delete
    IF OLD.deleted THEN
        RETURN NULL;
    END IF;

    -- Mark as internal delete
    PERFORM set_config('electric.internal_delete', 'true', true);

    UPDATE file_data
    SET
        deleted = TRUE,
        updated_at = NOW(),
        sent_to_server = FALSE,
        modified_columns = ARRAY['deleted'],
        backup = jsonb_build_object('deleted', to_jsonb(OLD.deleted)),
        new = FALSE
    WHERE id = OLD.id;

    PERFORM set_config('electric.internal_delete', 'false', true);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS file_data_delete_trigger ON file_data;

CREATE TRIGGER file_data_delete_trigger
BEFORE DELETE ON file_data
FOR EACH ROW
EXECUTE FUNCTION handle_delete();

-- ======================================================
-- INSERT Trigger
-- ======================================================
CREATE OR REPLACE FUNCTION handle_insert()
RETURNS TRIGGER AS $$
DECLARE
    bypass_triggers BOOLEAN;
    modified_columns TEXT[];
BEGIN
    SELECT COALESCE(NULLIF(current_setting('electric.bypass_triggers', true), ''), 'false')::boolean
    INTO bypass_triggers;

    IF bypass_triggers THEN
        RETURN NEW;
    END IF;

    SELECT array_agg(column_name) INTO modified_columns
    FROM information_schema.columns
    WHERE table_name = 'file_data'
    AND column_name NOT IN (
        'id','modified_columns','backup','new','sent_to_server','user_id'
    );

    NEW.modified_columns := modified_columns;
    NEW.new := TRUE;
    NEW.sent_to_server := FALSE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS file_data_insert_trigger ON file_data;

CREATE TRIGGER file_data_insert_trigger
BEFORE INSERT ON file_data
FOR EACH ROW
EXECUTE FUNCTION handle_insert();

-- ======================================================
-- UPDATE Trigger
-- ======================================================
CREATE OR REPLACE FUNCTION handle_update()
RETURNS TRIGGER AS $$
DECLARE
    bypass_triggers BOOLEAN;
    is_internal_delete BOOLEAN;
    col TEXT;
    old_val JSONB;
    new_val JSONB;
BEGIN
    SELECT COALESCE(NULLIF(current_setting('electric.bypass_triggers', true), ''), 'false')::boolean
    INTO bypass_triggers;

    IF bypass_triggers THEN
        RETURN NEW;
    END IF;

    SELECT COALESCE(NULLIF(current_setting('electric.internal_delete', true), ''), 'false')::boolean
    INTO is_internal_delete;

    -- Skip update diff for internal delete
    IF is_internal_delete THEN
        RETURN NEW;
    END IF;

    -- Special handling for deleted column
    IF NEW.deleted IS DISTINCT FROM OLD.deleted THEN
        NEW.modified_columns := ARRAY['deleted'];
        NEW.backup := jsonb_build_object(
            'deleted', to_jsonb(OLD.deleted)
        );
        NEW.new := FALSE;
        NEW.sent_to_server := FALSE;
        RETURN NEW;
    END IF;

    -- Track update diff
    FOR col IN
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'file_data'
        AND column_name NOT IN (
            'id','modified_columns','backup','new','sent_to_server','user_id'
        )
    LOOP
        EXECUTE format('SELECT to_jsonb(($1).%I)', col) USING NEW INTO new_val;
        EXECUTE format('SELECT to_jsonb(($1).%I)', col) USING OLD INTO old_val;

        IF new_val IS DISTINCT FROM old_val THEN
            IF NOT (NEW.modified_columns @> ARRAY[col]) THEN
                NEW.modified_columns := array_append(NEW.modified_columns, col);

                NEW.backup := jsonb_set(
                    COALESCE(NEW.backup, '{}'::jsonb),
                    ARRAY[col],
                    old_val
                );
            END IF;
        END IF;
    END LOOP;

    NEW.sent_to_server := FALSE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS file_data_update_trigger ON file_data;

CREATE TRIGGER file_data_update_trigger
BEFORE UPDATE ON file_data
FOR EACH ROW
EXECUTE FUNCTION handle_update();