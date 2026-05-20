import type { CoFile } from "@/types/file";
import { coFileRegistry } from "./registry";

export interface CoFilePluginMeta {
  displayName: string;
  defaultFileName: string;
  suffix: string;
  tooltip: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface CoFilePluginComponents {
  editor: React.ComponentType<{ file: CoFile }>;
  diagram?: React.ComponentType<{ code?: string; className?: string }>;
}

export interface CoFilePluginData {
  getInitialData: () => unknown;
  deserialize?: (content: string) => unknown;
}

export interface CoFilePlugin {
  id: string;
  meta: CoFilePluginMeta;
  components: CoFilePluginComponents;
  data: CoFilePluginData;
}

export function definePlugin(plugin: CoFilePlugin): CoFilePlugin {
  coFileRegistry.register(plugin);
  return plugin;
}
