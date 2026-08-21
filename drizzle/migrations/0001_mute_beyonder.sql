ALTER TABLE "auth_account" ADD COLUMN "issuer" text;--> statement-breakpoint
UPDATE "auth_account" SET "issuer" = 'local:credential' WHERE "issuer" IS NULL;--> statement-breakpoint
ALTER TABLE "auth_account" ALTER COLUMN "issuer" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_account_issuer_account_id_idx" ON "auth_account" USING btree ("issuer","account_id");
