/**
 * Home Page Component
 *
 * Displays the landing page with a hero introducing the site owner.
 * Styled using Material Design principles (flat, no shadows).
 */
import React from "react";
import { revalidatePath } from "next/cache";
import { MongoClient } from "mongodb";
import LandingHero from "@/src/components/LandingHero";

interface TodoDocument {
  title: string;
  createdAt: Date;
}

interface TodoViewModel {
  id: string;
  title: string;
}

/**
 * Creates a MongoDB client using environment configuration.
 * Throws a descriptive error when the Mongo URL is missing.
 */
function createMongoClient(): MongoClient {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI in environment configuration.");
  }

  return new MongoClient(mongoUri);
}

/**
 * Fetches the latest to-do items from MongoDB.
 * Returns an empty array if database configuration is incomplete.
 */
async function getTodoItems(): Promise<TodoViewModel[]> {
  const mongoDbName = process.env.MONGODB_DB;
  if (!mongoDbName) {
    return [];
  }

  const client = createMongoClient();

  try {
    await client.connect();
    const collection = client
      .db(mongoDbName)
      .collection<TodoDocument>("todos");
    const documents = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return documents.map((document) => ({
      id: document._id.toString(),
      title: document.title,
    }));
  } finally {
    await client.close();
  }
}

/**
 * Saves a new to-do item from the form submission.
 * Revalidates the home page so the updated list is shown immediately.
 */
async function saveTodoItem(formData: FormData): Promise<void> {
  "use server";

  const rawTitle = formData.get("title");
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const mongoDbName = process.env.MONGODB_DB;

  if (!title || !mongoDbName) {
    return;
  }

  const client = createMongoClient();

  try {
    await client.connect();
    const collection = client
      .db(mongoDbName)
      .collection<TodoDocument>("todos");

    await collection.insertOne({
      title,
      createdAt: new Date(),
    });
  } finally {
    await client.close();
  }

  revalidatePath("/");
}

export default async function Home() {
  const todoItems = await getTodoItems();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <LandingHero
        name="Jeff Lee"
        summary="My name is Jeff Lee and I am a Software Engineer with 15+ years experience."
      />

      <section className="mx-auto w-full max-w-3xl px-4 pb-16">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-2xl font-semibold text-gray-900">To-do list</h2>
          <p className="mt-1 text-sm text-gray-600">
            Add tasks and save them to MongoDB.
          </p>

          <form action={saveTodoItem} className="mt-4 flex gap-2">
            <input
              type="text"
              name="title"
              placeholder="Write a new to-do item..."
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
            >
              Save
            </button>
          </form>

          <ul className="mt-5 space-y-2">
            {todoItems.length === 0 ? (
              <li className="text-sm text-gray-500">
                No to-do items yet. Add your first one.
              </li>
            ) : (
              todoItems.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800"
                >
                  {item.title}
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}
