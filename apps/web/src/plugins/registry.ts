import type { CoFilePlugin } from "./types";

class CoFileRegistry {
  private plugins = new Map<string, CoFilePlugin>();

  register(plugin: CoFilePlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`CoFileRegistry: overwriting plugin "${plugin.id}"`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  unregister(id: string): boolean {
    return this.plugins.delete(id);
  }

  get(id: string): CoFilePlugin | undefined {
    return this.plugins.get(id);
  }

  list(): CoFilePlugin[] {
    return Array.from(this.plugins.values());
  }

  getBySuffix(suffix: string): CoFilePlugin | undefined {
    for (const plugin of this.plugins.values()) {
      if (plugin.meta.suffix === suffix) return plugin;
    }
    return undefined;
  }

  getSuffixes(): string[] {
    return this.list().map((p) => p.meta.suffix);
  }
}

export const coFileRegistry = new CoFileRegistry();
