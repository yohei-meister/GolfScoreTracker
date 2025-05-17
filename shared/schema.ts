import { pgTable, text, serial, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Player schema
export const playerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Player name is required"),
});

export type Player = z.infer<typeof playerSchema>;

// Hole schema
export const holeSchema = z.object({
  number: z.number(),
  par: z.number(),
  yards: z.number(),
});

export type Hole = z.infer<typeof holeSchema>;

// Score schema
export const scoreSchema = z.object({
  playerId: z.string(),
  holeNumber: z.number(),
  strokes: z.number().int().positive(),
});

export type Score = z.infer<typeof scoreSchema>;

// Course schema
export const courseSchema = z.object({
  id: z.string(),
  name: z.string(),
  holes: z.array(holeSchema),
});

export type Course = z.infer<typeof courseSchema>;

// Game schema
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

export type Game = z.infer<typeof gameSchema>;

// Database tables for future use
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  courseId: text("course_id").notNull(),
  courseName: text("course_name").notNull(),
  holeCount: integer("hole_count").notNull(),
  players: jsonb("players").notNull(),
  scores: jsonb("scores").notNull(),
  currentHole: integer("current_hole").notNull(),
  completed: boolean("completed").default(false),
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameRecord = typeof games.$inferSelect;
