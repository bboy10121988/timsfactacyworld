import { Migration } from '@mikro-orm/migrations';

export class Migration20250805032433 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "affiliate_partner" drop constraint if exists "affiliate_partner_affiliate_code_unique";`);
    this.addSql(`alter table if exists "affiliate_partner" drop constraint if exists "affiliate_partner_email_unique";`);
    this.addSql(`create table if not exists "affiliate_partner" ("id" text not null, "email" text not null, "name" text not null, "company" text null, "phone" text null, "affiliate_code" text not null, "referral_link" text null, "commission_rate" integer not null default 0.05, "commission_type" text check ("commission_type" in ('percentage', 'fixed')) not null default 'percentage', "min_payout_amount" integer not null default 1000, "status" text check ("status" in ('pending', 'active', 'suspended', 'terminated')) not null default 'pending', "approved_at" timestamptz null, "bank_account" text null, "bank_code" text null, "account_holder" text null, "total_earnings" integer not null default 0, "paid_earnings" integer not null default 0, "pending_earnings" integer not null default 0, "total_referrals" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "affiliate_partner_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_affiliate_partner_email_unique" ON "affiliate_partner" (email) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_affiliate_partner_affiliate_code_unique" ON "affiliate_partner" (affiliate_code) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_partner_deleted_at" ON "affiliate_partner" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "affiliate_payment" ("id" text not null, "affiliate_partner_id" text not null, "amount" integer not null, "currency" text not null default 'TWD', "payment_method" text check ("payment_method" in ('bank_transfer', 'paypal', 'stripe')) not null default 'bank_transfer', "referral_ids" jsonb not null, "period_start" timestamptz not null, "period_end" timestamptz not null, "status" text check ("status" in ('pending', 'processing', 'completed', 'failed')) not null default 'pending', "bank_account" text null, "bank_code" text null, "account_holder" text null, "processed_at" timestamptz null, "payment_reference" text null, "failure_reason" text null, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "affiliate_payment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_payment_deleted_at" ON "affiliate_payment" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "affiliate_referral" ("id" text not null, "affiliate_partner_id" text not null, "order_id" text null, "customer_id" text null, "referral_code" text not null, "clicked_at" timestamptz not null, "converted_at" timestamptz null, "order_total" integer null, "commission_amount" integer null, "commission_rate" integer null, "status" text check ("status" in ('pending', 'confirmed', 'paid', 'cancelled')) not null default 'pending', "ip_address" text null, "user_agent" text null, "referrer_url" text null, "landing_page" text null, "paid_at" timestamptz null, "payment_reference" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "affiliate_referral_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_referral_deleted_at" ON "affiliate_referral" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "affiliate_partner" cascade;`);

    this.addSql(`drop table if exists "affiliate_payment" cascade;`);

    this.addSql(`drop table if exists "affiliate_referral" cascade;`);
  }

}
