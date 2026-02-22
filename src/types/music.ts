export interface TrackSource {
  readonly url: string;
  readonly type: string;
}

export interface Track {
  readonly id: string;
  readonly title: string;
  readonly artist: string;
  readonly cover: string;
  readonly sources: TrackSource[];
  readonly desc: Record<string, string>;
  readonly tags: string[];
  readonly length: number;
  readonly year?: number;
  readonly date?: string;
}
