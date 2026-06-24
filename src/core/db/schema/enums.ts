import { pgEnum } from "drizzle-orm/pg-core";

export const accountTypeEnum = pgEnum("account_type", ["customer", "staff", "both"]);
export const userStatusEnum = pgEnum("user_status", ["active", "disabled", "invited", "pending_verification"]);
export const accountStatusEnum = pgEnum("account_status", ["incomplete", "active"]);
export const authProviderEnum = pgEnum("auth_provider", ["credentials", "supabase", "google", "phone_otp"]);
export const tokenPurposeEnum = pgEnum("token_purpose", ["email_verification", "password_reset", "staff_invite", "customer_invite"]);

export const addressTypeEnum = pgEnum("address_type", ["billing", "shipping", "both"]);
export const staffStatusEnum = pgEnum("staff_status", ["active", "disabled", "invited"]);

export const fileKindEnum = pgEnum("file_kind", ["image", "document", "video", "other"]);
export const fileAccessEnum = pgEnum("file_access", ["public", "private"]);
export const imageOrientationEnum = pgEnum("image_orientation", ["portrait", "landscape", "square", "unknown"]);

export const categoryStatusEnum = pgEnum("category_status", ["active", "inactive", "hidden"]);
export const productStatusEnum = pgEnum("product_status", ["draft", "active", "inactive", "archived"]);
export const variantStatusEnum = pgEnum("variant_status", ["active", "inactive", "archived"]);
export const attributeDisplayTypeEnum = pgEnum("attribute_display_type", ["button", "color", "dropdown"]);
export const contentSectionTypeEnum = pgEnum("content_section_type", ["bullets", "paragraphs", "rich_text", "html", "json"]);

export const productPromoLabelEnum = pgEnum("product_promo_label", ["none", "new_arrival", "best_seller"]);

export const promotionTypeEnum = pgEnum("promotion_type", ["payment", "product", "category", "order", "shipping"]);
export const promotionDiscountTypeEnum = pgEnum("promotion_discount_type", ["percent", "fixed_amount", "free_shipping", "message_only"]);

export const inventoryLocationTypeEnum = pgEnum("inventory_location_type", ["store", "warehouse", "virtual"]);
export const inventoryReservationStatusEnum = pgEnum("inventory_reservation_status", ["active", "committed", "released", "expired", "cancelled"]);
export const stockCommitStatusEnum = pgEnum("stock_commit_status", ["pending", "committed", "rolled_back"]);
export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
  "initial",
  "receive",
  "adjustment",
  "reservation",
  "release",
  "sale",
  "cancellation",
  "return",
  "refund",
  "transfer_in",
  "transfer_out",
  "damage",
  "loss",
]);
export const stockSourceTypeEnum = pgEnum("stock_source_type", [
  "online_order",
  "pos_order",
  "manual_adjustment",
  "purchase_order",
  "stock_count",
  "return",
  "transfer",
  "system",
]);
export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", ["draft", "ordered", "partially_received", "received", "cancelled"]);
export const inventoryCountStatusEnum = pgEnum("inventory_count_status", ["draft", "in_progress", "completed", "cancelled"]);

export const cartStatusEnum = pgEnum("cart_status", ["active", "converted", "abandoned", "expired"]);
export const checkoutSessionStatusEnum = pgEnum("checkout_session_status", ["open", "payment_pending", "completed", "cancelled", "expired"]);
export const orderSourceEnum = pgEnum("order_source", ["online", "pos", "admin"]);
export const orderStatusEnum = pgEnum("order_status", [
  "draft",
  "pending_payment",
  "staged",
  "confirmed",
  "processing",
  "ready_for_pickup",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
  "partially_refunded",
]);
export const fulfillmentStatusEnum = pgEnum("fulfillment_status", ["unfulfilled", "partial", "fulfilled", "cancelled", "returned"]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "pending", "authorized", "paid", "failed", "cancelled", "refunded", "partially_refunded"]);

export const paymentProviderEnum = pgEnum("payment_provider", ["genie", "koko", "mintpay", "cash", "card_manual", "bank_transfer", "store_credit", "other"]);
export const paymentMethodTypeEnum = pgEnum("payment_method_type", ["card", "wallet", "installment", "cash", "bank_transfer", "other"]);
export const paymentEventTypeEnum = pgEnum("payment_event_type", ["request", "redirect", "callback", "webhook", "status_check", "refund"]);
export const refundStatusEnum = pgEnum("refund_status", ["pending", "succeeded", "failed", "cancelled"]);

export const shipmentStatusEnum = pgEnum("shipment_status", ["pending", "packed", "shipped", "delivered", "failed", "returned", "cancelled"]);
export const returnStatusEnum = pgEnum("return_status", ["requested", "approved", "rejected", "received", "refunded", "cancelled"]);

export const posSessionStatusEnum = pgEnum("pos_session_status", ["open", "closed"]);
export const cashMovementTypeEnum = pgEnum("cash_movement_type", ["opening", "closing", "cash_in", "cash_out", "drop", "adjustment"]);

export const recommendationSourceEnum = pgEnum("recommendation_source", ["manual", "same_category", "same_brand", "answers", "history", "bestseller"]);
export const recommendationQuestionTypeEnum = pgEnum("recommendation_question_type", ["single_choice", "multi_choice", "number", "text", "boolean"]);

export const settingValueTypeEnum = pgEnum("setting_value_type", ["string", "number", "boolean", "json", "secret_ref"]);
export const apiKeyStatusEnum = pgEnum("api_key_status", ["active", "revoked"]);
