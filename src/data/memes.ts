export type Comment = {
  id: string;
  author: string;
  text: string;
  postedAt: string;
};

export type MemeItem = {
  id: string;
  title: string;
  type: "meme" | "video";
  thumbnail: string;
  width: number;
  height: number;
  // Optional video file; when absent the video is shown as "coming soon".
  videoSrc?: string;
  author: string;
  bio?: string;
  postedAt: string;
  comments?: Comment[];
};

export const memes: MemeItem[] = [];
