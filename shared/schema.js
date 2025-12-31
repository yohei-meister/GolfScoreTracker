import { z } from "zod";

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
