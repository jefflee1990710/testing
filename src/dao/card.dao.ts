import { getDb } from '@/src/lib/mongodb';
import { Card } from '@/src/models/card';
import { ObjectId, Filter, InsertOneResult, WithId } from 'mongodb';

/**
 * Data access for the `cards` collection.
 */
export class CardDao {
  private static readonly COLLECTION_NAME = 'cards';

  private static async getCollection() {
    const db = await getDb();
    return db.collection<Card>(this.COLLECTION_NAME);
  }

  static async findAll(sort: { acquiredDate: -1 | 1 } = { acquiredDate: -1 }): Promise<WithId<Card>[]> {
    const collection = await this.getCollection();
    return collection.find({}).sort(sort).toArray();
  }

  static async findById(id: string): Promise<WithId<Card> | null> {
    if (!ObjectId.isValid(id)) return null;
    const collection = await this.getCollection();
    return collection.findOne({ _id: new ObjectId(id) } as Filter<Card>);
  }

  static async findByCardId(cardId: string): Promise<WithId<Card> | null> {
    const collection = await this.getCollection();
    return collection.findOne({ cardId } as Filter<Card>);
  }

  static async insertOne(card: Card): Promise<InsertOneResult<Card>> {
    const collection = await this.getCollection();
    return collection.insertOne(card);
  }

  static async updateById(id: string, patch: Partial<Card>): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id) } as Filter<Card>,
      { $set: patch }
    );
    return result.matchedCount > 0;
  }

  static async deleteById(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) } as Filter<Card>);
    return result.deletedCount > 0;
  }
}
