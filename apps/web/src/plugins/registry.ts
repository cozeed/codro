import { getDefaultStore } from "jotai";
import { disabledPluginIdsAtom } from "@/store/jotai";
import type { CoFilePlugin } from "./types";

class CoFileRegistry {
  private plugins = new Map<string, CoFilePlugin>();

  private get disabledIds(): Set<string> {
    return new Set(getDefaultStore().get(disabledPluginIdsAtom));
  }

  private setDisabledIds(ids: string[]): void {
    getDefaultStore().set(disabledPluginIdsAtom, ids);
  }

  register(plugin: CoFilePlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`CoFileRegistry: overwriting plugin "${plugin.id}"`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  unregister(id: string): boolean {
    const filtered = getDefaultStore()
      .get(disabledPluginIdsAtom)
      .filter((i) => i !== id);
    this.setDisabledIds(filtered);
    return this.plugins.delete(id);
  }

  get(id: string): CoFilePlugin | undefined {
    return this.plugins.get(id);
  }

  list(): CoFilePlugin[] {
    const ids = this.disabledIds;
    return Array.from(this.plugins.values()).filter((p) => !ids.has(p.id));
  }

  listAll(): CoFilePlugin[] {
    return Array.from(this.plugins.values());
  }

  getBySuffix(suffix: string): CoFilePlugin | undefined {
    const ids = this.disabledIds;
    for (const plugin of this.plugins.values()) {
      if (plugin.meta.suffix === suffix && !ids.has(plugin.id)) return plugin;
    }
    return undefined;
  }

  getSuffixes(): string[] {
    return this.list().map((p) => p.meta.suffix);
  }

  isEnabled(id: string): boolean {
    return !this.disabledIds.has(id);
  }

  setEnabled(id: string, enabled: boolean): void {
    if (!this.plugins.has(id)) return;
    const current = getDefaultStore().get(disabledPluginIdsAtom);
    if (enabled) {
      this.setDisabledIds(current.filter((i) => i !== id));
    } else {
      this.setDisabledIds([...current, id]);
    }
  }
}

export const coFileRegistry = new CoFileRegistry();
