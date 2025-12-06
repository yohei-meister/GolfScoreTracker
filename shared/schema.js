import { pgTable, text, serial, integer, jsonb, boolean, timestamp, primaryKey, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const playerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Player name is required"),
});

export const holeSchema = z.object({
  number: z.number(),
  par: z.number(),
  yards: z.number(),
});

export const scoreSchema = z.object({
  playerId: z.string(),
  holeNumber: z.number(),
  strokes: z.number().int().positive(),
});

export const courseSchema = z.object({
  id: z.string(),
  name: z.string(),
  holes: z.array(holeSchema),
});

export const gameSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  courseName: z.string(),
  holeCount: z.number().int().min(9).max(18),
  players: z.array(playerSchema),
  scores: z.array(scoreSchema),
  currentHole: z.number().int().min(1),
  completed: z.boolean().default(false),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  games: many(games)
}));

export const games = pgTable("games", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id").references(() => users.id),
  courseId: text("course_id").notNull(),
  courseName: text("course_name").notNull(),
  holeCount: integer("hole_count").notNull(),
  currentHole: integer("current_hole").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gameRelations = relations(games, ({ one, many }) => ({
  user: one(users, {
    fields: [games.userId],
    references: [users.id],
  }),
  players: many(players),
  holeInfo: many(holeInfo),
  scores: many(scores),
}));

export const players = pgTable("players", {
  id: uuid("id").defaultRandom().primaryKey(),
  gameId: uuid("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

export const playerRelations = relations(players, ({ one, many }) => ({
  game: one(games, {
    fields: [players.gameId],
    references: [games.id],
  }),
  scores: many(scores)
}));

export const holeInfo = pgTable("hole_info", {
  id: serial("id").primaryKey(),
  gameId: uuid("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  holeNumber: integer("hole_number").notNull(),
  par: integer("par").notNull(),
  yards: integer("yards").notNull(),
});

export const holeInfoRelations = relations(holeInfo, ({ one }) => ({
  game: one(games, {
    fields: [holeInfo.gameId],
    references: [games.id],
  }),
}));

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  gameId: uuid("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  playerId: uuid("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  holeNumber: integer("hole_number").notNull(),
  strokes: integer("strokes").notNull(),
});

export const scoreRelations = relations(scores, ({ one }) => ({
  game: one(games, {
    fields: [scores.gameId],
    references: [games.id],
  }),
  player: one(players, {
    fields: [scores.playerId],
    references: [players.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
});

export const insertHoleInfoSchema = createInsertSchema(holeInfo).omit({
  id: true,
});

export const insertScoreSchema = createInsertSchema(scores).omit({
  id: true,
});
