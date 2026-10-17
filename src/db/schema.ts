import { relations } from "drizzle-orm";
import { date, index, integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

export const memes = pgTable(
  "memes",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    type: text("type", { enum: ["meme", "video"] }).notNull(),
    thumbnail: text("thumbnail").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    videoSrc: text("video_src"),
    author: text("author").notNull(),
    bio: text("bio"),
    postedAt: date("posted_at", { mode: "string" }).notNull(),
  },
  (table) => [index("memes_posted_at_idx").on(table.postedAt)],
);

export const comments = pgTable(
  "comments",
  {
    id: text("id").primaryKey(),
    memeId: text("meme_id")
      .notNull()
      .references(() => memes.id, { onDelete: "cascade" }),
    author: text("author").notNull(),
    text: text("text").notNull(),
    postedAt: date("posted_at", { mode: "string" }).notNull(),
  },
  (table) => [index("comments_meme_id_idx").on(table.memeId)],
);

export const memeLikes = pgTable(
  "meme_likes",
  {
    memeId: text("meme_id")
      .notNull()
      .references(() => memes.id, { onDelete: "cascade" }),
    author: text("author").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.memeId, table.author], name: "meme_likes_pk" }),
    index("meme_likes_author_idx").on(table.author),
  ],
);

export const memesRelations = relations(memes, ({ many }) => ({
  comments: many(comments),
  likes: many(memeLikes),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  meme: one(memes, {
    fields: [comments.memeId],
    references: [memes.id],
  }),
}));

export const memeLikesRelations = relations(memeLikes, ({ one }) => ({
  meme: one(memes, {
    fields: [memeLikes.memeId],
    references: [memes.id],
  }),
}));