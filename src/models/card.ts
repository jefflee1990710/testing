import { z } from 'zod';
import { ObjectId } from 'mongodb';

/**
 * Allowed condition values for a collectible card.
 */
export const CardConditionSchema = z.enum(['Good', 'Normal', 'Bad']);

export type CardCondition = z.infer<typeof CardConditionSchema>;

/**
 * Zod schema for a card document stored in MongoDB.
 */
export const CardSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  cardId: z.string().min(1, { message: 'Card ID is required' }),
  condition: CardConditionSchema,
  acquiredDate: z.date(),
  notes: z.string().default(''),
  isFavourites: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Card = z.infer<typeof CardSchema>;

/**
 * Payload for creating a card (API / forms).
 */
export const CreateCardSchema = z.object({
  cardId: z.string().min(1, { message: 'Card ID is required' }).trim(),
  condition: CardConditionSchema,
  acquiredDate: z.coerce.date(),
  notes: z.string().default(''),
  isFavourites: z.boolean().default(false),
});

export type CreateCardInput = z.infer<typeof CreateCardSchema>;

/**
 * Payload for partial updates.
 */
export const UpdateCardSchema = CreateCardSchema.partial();

export type UpdateCardInput = z.infer<typeof UpdateCardSchema>;

/**
 * JSON shape returned from the cards API (ISO date strings, string id).
 */
export type CardResponse = {
  id: string;
  cardId: string;
  condition: CardCondition;
  acquiredDate: string;
  notes: string;
  isFavourites: boolean;
  createdAt: string;
  updatedAt: string;
};
