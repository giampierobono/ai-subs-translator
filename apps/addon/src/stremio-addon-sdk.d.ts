declare module 'stremio-addon-sdk' {
  export interface AddonManifest {
    id: string;
    version: string;
    name: string;
    description: string;
    resources: string[];
    types: string[];
    idPrefixes: string[];
    catalogs: any[];
  }

  export interface SubtitlesRequest {
    id: string;
    type: string;
    extra?: {
      lang?: string;
      [key: string]: any;
    };
  }

  export interface Subtitle {
    id: string;
    lang: string;
    url: string;
    name: string;
  }

  export interface SubtitlesResponse {
    subtitles: Subtitle[];
  }

  export class addonBuilder {
    constructor(manifest: AddonManifest);
    defineSubtitlesHandler(handler: (request: SubtitlesRequest) => Promise<SubtitlesResponse>): void;
    getInterface(): any;
  }
}
