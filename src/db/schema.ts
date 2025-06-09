import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex, int } from 'drizzle-orm/sqlite-core';

export const product = sqliteTable('product', {
  product_id: integer('product_id').primaryKey({ autoIncrement: true }),
  product_name: text('product_name').notNull(),
  product_desc: text('product_desc').notNull(),
  product_image: text('product_image').notNull(),
  price: integer('price').notNull().default(0),
  category_name: text('category_name').notNull(),
  uploaded_date: text('uploaded_date').notNull().default(sql`CURRENT_DATE`),
  link: text('link').notNull(),
  button_name: text('button_name').notNull(),
});


export const usersTable = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),

  verificationCode: text('verification_code').default('111111'),
  verificationCodeGeneratedAt: integer('verification_code_generated_at', { mode: 'timestamp' }),

  // verified: integer('verified', { mode: 'boolean' }).default(false),

  // New fields based on ALTER TABLEs:
  profilePicture: text('profile_picture').notNull().default(''),
  resetPassCode: text('resetpass_code').default('333333'),
  resetPassCodeGeneratedAt: integer('resetpass_code_generated_at', { mode: 'timestamp' }),
  permission: text('permission').notNull().default('Guest'),

}, (table) => ({
  emailIdx: uniqueIndex('email_idx').on(table.email),
  usernameIdx: uniqueIndex('username_idx').on(table.username),
}));

export const sessions = sqliteTable('sessions', {
  sessionId: text('session_id').primaryKey(),
  userId: int('user_id').notNull().references(() => usersTable.id),
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertProduct = typeof product.$inferInsert;
export type SelectProduct = typeof product.$inferSelect;