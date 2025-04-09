import { pgTable, serial, text, varchar, integer, foreignKey } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	fullName: text('full_name'),
	email: varchar('email', { length: 256 }).unique(),
	password: varchar('password', { length: 256 }),
});

export const sandwiches = pgTable('sandwiches', {
	id: serial('id').primaryKey(),
	bread: text('bread'),
	protein: text('protein'),
	cheese: text('cheese'),
	toppings: text('toppings').array(),
	userId: integer('user_id').notNull().references(() => users.id),
});
