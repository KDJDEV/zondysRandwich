import { pgTable, serial, text, varchar, integer, foreignKey, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	username: text('username').unique().notNull(),
	email: varchar('email', { length: 256 }).unique().notNull(),
	password: varchar('password', { length: 256 }),
});

export const sessions = pgTable("session", {
	id: text("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date"
	}).notNull()
});

export const sandwiches = pgTable('sandwiches', {
	id: serial('id').primaryKey(),
	name: text('name'),
	bread: text('bread'),
	protein: text('protein'),
	cheese: text('cheese'),
	toppings: text('toppings').array(),
	userId: integer('user_id').notNull().references(() => users.id),
});
