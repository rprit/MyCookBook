CREATE TABLE "recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"ingredients" text[] NOT NULL,
	"instructions" text[] NOT NULL,
	"image_url" text,
	"prep_time" integer NOT NULL,
	"cook_time" integer NOT NULL,
	"servings" integer NOT NULL,
	"tags" text[] NOT NULL,
	"author_id" integer NOT NULL,
	"rating" integer DEFAULT 0,
	"rating_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"display_name" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
