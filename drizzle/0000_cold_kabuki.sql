CREATE TABLE "resource_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"path" varchar(255) NOT NULL,
	"extension" varchar(255) NOT NULL,
	"size" bigint DEFAULT 0 NOT NULL,
	"hash" varchar(255) NOT NULL,
	"perceptual_hash" varchar(255),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "resource_files_path_index" ON "resource_files" USING btree ("path");--> statement-breakpoint
CREATE INDEX "resource_files_hash_index" ON "resource_files" USING btree ("hash");--> statement-breakpoint
CREATE INDEX "resource_files_perceptual_hash_index" ON "resource_files" USING btree ("perceptual_hash");