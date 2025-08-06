import { Migration } from '@mikro-orm/migrations';

export class Migration20250806092157 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "affiliate_partner" drop constraint if exists "affiliate_partner_status_check";`);

    this.addSql(`alter table if exists "affiliate_partner" add column if not exists "password" text not null, add column if not exists "rejection_reason" text null;`);
    this.addSql(`alter table if exists "affiliate_partner" add constraint "affiliate_partner_status_check" check("status" in ('pending', 'active', 'rejected', 'suspended', 'terminated'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "affiliate_partner" drop constraint if exists "affiliate_partner_status_check";`);

    this.addSql(`alter table if exists "affiliate_partner" drop column if exists "password", drop column if exists "rejection_reason";`);

    this.addSql(`alter table if exists "affiliate_partner" add constraint "affiliate_partner_status_check" check("status" in ('pending', 'active', 'suspended', 'terminated'));`);
  }

}
