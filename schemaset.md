# Kintehobe Database Schema

This document describes the database design only: values, ownership, and connections between records. It is derived from the current Drizzle definitions in `src/db/schema`. Names below are database table and column names, not TypeScript property names.

## Notation

- `PK`: primary key.
- `FK -> table.column`: foreign key.
- `nullable`: value may be absent.
- `default`: database/application default.
- `jsonb`: structured JSON value.
- `vector(1028)`: embedding vector with 1,028 dimensions.
- Money fields ending in `_cents` are integer minor units. Product `price` fields are numeric(12,2).

## Value Enums

| Enum | Allowed values |
| --- | --- |
| `product_status` | `active`, `draft`, `archived` |
| `product_variant_kind` | `base`, `color`, `size`, `custom` |
| `follow_status` | `pending`, `accepted`, `rejected` |
| `order_status` | `pending_payment`, `paid`, `awaiting_cod`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded` |
| `payment_method` | `stripe`, `cash_on_delivery`, `online` |
| `transaction_status` | `pending`, `succeeded`, `failed`, `refunded` |
| `notification_type` | `order_placed`, `order_status_changed`, `order_cancelled`, `order_refunded`, `order_delivered` |
| `legal_page_type` | `about_us`, `terms_of_service`, `privacy_policy`, `cookie_policy` |
| `feedback_priority` | `low`, `medium`, `high`, `urgent` |
| `activity_type` | `order_placed`, `review_submitted` |

## Identity and Authentication

### `user`

Central identity record. Many commerce, content, support, and activity records reference it.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | User identifier. |
| `name` | text, required | Display name. |
| `email` | text, required, unique | Login/contact email. |
| `email_verified` | boolean, required, default `false` | Email verification state. |
| `image` | text, nullable | Profile image reference. |
| `created_at`, `updated_at` | timestamp, required, default now | Lifecycle timestamps. |
| `role` | text, nullable | Application role. |
| `banned` | boolean, nullable, default `false` | Ban state. |
| `ban_reason` | text, nullable | Ban reason. |
| `ban_expires` | timestamp, nullable | Ban expiry. |

### `session`

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Session identifier. |
| `expires_at` | timestamp, required | Session expiry. |
| `token` | text, required, unique | Session token. |
| `created_at`, `updated_at` | timestamp, required | Lifecycle timestamps. |
| `ip_address`, `user_agent` | text, nullable | Request metadata. |
| `user_id` | text, required, FK -> `user.id`, delete cascades | Owner. |
| `impersonated_by` | text, nullable | Optional administrator identifier. |

One user has many sessions.

### `account`

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Account record identifier. |
| `account_id`, `provider_id` | text, required | Provider-side account and provider name. |
| `user_id` | text, required, FK -> `user.id`, delete cascades | Owner. |
| `access_token`, `refresh_token`, `id_token`, `scope`, `password` | text, nullable | Provider or credential data. |
| `access_token_expires_at`, `refresh_token_expires_at` | timestamp, nullable | Token expiry. |
| `created_at`, `updated_at` | timestamp, required | Lifecycle timestamps. |

One user has many accounts.

### `verification`

Temporary verification values. It has no user FK; `identifier` is the lookup key.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Verification identifier. |
| `identifier`, `value` | text, required | Verification subject and value/token. |
| `expires_at` | timestamp, required | Expiry. |
| `created_at`, `updated_at` | timestamp, required | Lifecycle timestamps. |

## Catalog

### `category`

Hierarchical product grouping. A category may have one parent and many children.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Category identifier. |
| `parent_id` | text, nullable, self-FK -> `category.id`, delete sets null | Parent category. |
| `name` | text, required, unique | Category name. |
| `slug` | text, required, unique | URL identifier. |
| `description`, `image`, `banner` | text, nullable | Presentation content. |
| `is_active` | boolean, nullable, default `true` | Visibility state. |
| `meta_title`, `meta_description` | text, nullable, default empty | SEO metadata. |
| `created_at`, `updated_at` | timestamp, required | Lifecycle timestamps. |

### `product`

Product identity and merchandising state. Sellable details live in `product_variant`.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Product identifier. |
| `slug` | text, required, unique | URL identifier. |
| `category_id` | text, required, FK -> `category.id`, delete restricted | Product category. |
| `status` | `product_status`, required, default `draft` | Publication state. |
| `variant_ids` | jsonb string array, required, default `[]` | Denormalized variant IDs. |
| `created_at`, `updated_at` | timestamp, required | Lifecycle timestamps. |

One product belongs to one category and has many variants, reviews, wishlist rows, embeddings, and visits.

### `product_variant`

Specific purchasable/configurable version of a product.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Variant identifier. |
| `group_id` | text, required, FK -> `product.id`, delete cascades | Parent product. |
| `code`, `sku` | text, nullable | Internal/inventory identifiers. |
| `price` | numeric(12,2), required | Current price. |
| `compare_at_price` | numeric(12,2), nullable | Reference/previous price. |
| `stock_quantity` | integer, required | Available stock. |
| `weight`, `details` | text, nullable | Shipping and descriptive data. |
| `metadata` | jsonb array, required, default `[]` | Structured attributes. |
| `position` | integer, required, default `0` | Display ordering. |
| `kind` | `product_variant_kind`, required | Variant kind. |
| `enabled` | boolean, required, default `true` | Usability state. |
| `title`, `option_name` | text, nullable | Display labels. |
| `images` | jsonb string array, required, default `[]` | Image references. |
| `body_search` | generated `tsvector`, required | Full-text value from title/details. |
| `created_at`, `updated_at` | timestamp, required | Lifecycle timestamps. |

Each variant belongs to one product.

### `product_embed`

Semantic search/RAG chunks associated with a product and optionally a variant.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | uuid, PK, default random | Embedding identifier. |
| `content` | text, required | Embedded text. |
| `embedding` | vector(1028), required | Semantic vector. |
| `variant_id` | text, nullable, FK -> `product_variant.id`, delete/update cascades | Optional variant source. |
| `product_id` | text, nullable, FK -> `product.id`, delete/update cascades | Optional product source. |

### `review`

User-authored product review. Product is optional; author is required.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Review identifier. |
| `product_id` | text, nullable, FK -> `product.id`, delete cascades | Reviewed product. |
| `author_id` | text, required, FK -> `user.id`, delete cascades | Author. |
| `ratingFloat` | real, required, default `0` | Numeric rating. |
| `reviewText` | text, required | Review body. |
| `created_at` | timestamp, required, default now | Creation time. |

### `wishlist`

User/product join table. (`user_id`, `product_id`) is unique.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Wishlist row identifier. |
| `product_id` | text, required, FK -> `product.id`, delete cascades | Saved product. |
| `user_id` | text, required, FK -> `user.id`, delete cascades | Saving user. |
| `created_at` | timestamp, required, default now | Save time. |

## Social and Customer Records

### `follow_relation`

Directed user-to-user relationship. (`follower_id`, `following_id`) is unique.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Relationship identifier. |
| `follower_id` | text, required, FK -> `user.id`, delete cascades | Initiating user. |
| `following_id` | text, required, FK -> `user.id`, delete cascades | Target user. |
| `status` | `follow_status`, required, default `pending` | Relationship state. |
| `created_at`, `updated_at` | timestamp, required | Lifecycle timestamps. |

### `user_addresses`

Saved address owned by a user.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Address identifier. |
| `user_id` | text, required, FK -> `user.id`, delete cascades | Owner. |
| `label` | text, required | Address label. |
| `recipient_name` | text, nullable | Recipient. |
| `phone` | text, required | Contact phone. |
| `district`, `city`, `area`, `country` | text, required | Location. |
| `zip_code` | text, nullable | Postal code. |
| `address_line` | text, required | Street/address. |
| `is_default` | boolean, required, default `false` | Default flag. |
| `created_at` | timestamp, required, default now | Creation time. |

### `notification`

User-specific notification inbox.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Notification identifier. |
| `user_id` | text, required, FK -> `user.id`, delete cascades | Recipient. |
| `type` | `notification_type`, required | Event type. |
| `title`, `body` | text, required | Display content. |
| `metadata` | jsonb object, nullable | Event-specific data. |
| `is_read` | boolean, required, default `false` | Read state. |
| `read_at` | timestamp, nullable | Read time. |
| `created_at` | timestamp, required, default now | Creation time. |

## Orders and Payments

### `order`

Checkout/order aggregate. Shipping fields are historical snapshots.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Order identifier. |
| `user_id` | text, nullable, FK -> `user.id`, delete sets null | Optional account owner; supports guest orders. |
| `email` | text, required | Customer email snapshot. |
| `status` | `order_status`, required, default `pending_payment` | Fulfillment/payment state. |
| `shipping_name`, `shipping_phone`, `shipping_address`, `shipping_city`, `shipping_state`, `shipping_zip`, `shipping_country` | text, required | Shipping snapshot. |
| `subtotal_cents`, `tax_cents`, `shipping_cents`, `total_cents` | integer, required | Money totals; shipping defaults to `0`. |
| `payment_method` | `payment_method`, required, default `stripe` | Payment route. |
| `stripe_session_id` | text, nullable, unique | Stripe checkout session. |
| `created_at`, `updated_at` | timestamp, required | Lifecycle timestamps. |

One order has many `order_item` rows and at most one `transaction`.

### `order_item`

Immutable product/variant snapshot inside an order. `product_id` and `variant_id` are logical references only and have no database FKs.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Line-item identifier. |
| `order_id` | text, required, FK -> `order.id`, delete cascades | Parent order. |
| `product_id`, `variant_id` | text, required | Purchased catalog IDs. |
| `product_title` | text, required | Product title snapshot. |
| `variant_title` | text, nullable | Variant title snapshot. |
| `sku` | text, nullable | SKU snapshot. |
| `quantity` | integer, required | Units. |
| `unit_price_cents`, `line_total_cents` | integer, required | Price snapshots in minor units. |
| `image_url` | text, nullable | Image snapshot/reference. |

### `transaction`

Payment record. `order_id` is unique, so an order has at most one transaction.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Transaction identifier. |
| `order_id` | text, required, unique, FK -> `order.id`, delete cascades | Related order. |
| `stripe_session_id` | text, nullable, unique | Stripe checkout session. |
| `stripe_payment_intent_id` | text, nullable | Stripe payment intent. |
| `online_payment_id`, `payment_provider` | text, nullable | Other provider identifiers. |
| `amount_cents` | integer, required | Payment amount. |
| `currency` | text, required, default `usd` | Currency code. |
| `status` | `transaction_status`, required, default `pending` | Payment state. |
| `created_at`, `updated_at` | timestamp, required | Lifecycle timestamps. |

### `fraud`

Fraud review linked to an order and transaction.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | uuid, PK | Fraud record identifier. |
| `order_id` | text, required, FK -> `order.id`, delete cascades | Related order. |
| `transaction_id` | text, required, FK -> `transaction.id`, delete cascades | Related transaction. |
| `current_status` | text, required, default `pending` | Fraud workflow state. |
| `resolved_by` | text, nullable, FK -> `user.id`, delete sets null | Resolving administrator. |
| `created_at`, `updated_at` | timestamp, required | Lifecycle timestamps. |

## Legal, Help, and Support Content

### `legal_content`

Editable text for one legal page. `page_type` is unique.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | uuid, PK, default random | Content identifier. |
| `page_type` | `legal_page_type`, required, unique | Page identity. |
| `title`, `content`, `meta_description` | text, required, default empty | Page and SEO content. |
| `is_published` | boolean, required, default `false` | Publication state. |
| `updated_at` | timestamp, required, default now | Last update. |
| `updated_by` | text, nullable, FK -> `user.id`, delete sets null | Editor. |

### `legal_document`

Uploaded legal file.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | uuid, PK, default random | Document identifier. |
| `page_type` | `legal_page_type`, required | Legal page category. |
| `file_name`, `file_path` | text, required | File metadata. |
| `file_size` | integer, required | File size. |
| `is_active` | boolean, required, default `false` | Active document flag. |
| `uploaded_at` | timestamp, required, default now | Upload time. |
| `uploaded_by` | text, nullable, FK -> `user.id`, delete sets null | Uploader. |

### `legal_embed`

Embedding chunks for a legal document.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | uuid, PK, default random | Embedding identifier. |
| `content` | text, required | Text chunk. |
| `embedding` | vector(1028), required | Semantic vector. |
| `document` | uuid, nullable, FK -> `legal_document.id`, delete/update cascades | Source document. |

### `faq`

Standalone frequently asked question content.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | uuid, PK, default random | FAQ identifier. |
| `question`, `answer` | text, required | FAQ content. |
| `category` | text, nullable | Display grouping. |
| `order` | integer, required, default `0` | Display order. |
| `is_published` | boolean, required, default `true` | Visibility. |
| `created_at`, `updated_at` | timestamp, required | Lifecycle timestamps. |

### `manager_feedback`

Manager/admin feedback record.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | uuid, PK, default random | Feedback identifier. |
| `manager_id` | text, required, FK -> `user.id`, delete cascades | Submitting manager. |
| `title`, `subject`, `description` | text, required | Feedback content. |
| `priority` | `feedback_priority`, required, default `medium` | Handling priority. |
| `created_at`, `updated_at` | timestamp, required | Lifecycle timestamps. |

### `support_message`

Customer support message from a user.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | uuid, PK, default random | Message identifier. |
| `user_id` | text, required, FK -> `user.id`, delete cascades | Sender. |
| `subject`, `message` | text, required | Support content. |
| `created_at` | timestamp, required, default now | Creation time. |

## Activity and Discovery

### `activity`

User activity event. `entity_id` is polymorphic: its target depends on `type`.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Activity identifier. |
| `actor_id` | text, required, FK -> `user.id`, delete cascades | Acting user. |
| `type` | `activity_type`, required | Event kind. |
| `entity_id` | text, required, logical target ID | Related order/review ID according to type. |
| `meta_data` | jsonb, required | Event-specific data. |
| `created_at` | timestamp, required, default now | Event time. |

### `activity_read`

Per-user activity read receipt. (`user_id`, `activity_id`) is unique.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Receipt identifier. |
| `user_id` | text, required, FK -> `user.id`, delete cascades | Reader. |
| `activity_id` | text, required, FK -> `activity.id`, delete cascades | Read activity. |
| `read_at` | timestamp, required, default now | Read time. |

### `search_history`

Search event optionally owned by a signed-in user.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Search identifier. |
| `query` | text, required | Search text. |
| `search_type` | text, nullable | Search mode/category. |
| `author_id` | text, nullable, FK -> `user.id`, delete cascades | Optional searching user. |
| `created_at` | timestamp, required, default now | Search time. |

### `product_visit`

Product view event. Both references are nullable for anonymous browsing or deleted records.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Visit identifier. |
| `product_id` | text, nullable, FK -> `product.id`, delete cascades | Viewed product. |
| `visitor_id` | text, nullable, FK -> `user.id`, delete cascades | Optional signed-in visitor. |
| `created_at` | timestamp, required, default now | Visit time. |

### `promotion`

Standalone promotional/banner content with no foreign keys.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | text, PK | Promotion identifier. |
| `promotion_title` | text, required | Title/label. |
| `promotion_url` | text, nullable | Destination URL. |
| `appearance` | text, required | Appearance configuration/value. |
| `variant` | text, nullable | Presentation variant. |
| `created_at` | timestamp, required, default now | Creation time. |

### `revenue_goal`

One revenue target per calendar month. (`month`, `year`) is unique.

| Column | Type and rules | Meaning |
| --- | --- | --- |
| `id` | uuid, PK, default random | Goal identifier. |
| `target_cents` | integer, required | Revenue target in minor units. |
| `month` | integer, required | Calendar month number. |
| `year` | integer, required | Calendar year. |
| `created_at`, `updated_at` | timestamp, required | Lifecycle timestamps. |

## Relationship Map

```text
user
├── session, account
├── follow_relation (follower_id and following_id)
├── review, wishlist, notification, user_addresses
├── order (optional owner), support_message, manager_feedback
├── legal_content/legal_document (editor/uploader)
├── activity, activity_read, search_history, product_visit
└── fraud (resolver)

category
├── category (parent/children)
└── product
    ├── product_variant
    │   └── product_embed (optional variant source)
    ├── product_embed (optional product source)
    ├── review
    ├── wishlist
    └── product_visit

order
├── order_item
├── transaction (one-to-one)
└── fraud

legal_document
└── legal_embed

activity
└── activity_read
```

## Integrity and Modeling Notes

- Product deletion cascades to variants, reviews, wishlists, embeds, and visits. Category deletion is restricted while products reference it.
- User deletion cascades authentication sessions/accounts, social and customer-owned records, notifications, reviews, and activity. Order ownership and legal audit fields are preserved by setting their user FK to null where configured.
- Orders preserve customer/shipping and line-item snapshots. `order_item.product_id` and `order_item.variant_id` are logical references only, not database-enforced FKs.
- Embedding tables use HNSW cosine indexes for semantic retrieval.
- The current TypeScript source defines `fraud.current_status` as text. Older generated SQL may show a `status` enum instead; use the TypeScript schema as the current contract and reconcile migrations before deployment.
- The current source also includes activity, embedding, promotion, search-history, and product-visit tables that may not exist in the oldest migration snapshot.
