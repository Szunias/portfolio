export interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  sources: { url: string; type: string }[];
  desc: { [key: string]: string };
  tags: string[];
  length: number;
}
