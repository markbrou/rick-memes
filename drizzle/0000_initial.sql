CREATE TABLE "memes" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"thumbnail" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"video_src" text,
	"author" text NOT NULL,
	"bio" text,
	"posted_at" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"meme_id" text NOT NULL,
	"author" text NOT NULL,
	"text" text NOT NULL,
	"posted_at" date NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_meme_id_memes_id_fk" FOREIGN KEY ("meme_id") REFERENCES "public"."memes"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "memes_posted_at_idx" ON "memes" USING btree ("posted_at");
--> statement-breakpoint
CREATE INDEX "comments_meme_id_idx" ON "comments" USING btree ("meme_id");