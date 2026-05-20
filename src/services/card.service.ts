import {
  Card,
  CardResponse,
  CreateCardInput,
  CreateCardSchema,
  UpdateCardInput,
  UpdateCardSchema,
} from '@/src/models/card';
import { CardDao } from '@/src/dao/card.dao';
import { WithId } from 'mongodb';

/**
 * Converts a MongoDB card document to a JSON-safe API shape.
 */
function serializeCard(doc: WithId<Card>): CardResponse {
  return {
    id: doc._id.toString(),
    cardId: doc.cardId,
    condition: doc.condition,
    acquiredDate: doc.acquiredDate.toISOString(),
    notes: doc.notes,
    isFavourites: doc.isFavourites,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/**
 * Business logic for card CRUD operations.
 */
export class CardService {
  static async listCards(): Promise<CardResponse[]> {
    const docs = await CardDao.findAll();
    return docs.map(serializeCard);
  }

  static async getCardById(id: string): Promise<CardResponse | null> {
    const doc = await CardDao.findById(id);
    return doc ? serializeCard(doc) : null;
  }

  static async createCard(input: CreateCardInput): Promise<CardResponse> {
    const validation = CreateCardSchema.safeParse(input);
    if (!validation.success) {
      throw new Error('Invalid card data');
    }

    const existing = await CardDao.findByCardId(validation.data.cardId);
    if (existing) {
      throw new Error('A card with this Card ID already exists');
    }

    const now = new Date();
    const doc: Card = {
      cardId: validation.data.cardId,
      condition: validation.data.condition,
      acquiredDate: validation.data.acquiredDate,
      notes: validation.data.notes,
      isFavourites: validation.data.isFavourites,
      createdAt: now,
      updatedAt: now,
    };

    const result = await CardDao.insertOne(doc);
    const inserted = await CardDao.findById(result.insertedId.toString());
    if (!inserted) {
      throw new Error('Failed to load card after create');
    }
    return serializeCard(inserted);
  }

  static async updateCard(id: string, input: UpdateCardInput): Promise<CardResponse | null> {
    const validation = UpdateCardSchema.safeParse(input);
    if (!validation.success) {
      throw new Error('Invalid card data');
    }

    const data = validation.data;

    const hasField =
      data.cardId !== undefined ||
      data.condition !== undefined ||
      data.acquiredDate !== undefined ||
      data.notes !== undefined ||
      data.isFavourites !== undefined;

    if (!hasField) {
      throw new Error('No fields to update');
    }

    if (data.cardId !== undefined) {
      const conflict = await CardDao.findByCardId(data.cardId);
      if (conflict && conflict._id.toString() !== id) {
        throw new Error('A card with this Card ID already exists');
      }
    }

    const patch: Partial<Card> = { updatedAt: new Date() };
    if (data.cardId !== undefined) patch.cardId = data.cardId;
    if (data.condition !== undefined) patch.condition = data.condition;
    if (data.acquiredDate !== undefined) patch.acquiredDate = data.acquiredDate;
    if (data.notes !== undefined) patch.notes = data.notes;
    if (data.isFavourites !== undefined) patch.isFavourites = data.isFavourites;

    const ok = await CardDao.updateById(id, patch);
    if (!ok) return null;

    const updated = await CardDao.findById(id);
    return updated ? serializeCard(updated) : null;
  }

  static async deleteCard(id: string): Promise<boolean> {
    return CardDao.deleteById(id);
  }
}
