// plugins
declare module "simple-mind-map/src/plugins/*.js" {
  export default class {}
}

// Core MindMap type extensions
declare module "simple-mind-map" {
  export interface RichTextPlugin {
    formatText: (ops: any) => void;
    removeFormat: () => void;
  }

  export default class MindMap {
    richText: RichTextPlugin;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
    [key: string]: any;

    constructor(opt?: any);

    static usePlugin(plugin: any, opt?: Record<string, unknown>): typeof MindMap;
    static hasPlugin(plugin: any): number;
  }
}

declare module "simple-mind-map-plugin-themes/themeImgMap" {
  const themeImgMap: Record<string, string>;
  export default themeImgMap;
}

// Theme plugin
declare module "simple-mind-map-plugin-themes";
declare module "simple-mind-map-plugin-themes/themeList";
