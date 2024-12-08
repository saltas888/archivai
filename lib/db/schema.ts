import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  timestamp,
  varchar,
  pgEnum,
  text,
  decimal,
  serial,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `dms_${name}`);

export const RECORD_TYPE_VALUES = ['invoice', 'transaction'] as const;
export const recordTypeEnum = pgEnum('record_type', RECORD_TYPE_VALUES);

export const USER_ROLE_VALUES = ['admin', 'member'] as const;
export const userRoleEnum = pgEnum('user_role', USER_ROLE_VALUES);

export const organizations = createTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  logo: text('logo'),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});

export const users = createTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  auth0Id: text('auth0_id').unique(),
  email: text('email').notNull(),
  name: text('name'),
  organizationId: uuid('organization_id').references(() => organizations.id),
  role: userRoleEnum('role').notNull().default('member'),
  isInvited: boolean('is_invited').default(false),
  invitedBy: uuid('invited_by'),
  invitedAt: timestamp("invited_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});

export const clients = createTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  vat: text('vat').notNull(),
  address: text('address'),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});

export const docs = createTable('docs', {
  id: serial("id").primaryKey(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  clientId: uuid('client_id')
    .references(() => clients.id)
    .notNull(),
  recordType: recordTypeEnum('record_type').notNull(),
  serviceProviderName: text('service_provider_name'),
  vatNumber: text('vat_number'),
  recordNumber: text('record_number'),
  date: timestamp("date", { withTimezone: true }).notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }),
  currency: text('currency'),
  paidVatPercentage: decimal('paid_vat_percentage', { precision: 5, scale: 2 }),
  purpose: text('purpose'),
  additionalInfo: text('additional_info'),
  fileName: text('file_name'),
  fileUrl: text('file_url'),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});

export const usersRelations = relations(users, ({ one }) => ({
	organization: one(organizations, {
    fields: [users.organizationId], references: [organizations.id] 
  }),
  invitee: one(users, {
		fields: [users.invitedBy],
		references: [users.id],
	}),
}));

export const clientRelations = relations(clients, ({ one, many }) => ({
	organization: one(organizations, {
    fields: [clients.organizationId], references: [organizations.id] 
  }),
  documents: many(docs),
}));

export const docRelations = relations(docs, ({ one }) => ({
  client: one(clients, {
    fields: [docs.clientId], references: [clients.id]
  }),
}));

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Doc = typeof docs.$inferSelect;
export type NewDoc = typeof docs.$inferInsert;
