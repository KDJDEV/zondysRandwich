import { pgTable, serial, text, varchar, integer, timestamp, boolean, unique } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	username: varchar('username', { length: 50 }).unique().notNull(),
	email: text("email").unique().notNull(),
	password: varchar('password', { length: 256 }),
	emailVerified: boolean("email_verified").default(false),
	verificationToken: text("verification_token"),
	verificationTokenExpires: timestamp("verification_token_expires")
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
	sauce: text('sauce'),
	userId: integer('user_id').references(() => users.id),
	comments: text('comments'),
	starRating: integer('star_rating'),
	imageUrl: varchar('image_url', { length: 512 }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	rerolled: boolean('rerolled').default(false).notNull(),
	deleted: boolean('deleted').default(false).notNull(),
});

export const sandwichVotes = pgTable("sandwich_votes", {
	id: serial("id").primaryKey(),
	sandwichId: integer("sandwich_id").notNull().references(() => sandwiches.id),
	userId: integer("user_id").notNull().references(() => users.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
	uniqueVote: unique().on(table.sandwichId, table.userId) // prevent duplicates
}));

export const sandwichComments = pgTable("sandwich_comments", {
	id: serial("id").primaryKey(),
	sandwichId: integer("sandwich_id").notNull(),
	userId: integer("user_id").notNull(),
	username: varchar("username", { length: 50 }).notNull(),
	comments: text("comments").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});