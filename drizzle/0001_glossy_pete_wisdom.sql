CREATE TABLE "meme_likes" (
	"meme_id" text NOT NULL,
	"author" text NOT NULL,
	CONSTRAINT "meme_likes_pk" PRIMARY KEY("meme_id","author")
);
--> statement-breakpoint
ALTER TABLE "meme_likes" ADD CONSTRAINT "meme_likes_meme_id_memes_id_fk" FOREIGN KEY ("meme_id") REFERENCES "public"."memes"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "meme_likes_author_idx" ON "meme_likes" USING btree ("author");