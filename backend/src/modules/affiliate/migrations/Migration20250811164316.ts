import { Migration } from '@mikro-orm/migrations';

export class Migration20250811164316 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "affiliate_partner" drop constraint if exists "affiliate_partner_affiliate_code_unique";`);
    this.addSql(`alter table if exists "affiliate_partner" drop constraint if exists "affiliate_partner_email_unique";`);
    this.addSql(`create table if not exists "affiliate_click" ("id" text not null, "affiliate_code" text not null, "product_id" text null, "ip_address" text null, "user_agent" text null, "referrer_url" text null, "session_id" text null, "converted" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "affiliate_click_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_click_deleted_at" ON "affiliate_click" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "affiliate_conversion" ("id" text not null, "affiliate_code" text not null, "order_id" text not null, "order_total" numeric not null, "commission_rate" numeric not null, "commission_amount" numeric not null, "status" text check ("status" in ('pending', 'confirmed', 'cancelled', 'paid')) not null default 'pending', "click_id" text null, "paid_at" timestamptz null, "payment_reference" text null, "raw_order_total" jsonb not null, "raw_commission_rate" jsonb not null, "raw_commission_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "affiliate_conversion_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_conversion_deleted_at" ON "affiliate_conversion" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "affiliate_partner" ("id" text not null, "name" text not null, "email" text not null, "password" text not null, "phone" text null, "company" text null, "affiliate_code" text not null, "referral_link" text not null, "referred_by_code" text null, "status" text check ("status" in ('pending', 'approved', 'rejected', 'suspended')) not null default 'pending', "commission_rate" numeric not null default 0.08, "website" text null, "social_media" text null, "address" text null, "account_name" text null, "bank_code" text null, "account_number" text null, "tax_id" text null, "notes" text null, "approved_at" timestamptz null, "approved_by" text null, "raw_commission_rate" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "affiliate_partner_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_affiliate_partner_email_unique" ON "affiliate_partner" (email) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_affiliate_partner_affiliate_code_unique" ON "affiliate_partner" (affiliate_code) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_partner_deleted_at" ON "affiliate_partner" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "affiliate_click" cascade;`);

    this.addSql(`drop table if exists "affiliate_conversion" cascade;`);

    this.addSql(`drop table if exists "affiliate_partner" cascade;`);
  }

}
