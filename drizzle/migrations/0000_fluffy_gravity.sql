CREATE TYPE "public"."account_status" AS ENUM('incomplete', 'active');--> statement-breakpoint
CREATE TYPE "public"."account_type" AS ENUM('customer', 'staff', 'both');--> statement-breakpoint
CREATE TYPE "public"."address_type" AS ENUM('billing', 'shipping', 'both');--> statement-breakpoint
CREATE TYPE "public"."api_key_status" AS ENUM('active', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."attribute_display_type" AS ENUM('button', 'color', 'dropdown');--> statement-breakpoint
CREATE TYPE "public"."auth_provider" AS ENUM('credentials', 'supabase', 'google', 'phone_otp');--> statement-breakpoint
CREATE TYPE "public"."cart_status" AS ENUM('active', 'converted', 'abandoned', 'expired');--> statement-breakpoint
CREATE TYPE "public"."cash_movement_type" AS ENUM('opening', 'closing', 'cash_in', 'cash_out', 'drop', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."category_status" AS ENUM('active', 'inactive', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."checkout_session_status" AS ENUM('open', 'payment_pending', 'completed', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."content_section_type" AS ENUM('bullets', 'paragraphs', 'rich_text', 'html', 'json');--> statement-breakpoint
CREATE TYPE "public"."file_access" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "public"."file_kind" AS ENUM('image', 'document', 'video', 'other');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_status" AS ENUM('unfulfilled', 'partial', 'fulfilled', 'cancelled', 'returned');--> statement-breakpoint
CREATE TYPE "public"."image_orientation" AS ENUM('portrait', 'landscape', 'square', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."inventory_count_status" AS ENUM('draft', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."inventory_location_type" AS ENUM('store', 'warehouse', 'virtual');--> statement-breakpoint
CREATE TYPE "public"."inventory_reservation_status" AS ENUM('active', 'committed', 'released', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."order_source" AS ENUM('online', 'pos', 'admin');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('draft', 'pending_payment', 'staged', 'confirmed', 'processing', 'ready_for_pickup', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'partially_refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_event_type" AS ENUM('request', 'redirect', 'callback', 'webhook', 'status_check', 'refund');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('card', 'wallet', 'installment', 'cash', 'bank_transfer', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('genie', 'koko', 'mintpay', 'cash', 'card_manual', 'bank_transfer', 'store_credit', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'pending', 'authorized', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded');--> statement-breakpoint
CREATE TYPE "public"."pos_session_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."product_promo_label" AS ENUM('none', 'new_arrival', 'best_seller');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'inactive', 'archived');--> statement-breakpoint
CREATE TYPE "public"."promotion_discount_type" AS ENUM('percent', 'fixed_amount', 'free_shipping', 'message_only');--> statement-breakpoint
CREATE TYPE "public"."promotion_type" AS ENUM('payment', 'product', 'category', 'order', 'shipping');--> statement-breakpoint
CREATE TYPE "public"."purchase_order_status" AS ENUM('draft', 'ordered', 'partially_received', 'received', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."recommendation_question_type" AS ENUM('single_choice', 'multi_choice', 'number', 'text', 'boolean');--> statement-breakpoint
CREATE TYPE "public"."recommendation_source" AS ENUM('manual', 'same_category', 'same_brand', 'answers', 'history', 'bestseller');--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('pending', 'succeeded', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."return_status" AS ENUM('requested', 'approved', 'rejected', 'received', 'refunded', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."setting_value_type" AS ENUM('string', 'number', 'boolean', 'json', 'secret_ref');--> statement-breakpoint
CREATE TYPE "public"."shipment_status" AS ENUM('pending', 'packed', 'shipped', 'delivered', 'failed', 'returned', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."staff_status" AS ENUM('active', 'disabled', 'invited');--> statement-breakpoint
CREATE TYPE "public"."stock_commit_status" AS ENUM('pending', 'committed', 'rolled_back');--> statement-breakpoint
CREATE TYPE "public"."stock_movement_type" AS ENUM('initial', 'receive', 'adjustment', 'reservation', 'release', 'sale', 'cancellation', 'return', 'refund', 'transfer_in', 'transfer_out', 'damage', 'loss');--> statement-breakpoint
CREATE TYPE "public"."stock_source_type" AS ENUM('online_order', 'pos_order', 'manual_adjustment', 'purchase_order', 'stock_count', 'return', 'transfer', 'system');--> statement-breakpoint
CREATE TYPE "public"."token_purpose" AS ENUM('email_verification', 'password_reset', 'staff_invite', 'customer_invite');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'disabled', 'invited', 'pending_verification');--> statement-breakpoint
CREATE TYPE "public"."variant_status" AS ENUM('active', 'inactive', 'archived');--> statement-breakpoint
CREATE TABLE "auth_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "auth_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "auth_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "auth_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "auth_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "auth_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"purpose" "token_purpose" NOT NULL,
	"token_hash" text NOT NULL,
	"email" text,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"type" "address_type" DEFAULT 'shipping' NOT NULL,
	"label" text,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"address_line_1" text NOT NULL,
	"address_line_2" text,
	"city" text NOT NULL,
	"district" text,
	"province" text,
	"postal_code" text,
	"country_code" varchar(2) DEFAULT 'LK' NOT NULL,
	"is_default_billing" boolean DEFAULT false NOT NULL,
	"is_default_shipping" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"customer_number" varchar(32) NOT NULL,
	"first_name" text,
	"last_name" text,
	"display_name" text,
	"phone" text,
	"date_of_birth" timestamp with time zone,
	"marketing_opt_in" boolean DEFAULT false NOT NULL,
	"recommendation_opt_in" boolean DEFAULT true NOT NULL,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_system_role" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"staff_number" varchar(32) NOT NULL,
	"role_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"status" "staff_status" DEFAULT 'invited' NOT NULL,
	"created_by_user_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_auth_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "auth_provider" NOT NULL,
	"provider_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_token_hash" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"normalized_email" text NOT NULL,
	"phone" text,
	"password_hash" text,
	"account_type" "account_type" DEFAULT 'customer' NOT NULL,
	"status" "user_status" DEFAULT 'pending_verification' NOT NULL,
	"account_status" "account_status" DEFAULT 'incomplete' NOT NULL,
	"email_verified_at" timestamp with time zone,
	"phone_verified_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_normalized_email_lower_check" CHECK ("users"."normalized_email" = lower("users"."normalized_email"))
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "file_kind" NOT NULL,
	"access" "file_access" DEFAULT 'private' NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"width" integer,
	"height" integer,
	"orientation" "image_orientation" DEFAULT 'unknown' NOT NULL,
	"bucket" text NOT NULL,
	"storage_key" text NOT NULL,
	"public_url" text,
	"alt_text" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"uploaded_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"full_slug" text NOT NULL,
	"description" text,
	"image_file_id" uuid,
	"status" "category_status" DEFAULT 'active' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"group_slug" text DEFAULT 'default' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_filter_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filter_id" uuid NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_filters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"label" text NOT NULL,
	"slug" text NOT NULL,
	"source_type" text DEFAULT 'attribute' NOT NULL,
	"source_key" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_page_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"hero_image_file_id" uuid,
	"fallback_hero_image_file_id" uuid,
	"hero_image_url" text,
	"fallback_hero_image_url" text,
	"seo_title" text,
	"seo_description" text,
	"content_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homepage_sports_slides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"tagline" text NOT NULL,
	"image_file_id" uuid,
	"category_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storefront_nav_columns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nav_item_id" uuid NOT NULL,
	"heading" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storefront_nav_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"href" text NOT NULL,
	"menu_type" text DEFAULT 'category' NOT NULL,
	"image_file_id" uuid,
	"image_alt" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storefront_nav_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"column_id" uuid NOT NULL,
	"label" text NOT NULL,
	"href" text NOT NULL,
	"category_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo_file_id" uuid,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_accordion_bullets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"accordion_id" uuid NOT NULL,
	"content" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_accordion_paragraphs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"accordion_id" uuid NOT NULL,
	"content" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_accordions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"title" text NOT NULL,
	"default_open" boolean DEFAULT false NOT NULL,
	"content_type" text DEFAULT 'paragraphs' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_attribute_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attribute_id" uuid NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"color_hex" varchar(16),
	"image_file_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"display_type" "attribute_display_type" DEFAULT 'button' NOT NULL,
	"is_variant_attribute" boolean DEFAULT true NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"product_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_categories_product_id_category_id_pk" PRIMARY KEY("product_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "product_content_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"key" text NOT NULL,
	"title" text NOT NULL,
	"content_type" "content_section_type" NOT NULL,
	"content_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"default_open" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"src" text NOT NULL,
	"alt" text,
	"orientation" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"role" text DEFAULT 'gallery' NOT NULL,
	"alt_text" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_option_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"label" text NOT NULL,
	"selected_label" text,
	"type" text DEFAULT 'button' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_option_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"color" text,
	"image" text,
	"available" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_payment_promos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"text" text NOT NULL,
	"badge_image" text,
	"badge_alt" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_promotions" (
	"product_id" uuid NOT NULL,
	"promotion_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_promotions_product_id_promotion_id_pk" PRIMARY KEY("product_id","promotion_id")
);
--> statement-breakpoint
CREATE TABLE "product_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"recommended_product_id" uuid NOT NULL,
	"source" "recommendation_source" DEFAULT 'manual' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_recommendations_simple" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"recommended_product_slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_specifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"group_name" text,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"value_normalized" text,
	"is_filterable" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_tag_assignments" (
	"product_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "product_tag_assignments_product_id_tag_id_pk" PRIMARY KEY("product_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "product_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variant_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"role" text DEFAULT 'gallery' NOT NULL,
	"alt_text" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variant_options" (
	"variant_id" uuid NOT NULL,
	"attribute_id" uuid NOT NULL,
	"attribute_value_id" uuid NOT NULL,
	CONSTRAINT "product_variant_options_variant_id_attribute_id_pk" PRIMARY KEY("variant_id","attribute_id")
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"barcode" text,
	"title" text NOT NULL,
	"option_signature" text NOT NULL,
	"price_minor" integer DEFAULT 0 NOT NULL,
	"compare_at_price_minor" integer,
	"cost_price_minor" integer,
	"currency_code" varchar(3) DEFAULT 'LKR' NOT NULL,
	"weight_grams" integer,
	"status" "variant_status" DEFAULT 'active' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "product_variants_price_non_negative_check" CHECK ("product_variants"."price_minor" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"primary_category_id" uuid,
	"brand_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"product_type" text,
	"short_description" text,
	"description" text,
	"base_price_minor" integer DEFAULT 0 NOT NULL,
	"compare_at_price_minor" integer,
	"currency_code" varchar(3) DEFAULT 'LKR' NOT NULL,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"promo_label" "product_promo_label" DEFAULT 'none' NOT NULL,
	"allow_backorder" boolean DEFAULT false NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"search_keywords" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	"group" text,
	"category" text,
	"category_slug" text,
	CONSTRAINT "products_base_price_non_negative_check" CHECK ("products"."base_price_minor" >= 0)
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"promo_type" "promotion_type" NOT NULL,
	"discount_type" "promotion_discount_type" DEFAULT 'message_only' NOT NULL,
	"discount_value" integer,
	"provider_key" text,
	"badge_file_id" uuid,
	"badge_alt" text,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_count_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"count_session_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"expected_quantity" integer NOT NULL,
	"counted_quantity" integer,
	"difference_quantity" integer,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "inventory_count_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"count_number" varchar(48) NOT NULL,
	"location_id" uuid NOT NULL,
	"status" "inventory_count_status" DEFAULT 'draft' NOT NULL,
	"started_by_user_id" uuid,
	"completed_by_user_id" uuid,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"quantity_on_hand" integer DEFAULT 0 NOT NULL,
	"quantity_reserved" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 0 NOT NULL,
	"reorder_point" integer DEFAULT 0 NOT NULL,
	"reorder_quantity" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_items_on_hand_non_negative_check" CHECK ("inventory_items"."quantity_on_hand" >= 0),
	CONSTRAINT "inventory_items_reserved_non_negative_check" CHECK ("inventory_items"."quantity_reserved" >= 0),
	CONSTRAINT "inventory_items_reserved_lte_on_hand_check" CHECK ("inventory_items"."quantity_reserved" <= "inventory_items"."quantity_on_hand")
);
--> statement-breakpoint
CREATE TABLE "inventory_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_number" varchar(48) NOT NULL,
	"variant_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"status" "inventory_reservation_status" DEFAULT 'active' NOT NULL,
	"source_type" "stock_source_type" NOT NULL,
	"source_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"committed_at" timestamp with time zone,
	"released_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_reservations_quantity_positive_check" CHECK ("inventory_reservations"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_order_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity_ordered" integer NOT NULL,
	"quantity_received" integer DEFAULT 0 NOT NULL,
	"unit_cost_minor" integer DEFAULT 0 NOT NULL,
	"line_total_minor" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "purchase_order_items_quantity_ordered_positive_check" CHECK ("purchase_order_items"."quantity_ordered" > 0),
	CONSTRAINT "purchase_order_items_quantity_received_non_negative_check" CHECK ("purchase_order_items"."quantity_received" >= 0)
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"po_number" varchar(48) NOT NULL,
	"supplier_id" uuid,
	"status" "purchase_order_status" DEFAULT 'draft' NOT NULL,
	"expected_at" timestamp with time zone,
	"subtotal_minor" integer DEFAULT 0 NOT NULL,
	"total_minor" integer DEFAULT 0 NOT NULL,
	"currency_code" varchar(3) DEFAULT 'LKR' NOT NULL,
	"notes" text,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_commits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commit_number" varchar(48) NOT NULL,
	"source_type" "stock_source_type" NOT NULL,
	"source_id" uuid,
	"status" "stock_commit_status" DEFAULT 'pending' NOT NULL,
	"actor_user_id" uuid,
	"idempotency_key" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"committed_at" timestamp with time zone,
	"rolled_back_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"type" "inventory_location_type" DEFAULT 'store' NOT NULL,
	"address" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commit_id" uuid,
	"reservation_id" uuid,
	"variant_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"movement_type" "stock_movement_type" NOT NULL,
	"source_type" "stock_source_type" NOT NULL,
	"source_id" uuid,
	"quantity_change" integer NOT NULL,
	"quantity_before" integer NOT NULL,
	"quantity_after" integer NOT NULL,
	"reserved_before" integer DEFAULT 0 NOT NULL,
	"reserved_after" integer DEFAULT 0 NOT NULL,
	"note" text,
	"actor_user_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"contact_name" text,
	"email" text,
	"phone" text,
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_minor_snapshot" integer NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cart_items_quantity_positive_check" CHECK ("cart_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"guest_token_hash" text,
	"status" "cart_status" DEFAULT 'active' NOT NULL,
	"currency_code" varchar(3) DEFAULT 'LKR' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_number" varchar(48) NOT NULL,
	"cart_id" uuid,
	"customer_id" uuid,
	"status" "checkout_session_status" DEFAULT 'open' NOT NULL,
	"reservation_id" uuid,
	"selected_payment_provider" text,
	"subtotal_minor" integer DEFAULT 0 NOT NULL,
	"discount_total_minor" integer DEFAULT 0 NOT NULL,
	"shipping_total_minor" integer DEFAULT 0 NOT NULL,
	"tax_total_minor" integer DEFAULT 0 NOT NULL,
	"grand_total_minor" integer DEFAULT 0 NOT NULL,
	"currency_code" varchar(3) DEFAULT 'LKR' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discount_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discount_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"customer_id" uuid,
	"amount_minor" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"discount_type" text NOT NULL,
	"discount_value" integer DEFAULT 0 NOT NULL,
	"minimum_order_minor" integer,
	"usage_limit" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"source_address_id" uuid,
	"type" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"address_line_1" text,
	"address_line_2" text,
	"city" text,
	"district" text,
	"province" text,
	"postal_code" text,
	"country_code" varchar(2) DEFAULT 'LK' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid,
	"variant_id" uuid,
	"product_name_snapshot" text NOT NULL,
	"variant_title_snapshot" text NOT NULL,
	"sku_snapshot" text,
	"quantity" integer NOT NULL,
	"unit_price_minor" integer NOT NULL,
	"discount_total_minor" integer DEFAULT 0 NOT NULL,
	"tax_total_minor" integer DEFAULT 0 NOT NULL,
	"line_total_minor" integer NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "order_items_quantity_positive_check" CHECK ("order_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "order_return_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"return_id" uuid NOT NULL,
	"order_item_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"restock" boolean DEFAULT true NOT NULL,
	"reason" text,
	CONSTRAINT "order_return_items_quantity_positive_check" CHECK ("order_return_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "order_returns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"return_number" varchar(48) NOT NULL,
	"order_id" uuid NOT NULL,
	"status" "return_status" DEFAULT 'requested' NOT NULL,
	"reason" text,
	"notes" text,
	"requested_by_user_id" uuid,
	"processed_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"note" text,
	"changed_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(48) NOT NULL,
	"koko_trn_id" text,
	"checkout_session_id" uuid,
	"customer_id" uuid,
	"source" "order_source" DEFAULT 'online' NOT NULL,
	"status" "order_status" DEFAULT 'pending_payment' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'unpaid' NOT NULL,
	"fulfillment_status" "fulfillment_status" DEFAULT 'unfulfilled' NOT NULL,
	"stock_location_id" uuid,
	"subtotal_minor" integer DEFAULT 0 NOT NULL,
	"discount_total_minor" integer DEFAULT 0 NOT NULL,
	"tax_total_minor" integer DEFAULT 0 NOT NULL,
	"shipping_total_minor" integer DEFAULT 0 NOT NULL,
	"grand_total_minor" integer DEFAULT 0 NOT NULL,
	"currency_code" varchar(3) DEFAULT 'LKR' NOT NULL,
	"customer_email_snapshot" text,
	"customer_phone_snapshot" text,
	"billing_details_snapshot" jsonb NOT NULL,
	"notes" text,
	"internal_notes" text,
	"created_by_staff_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"placed_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_grand_total_non_negative_check" CHECK ("orders"."grand_total_minor" >= 0)
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"shipping_method_id" uuid,
	"status" "shipment_status" DEFAULT 'pending' NOT NULL,
	"tracking_number" text,
	"carrier_name" text,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"base_price_minor" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"method_type" "payment_method_type" NOT NULL,
	"provider_customer_id" text,
	"provider_payment_method_id" text,
	"brand" text,
	"last4" varchar(4),
	"exp_month" integer,
	"exp_year" integer,
	"billing_name" text,
	"billing_email" text,
	"billing_phone" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid,
	"provider" "payment_provider" NOT NULL,
	"event_type" "payment_event_type" NOT NULL,
	"provider_event_id" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payment_refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"refund_number" varchar(48) NOT NULL,
	"payment_id" uuid NOT NULL,
	"amount_minor" integer NOT NULL,
	"status" "refund_status" DEFAULT 'pending' NOT NULL,
	"reason" text,
	"provider_refund_reference" text,
	"requested_by_user_id" uuid,
	"raw_response" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_refunds_amount_positive_check" CHECK ("payment_refunds"."amount_minor" > 0)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_number" varchar(48) NOT NULL,
	"order_id" uuid NOT NULL,
	"customer_payment_method_id" uuid,
	"provider" "payment_provider" NOT NULL,
	"method_type" "payment_method_type" NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"amount_minor" integer NOT NULL,
	"refunded_amount_minor" integer DEFAULT 0 NOT NULL,
	"currency_code" varchar(3) DEFAULT 'LKR' NOT NULL,
	"provider_reference" text,
	"provider_checkout_url" text,
	"idempotency_key" text,
	"failure_code" text,
	"failure_message" text,
	"raw_response" jsonb,
	"authorized_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_amount_positive_check" CHECK ("payments"."amount_minor" > 0),
	CONSTRAINT "payments_refunded_non_negative_check" CHECK ("payments"."refunded_amount_minor" >= 0)
);
--> statement-breakpoint
CREATE TABLE "pos_cash_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"type" "cash_movement_type" NOT NULL,
	"amount_minor" integer NOT NULL,
	"reason" text,
	"actor_staff_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pos_cash_movements_amount_non_negative_check" CHECK ("pos_cash_movements"."amount_minor" >= 0)
);
--> statement-breakpoint
CREATE TABLE "pos_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_number" varchar(64) NOT NULL,
	"order_id" uuid NOT NULL,
	"session_id" uuid,
	"cashier_staff_id" uuid,
	"printed_at" timestamp with time zone,
	"emailed_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pos_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"location_id" uuid NOT NULL,
	"receipt_prefix" varchar(16) DEFAULT 'POS' NOT NULL,
	"next_receipt_number" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pos_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_number" varchar(48) NOT NULL,
	"register_id" uuid NOT NULL,
	"opened_by_staff_id" uuid NOT NULL,
	"closed_by_staff_id" uuid,
	"status" "pos_session_status" DEFAULT 'open' NOT NULL,
	"opening_cash_minor" integer DEFAULT 0 NOT NULL,
	"expected_closing_cash_minor" integer,
	"actual_closing_cash_minor" integer,
	"cash_difference_minor" integer,
	"notes" text,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "customer_recommendation_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answer_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_recommendation_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"guest_token_hash" text,
	"category_id" uuid,
	"profile_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendation_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"guest_token_hash" text,
	"product_id" uuid,
	"source" "recommendation_source" NOT NULL,
	"score" integer,
	"context_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"shown_at" timestamp with time zone DEFAULT now() NOT NULL,
	"clicked_at" timestamp with time zone,
	"purchased_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "recommendation_question_choices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"weight" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendation_questionnaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendation_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"questionnaire_id" uuid NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"help_text" text,
	"question_type" "recommendation_question_type" DEFAULT 'single_choice' NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendation_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"prefix" text NOT NULL,
	"hashed_key" text NOT NULL,
	"status" "api_key_status" DEFAULT 'active' NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_by_user_id" uuid,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_provider_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"display_name" text NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"mode" text DEFAULT 'sandbox' NOT NULL,
	"public_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"secret_config_ref" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value_type" "setting_value_type" DEFAULT 'string' NOT NULL,
	"value" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"updated_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"event_id" text,
	"event_type" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"signature_verified" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"error_message" text,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"free_shipping_threshold_minor" integer DEFAULT 650000 NOT NULL,
	"base_shipping_fee_minor" integer DEFAULT 35000 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"actor_email" text,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text,
	"before_json" jsonb,
	"after_json" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "woo_orders" (
	"woo_order_id" varchar(50) PRIMARY KEY NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"payment_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_customer_profiles_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_auth_identities" ADD CONSTRAINT "user_auth_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_image_file_id_files_id_fk" FOREIGN KEY ("image_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_filter_options" ADD CONSTRAINT "category_filter_options_filter_id_category_filters_id_fk" FOREIGN KEY ("filter_id") REFERENCES "public"."category_filters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_filters" ADD CONSTRAINT "category_filters_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_page_content" ADD CONSTRAINT "category_page_content_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_page_content" ADD CONSTRAINT "category_page_content_hero_image_file_id_files_id_fk" FOREIGN KEY ("hero_image_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_page_content" ADD CONSTRAINT "category_page_content_fallback_hero_image_file_id_files_id_fk" FOREIGN KEY ("fallback_hero_image_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homepage_sports_slides" ADD CONSTRAINT "homepage_sports_slides_image_file_id_files_id_fk" FOREIGN KEY ("image_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homepage_sports_slides" ADD CONSTRAINT "homepage_sports_slides_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storefront_nav_columns" ADD CONSTRAINT "storefront_nav_columns_nav_item_id_storefront_nav_items_id_fk" FOREIGN KEY ("nav_item_id") REFERENCES "public"."storefront_nav_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storefront_nav_items" ADD CONSTRAINT "storefront_nav_items_image_file_id_files_id_fk" FOREIGN KEY ("image_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storefront_nav_links" ADD CONSTRAINT "storefront_nav_links_column_id_storefront_nav_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."storefront_nav_columns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storefront_nav_links" ADD CONSTRAINT "storefront_nav_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_file_id_files_id_fk" FOREIGN KEY ("logo_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_accordion_bullets" ADD CONSTRAINT "product_accordion_bullets_accordion_id_product_accordions_id_fk" FOREIGN KEY ("accordion_id") REFERENCES "public"."product_accordions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_accordion_paragraphs" ADD CONSTRAINT "product_accordion_paragraphs_accordion_id_product_accordions_id_fk" FOREIGN KEY ("accordion_id") REFERENCES "public"."product_accordions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_accordions" ADD CONSTRAINT "product_accordions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_attribute_id_product_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."product_attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_image_file_id_files_id_fk" FOREIGN KEY ("image_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_content_sections" ADD CONSTRAINT "product_content_sections_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_option_groups" ADD CONSTRAINT "product_option_groups_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_option_values" ADD CONSTRAINT "product_option_values_group_id_product_option_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."product_option_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_payment_promos" ADD CONSTRAINT "product_payment_promos_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_promotions" ADD CONSTRAINT "product_promotions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_promotions" ADD CONSTRAINT "product_promotions_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_recommendations" ADD CONSTRAINT "product_recommendations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_recommendations" ADD CONSTRAINT "product_recommendations_recommended_product_id_products_id_fk" FOREIGN KEY ("recommended_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_recommendations_simple" ADD CONSTRAINT "product_recommendations_simple_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tag_assignments" ADD CONSTRAINT "product_tag_assignments_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tag_assignments" ADD CONSTRAINT "product_tag_assignments_tag_id_product_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."product_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant_media" ADD CONSTRAINT "product_variant_media_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant_media" ADD CONSTRAINT "product_variant_media_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant_options" ADD CONSTRAINT "product_variant_options_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant_options" ADD CONSTRAINT "product_variant_options_attribute_id_product_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."product_attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant_options" ADD CONSTRAINT "product_variant_options_attribute_value_id_product_attribute_values_id_fk" FOREIGN KEY ("attribute_value_id") REFERENCES "public"."product_attribute_values"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_primary_category_id_categories_id_fk" FOREIGN KEY ("primary_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_badge_file_id_files_id_fk" FOREIGN KEY ("badge_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_count_items" ADD CONSTRAINT "inventory_count_items_count_session_id_inventory_count_sessions_id_fk" FOREIGN KEY ("count_session_id") REFERENCES "public"."inventory_count_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_count_items" ADD CONSTRAINT "inventory_count_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_count_sessions" ADD CONSTRAINT "inventory_count_sessions_location_id_stock_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."stock_locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_count_sessions" ADD CONSTRAINT "inventory_count_sessions_started_by_user_id_users_id_fk" FOREIGN KEY ("started_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_count_sessions" ADD CONSTRAINT "inventory_count_sessions_completed_by_user_id_users_id_fk" FOREIGN KEY ("completed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_location_id_stock_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."stock_locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_location_id_stock_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."stock_locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_commits" ADD CONSTRAINT "stock_commits_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_commit_id_stock_commits_id_fk" FOREIGN KEY ("commit_id") REFERENCES "public"."stock_commits"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_reservation_id_inventory_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."inventory_reservations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_location_id_stock_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."stock_locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_customer_profiles_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_customer_id_customer_profiles_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_redemptions" ADD CONSTRAINT "discount_redemptions_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_redemptions" ADD CONSTRAINT "discount_redemptions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_redemptions" ADD CONSTRAINT "discount_redemptions_customer_id_customer_profiles_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_addresses" ADD CONSTRAINT "order_addresses_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_addresses" ADD CONSTRAINT "order_addresses_source_address_id_customer_addresses_id_fk" FOREIGN KEY ("source_address_id") REFERENCES "public"."customer_addresses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_return_items" ADD CONSTRAINT "order_return_items_return_id_order_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "public"."order_returns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_return_items" ADD CONSTRAINT "order_return_items_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_returns" ADD CONSTRAINT "order_returns_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_returns" ADD CONSTRAINT "order_returns_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_returns" ADD CONSTRAINT "order_returns_processed_by_user_id_users_id_fk" FOREIGN KEY ("processed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_checkout_session_id_checkout_sessions_id_fk" FOREIGN KEY ("checkout_session_id") REFERENCES "public"."checkout_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customer_profiles_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_stock_location_id_stock_locations_id_fk" FOREIGN KEY ("stock_location_id") REFERENCES "public"."stock_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_staff_id_staff_profiles_id_fk" FOREIGN KEY ("created_by_staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_shipping_method_id_shipping_methods_id_fk" FOREIGN KEY ("shipping_method_id") REFERENCES "public"."shipping_methods"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_payment_methods" ADD CONSTRAINT "customer_payment_methods_customer_id_customer_profiles_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_payment_method_id_customer_payment_methods_id_fk" FOREIGN KEY ("customer_payment_method_id") REFERENCES "public"."customer_payment_methods"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_cash_movements" ADD CONSTRAINT "pos_cash_movements_session_id_pos_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pos_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_cash_movements" ADD CONSTRAINT "pos_cash_movements_actor_staff_id_staff_profiles_id_fk" FOREIGN KEY ("actor_staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_receipts" ADD CONSTRAINT "pos_receipts_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_receipts" ADD CONSTRAINT "pos_receipts_session_id_pos_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pos_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_receipts" ADD CONSTRAINT "pos_receipts_cashier_staff_id_staff_profiles_id_fk" FOREIGN KEY ("cashier_staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_registers" ADD CONSTRAINT "pos_registers_location_id_stock_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."stock_locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sessions" ADD CONSTRAINT "pos_sessions_register_id_pos_registers_id_fk" FOREIGN KEY ("register_id") REFERENCES "public"."pos_registers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sessions" ADD CONSTRAINT "pos_sessions_opened_by_staff_id_staff_profiles_id_fk" FOREIGN KEY ("opened_by_staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sessions" ADD CONSTRAINT "pos_sessions_closed_by_staff_id_staff_profiles_id_fk" FOREIGN KEY ("closed_by_staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_recommendation_answers" ADD CONSTRAINT "customer_recommendation_answers_profile_id_customer_recommendation_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."customer_recommendation_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_recommendation_answers" ADD CONSTRAINT "customer_recommendation_answers_question_id_recommendation_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."recommendation_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_recommendation_profiles" ADD CONSTRAINT "customer_recommendation_profiles_customer_id_customer_profiles_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_recommendation_profiles" ADD CONSTRAINT "customer_recommendation_profiles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_events" ADD CONSTRAINT "recommendation_events_customer_id_customer_profiles_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_events" ADD CONSTRAINT "recommendation_events_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_question_choices" ADD CONSTRAINT "recommendation_question_choices_question_id_recommendation_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."recommendation_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_questionnaires" ADD CONSTRAINT "recommendation_questionnaires_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_questions" ADD CONSTRAINT "recommendation_questions_questionnaire_id_recommendation_questionnaires_id_fk" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."recommendation_questionnaires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_tokens_token_hash_idx" ON "auth_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "auth_tokens_user_purpose_idx" ON "auth_tokens" USING btree ("user_id","purpose");--> statement-breakpoint
CREATE INDEX "auth_tokens_expires_at_idx" ON "auth_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "customer_addresses_customer_idx" ON "customer_addresses" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customer_addresses_default_billing_idx" ON "customer_addresses" USING btree ("customer_id") WHERE "customer_addresses"."is_default_billing" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "customer_addresses_default_shipping_idx" ON "customer_addresses" USING btree ("customer_id") WHERE "customer_addresses"."is_default_shipping" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "customer_profiles_user_idx" ON "customer_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customer_profiles_customer_number_idx" ON "customer_profiles" USING btree ("customer_number");--> statement-breakpoint
CREATE INDEX "customer_profiles_phone_idx" ON "customer_profiles" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_key_idx" ON "permissions" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_key_idx" ON "roles" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_profiles_user_idx" ON "staff_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_profiles_staff_number_idx" ON "staff_profiles" USING btree ("staff_number");--> statement-breakpoint
CREATE INDEX "staff_profiles_role_idx" ON "staff_profiles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "staff_profiles_status_idx" ON "staff_profiles" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "user_auth_identities_provider_user_idx" ON "user_auth_identities" USING btree ("provider","provider_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_auth_identities_user_provider_idx" ON "user_auth_identities" USING btree ("user_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX "user_sessions_token_hash_idx" ON "user_sessions" USING btree ("session_token_hash");--> statement-breakpoint
CREATE INDEX "user_sessions_user_idx" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_normalized_email_idx" ON "users" USING btree ("normalized_email");--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_account_type_idx" ON "users" USING btree ("account_type");--> statement-breakpoint
CREATE UNIQUE INDEX "files_storage_key_idx" ON "files" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "files_kind_idx" ON "files" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "files_uploaded_by_idx" ON "files" USING btree ("uploaded_by_user_id");--> statement-breakpoint
CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_full_slug_idx" ON "categories" USING btree ("full_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_sibling_slug_idx" ON "categories" USING btree ("parent_id","slug");--> statement-breakpoint
CREATE INDEX "categories_status_idx" ON "categories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "categories_group_slug_idx" ON "categories" USING btree ("group_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_group_slug_slug_idx" ON "categories" USING btree ("group_slug","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "category_filter_options_filter_value_idx" ON "category_filter_options" USING btree ("filter_id","value");--> statement-breakpoint
CREATE UNIQUE INDEX "category_filters_category_slug_idx" ON "category_filters" USING btree ("category_id","slug");--> statement-breakpoint
CREATE INDEX "category_filters_category_idx" ON "category_filters" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "category_page_content_category_idx" ON "category_page_content" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "homepage_sports_slides_sort_idx" ON "homepage_sports_slides" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "storefront_nav_columns_nav_item_idx" ON "storefront_nav_columns" USING btree ("nav_item_id");--> statement-breakpoint
CREATE INDEX "storefront_nav_items_sort_idx" ON "storefront_nav_items" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "storefront_nav_links_column_idx" ON "storefront_nav_links" USING btree ("column_id");--> statement-breakpoint
CREATE INDEX "storefront_nav_links_category_idx" ON "storefront_nav_links" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "brands_slug_idx" ON "brands" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "brands_name_idx" ON "brands" USING btree ("name");--> statement-breakpoint
CREATE INDEX "product_accordion_bullets_accordion_idx" ON "product_accordion_bullets" USING btree ("accordion_id");--> statement-breakpoint
CREATE INDEX "product_accordion_paragraphs_accordion_idx" ON "product_accordion_paragraphs" USING btree ("accordion_id");--> statement-breakpoint
CREATE INDEX "product_accordions_product_idx" ON "product_accordions" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_attribute_values_attribute_value_idx" ON "product_attribute_values" USING btree ("attribute_id","value");--> statement-breakpoint
CREATE UNIQUE INDEX "product_attributes_product_slug_idx" ON "product_attributes" USING btree ("product_id","slug");--> statement-breakpoint
CREATE INDEX "product_categories_category_idx" ON "product_categories" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_content_sections_product_key_idx" ON "product_content_sections" USING btree ("product_id","key");--> statement-breakpoint
CREATE INDEX "product_images_product_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_media_product_idx" ON "product_media" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_media_file_idx" ON "product_media" USING btree ("file_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_media_primary_per_product_idx" ON "product_media" USING btree ("product_id") WHERE "product_media"."is_primary" = true;--> statement-breakpoint
CREATE INDEX "product_option_groups_product_idx" ON "product_option_groups" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_option_values_group_idx" ON "product_option_values" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "product_payment_promos_product_idx" ON "product_payment_promos" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_recommendations_pair_idx" ON "product_recommendations" USING btree ("product_id","recommended_product_id","source");--> statement-breakpoint
CREATE INDEX "product_recommendations_product_idx" ON "product_recommendations" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_recommendations_simple_product_idx" ON "product_recommendations_simple" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_specifications_product_idx" ON "product_specifications" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_specifications_filter_idx" ON "product_specifications" USING btree ("name","value_normalized");--> statement-breakpoint
CREATE UNIQUE INDEX "product_tags_slug_idx" ON "product_tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "product_variant_media_variant_idx" ON "product_variant_media" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variant_media_primary_per_variant_idx" ON "product_variant_media" USING btree ("variant_id") WHERE "product_variant_media"."is_primary" = true;--> statement-breakpoint
CREATE INDEX "product_variant_options_value_idx" ON "product_variant_options" USING btree ("attribute_value_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_sku_idx" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_barcode_idx" ON "product_variants" USING btree ("barcode");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_product_signature_idx" ON "product_variants" USING btree ("product_id","option_signature");--> statement-breakpoint
CREATE INDEX "product_variants_product_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variants_status_idx" ON "product_variants" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_default_per_product_idx" ON "product_variants" USING btree ("product_id") WHERE "product_variants"."is_default" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_primary_category_idx" ON "products" USING btree ("primary_category_id");--> statement-breakpoint
CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_featured_idx" ON "products" USING btree ("is_featured");--> statement-breakpoint
CREATE UNIQUE INDEX "promotions_slug_idx" ON "promotions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "promotions_active_idx" ON "promotions" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_count_items_session_variant_idx" ON "inventory_count_items" USING btree ("count_session_id","variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_count_sessions_number_idx" ON "inventory_count_sessions" USING btree ("count_number");--> statement-breakpoint
CREATE INDEX "inventory_count_sessions_location_idx" ON "inventory_count_sessions" USING btree ("location_id");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_items_variant_location_idx" ON "inventory_items" USING btree ("variant_id","location_id");--> statement-breakpoint
CREATE INDEX "inventory_items_location_idx" ON "inventory_items" USING btree ("location_id");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_reservations_number_idx" ON "inventory_reservations" USING btree ("reservation_number");--> statement-breakpoint
CREATE INDEX "inventory_reservations_variant_location_idx" ON "inventory_reservations" USING btree ("variant_id","location_id");--> statement-breakpoint
CREATE INDEX "inventory_reservations_source_idx" ON "inventory_reservations" USING btree ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "inventory_reservations_expires_at_idx" ON "inventory_reservations" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "purchase_order_items_po_variant_idx" ON "purchase_order_items" USING btree ("purchase_order_id","variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "purchase_orders_number_idx" ON "purchase_orders" USING btree ("po_number");--> statement-breakpoint
CREATE INDEX "purchase_orders_supplier_idx" ON "purchase_orders" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_commits_number_idx" ON "stock_commits" USING btree ("commit_number");--> statement-breakpoint
CREATE INDEX "stock_commits_source_idx" ON "stock_commits" USING btree ("source_type","source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_commits_idempotency_idx" ON "stock_commits" USING btree ("idempotency_key") WHERE "stock_commits"."idempotency_key" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "stock_locations_code_idx" ON "stock_locations" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_locations_default_idx" ON "stock_locations" USING btree ("is_default") WHERE "stock_locations"."is_default" = true;--> statement-breakpoint
CREATE INDEX "stock_movements_variant_created_idx" ON "stock_movements" USING btree ("variant_id","created_at");--> statement-breakpoint
CREATE INDEX "stock_movements_source_idx" ON "stock_movements" USING btree ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "stock_movements_commit_idx" ON "stock_movements" USING btree ("commit_id");--> statement-breakpoint
CREATE INDEX "suppliers_name_idx" ON "suppliers" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_cart_variant_idx" ON "cart_items" USING btree ("cart_id","variant_id");--> statement-breakpoint
CREATE INDEX "carts_customer_idx" ON "carts" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "carts_guest_token_idx" ON "carts" USING btree ("guest_token_hash") WHERE "carts"."guest_token_hash" is not null;--> statement-breakpoint
CREATE INDEX "carts_status_idx" ON "carts" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_sessions_number_idx" ON "checkout_sessions" USING btree ("session_number");--> statement-breakpoint
CREATE INDEX "checkout_sessions_cart_idx" ON "checkout_sessions" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "checkout_sessions_customer_idx" ON "checkout_sessions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "checkout_sessions_expires_at_idx" ON "checkout_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "discount_redemptions_discount_order_idx" ON "discount_redemptions" USING btree ("discount_id","order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "discounts_code_idx" ON "discounts" USING btree ("code");--> statement-breakpoint
CREATE INDEX "discounts_active_idx" ON "discounts" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "order_addresses_order_type_idx" ON "order_addresses" USING btree ("order_id","type");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_variant_idx" ON "order_items" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "order_return_items_return_item_idx" ON "order_return_items" USING btree ("return_id","order_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "order_returns_number_idx" ON "order_returns" USING btree ("return_number");--> statement-breakpoint
CREATE INDEX "order_returns_order_idx" ON "order_returns" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_status_history_order_idx" ON "order_status_history" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_number_idx" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "orders_source_idx" ON "orders" USING btree ("source");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_payment_status_idx" ON "orders" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "shipments_order_idx" ON "shipments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "shipments_tracking_idx" ON "shipments" USING btree ("tracking_number");--> statement-breakpoint
CREATE UNIQUE INDEX "shipping_methods_code_idx" ON "shipping_methods" USING btree ("code");--> statement-breakpoint
CREATE INDEX "customer_payment_methods_customer_idx" ON "customer_payment_methods" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customer_payment_methods_provider_method_idx" ON "customer_payment_methods" USING btree ("provider","provider_payment_method_id") WHERE "customer_payment_methods"."provider_payment_method_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "customer_payment_methods_default_idx" ON "customer_payment_methods" USING btree ("customer_id") WHERE "customer_payment_methods"."is_default" = true;--> statement-breakpoint
CREATE INDEX "payment_events_payment_idx" ON "payment_events" USING btree ("payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_events_provider_event_idx" ON "payment_events" USING btree ("provider","provider_event_id") WHERE "payment_events"."provider_event_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "payment_refunds_number_idx" ON "payment_refunds" USING btree ("refund_number");--> statement-breakpoint
CREATE INDEX "payment_refunds_payment_idx" ON "payment_refunds" USING btree ("payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_number_idx" ON "payments" USING btree ("payment_number");--> statement-breakpoint
CREATE INDEX "payments_order_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payments_provider_reference_idx" ON "payments" USING btree ("provider","provider_reference");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_idempotency_idx" ON "payments" USING btree ("idempotency_key") WHERE "payments"."idempotency_key" is not null;--> statement-breakpoint
CREATE INDEX "pos_cash_movements_session_idx" ON "pos_cash_movements" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pos_receipts_number_idx" ON "pos_receipts" USING btree ("receipt_number");--> statement-breakpoint
CREATE UNIQUE INDEX "pos_receipts_order_idx" ON "pos_receipts" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "pos_receipts_session_idx" ON "pos_receipts" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pos_registers_code_idx" ON "pos_registers" USING btree ("code");--> statement-breakpoint
CREATE INDEX "pos_registers_location_idx" ON "pos_registers" USING btree ("location_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pos_sessions_number_idx" ON "pos_sessions" USING btree ("session_number");--> statement-breakpoint
CREATE INDEX "pos_sessions_register_idx" ON "pos_sessions" USING btree ("register_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pos_sessions_open_register_idx" ON "pos_sessions" USING btree ("register_id") WHERE "pos_sessions"."status" = 'open';--> statement-breakpoint
CREATE UNIQUE INDEX "customer_recommendation_answers_profile_question_idx" ON "customer_recommendation_answers" USING btree ("profile_id","question_id");--> statement-breakpoint
CREATE INDEX "customer_recommendation_profiles_customer_idx" ON "customer_recommendation_profiles" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_recommendation_profiles_guest_idx" ON "customer_recommendation_profiles" USING btree ("guest_token_hash");--> statement-breakpoint
CREATE INDEX "recommendation_events_customer_idx" ON "recommendation_events" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "recommendation_events_product_idx" ON "recommendation_events" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "recommendation_events_shown_at_idx" ON "recommendation_events" USING btree ("shown_at");--> statement-breakpoint
CREATE UNIQUE INDEX "recommendation_question_choices_question_value_idx" ON "recommendation_question_choices" USING btree ("question_id","value");--> statement-breakpoint
CREATE UNIQUE INDEX "recommendation_questionnaires_slug_idx" ON "recommendation_questionnaires" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "recommendation_questionnaires_category_idx" ON "recommendation_questionnaires" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "recommendation_questions_questionnaire_key_idx" ON "recommendation_questions" USING btree ("questionnaire_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "recommendation_settings_key_idx" ON "recommendation_settings" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_prefix_idx" ON "api_keys" USING btree ("prefix");--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_hashed_key_idx" ON "api_keys" USING btree ("hashed_key");--> statement-breakpoint
CREATE INDEX "api_keys_status_idx" ON "api_keys" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_provider_configs_provider_idx" ON "payment_provider_configs" USING btree ("provider");--> statement-breakpoint
CREATE UNIQUE INDEX "system_settings_key_idx" ON "system_settings" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_events_provider_event_idx" ON "webhook_events" USING btree ("provider","event_id") WHERE "webhook_events"."event_id" is not null;--> statement-breakpoint
CREATE INDEX "webhook_events_received_at_idx" ON "webhook_events" USING btree ("received_at");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_target_idx" ON "audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "wishlist_items_user_product_idx" ON "wishlist_items" USING btree ("user_id","product_id");--> statement-breakpoint
CREATE INDEX "wishlist_items_user_idx" ON "wishlist_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wishlist_items_product_idx" ON "wishlist_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "woo_orders_email_idx" ON "woo_orders" USING btree ("email");--> statement-breakpoint
CREATE INDEX "woo_orders_status_idx" ON "woo_orders" USING btree ("status");