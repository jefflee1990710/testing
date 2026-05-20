'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CardCondition, CardResponse } from '@/src/models/card';

const CONDITIONS: CardCondition[] = ['Good', 'Normal', 'Bad'];

/** Form + table for managing cards backed by `/api/cards`. */
export default function About2CardsClient() {
  const [cards, setCards] = useState<CardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [cardId, setCardId] = useState('');
  const [condition, setCondition] = useState<CardCondition>('Good');
  const [acquiredDate, setAcquiredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavourites, setIsFavourites] = useState(false);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setCardId('');
    setCondition('Good');
    setAcquiredDate('');
    setNotes('');
    setIsFavourites(false);
  }, []);

  const loadCards = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/cards');
      const data: unknown = await res.json();
      if (!res.ok) {
        const msg =
          typeof data === 'object' && data !== null && 'message' in data
            ? String((data as { message: unknown }).message)
            : 'Failed to load cards';
        throw new Error(msg);
      }
      const list =
        typeof data === 'object' && data !== null && 'cards' in data
          ? (data as { cards: CardResponse[] }).cards
          : [];
      setCards(Array.isArray(list) ? list : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load cards');
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  const startEdit = (card: CardResponse) => {
    setEditingId(card.id);
    setCardId(card.cardId);
    setCondition(card.condition);
    setAcquiredDate(card.acquiredDate.slice(0, 10));
    setNotes(card.notes);
    setIsFavourites(card.isFavourites);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const acquired = acquiredDate ? new Date(acquiredDate).toISOString() : undefined;
      if (!editingId && !acquired) {
        setError('Acquired date is required');
        setSaving(false);
        return;
      }

      if (editingId) {
        const body: Record<string, unknown> = {
          cardId,
          condition,
          notes,
          isFavourites,
        };
        if (acquired) body.acquiredDate = acquired;
        const res = await fetch(`/api/cards/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data: unknown = await res.json();
        if (!res.ok) {
          const msg =
            typeof data === 'object' && data !== null && 'message' in data
              ? String((data as { message: unknown }).message)
              : 'Update failed';
          throw new Error(msg);
        }
      } else {
        const res = await fetch('/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardId,
            condition,
            acquiredDate: acquired,
            notes,
            isFavourites,
          }),
        });
        const data: unknown = await res.json();
        if (!res.ok) {
          const msg =
            typeof data === 'object' && data !== null && 'message' in data
              ? String((data as { message: unknown }).message)
              : 'Create failed';
          throw new Error(msg);
        }
      }

      resetForm();
      await loadCards();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this card?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/cards/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data: unknown = await res.json();
        const msg =
          typeof data === 'object' && data !== null && 'message' in data
            ? String((data as { message: unknown }).message)
            : 'Delete failed';
        throw new Error(msg);
      }
      if (editingId === id) resetForm();
      await loadCards();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 text-foreground">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">About 2 — Card collection</h1>
      <p className="mb-8 text-sm text-neutral-600 dark:text-neutral-400">
        Create, read, update, and delete cards stored in MongoDB.
      </p>

      {error && (
        <div
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-10 grid gap-4 rounded-xl border border-neutral-200 bg-white/50 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40 md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <h2 className="text-lg font-medium">{editingId ? 'Edit card' : 'New card'}</h2>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Card ID</span>
          <input
            required
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-foreground dark:border-neutral-600 dark:bg-neutral-950"
            value={cardId}
            onChange={(ev) => setCardId(ev.target.value)}
            placeholder="e.g. OP01-001"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Condition</span>
          <select
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-foreground dark:border-neutral-600 dark:bg-neutral-950"
            value={condition}
            onChange={(ev) => setCondition(ev.target.value as CardCondition)}
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Acquired date</span>
          <input
            type="date"
            required={!editingId}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-foreground dark:border-neutral-600 dark:bg-neutral-950"
            value={acquiredDate}
            onChange={(ev) => setAcquiredDate(ev.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          <span className="font-medium">Notes</span>
          <textarea
            rows={3}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-foreground dark:border-neutral-600 dark:bg-neutral-950"
            value={notes}
            onChange={(ev) => setNotes(ev.target.value)}
            placeholder="Optional notes"
          />
        </label>

        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={isFavourites}
            onChange={(ev) => setIsFavourites(ev.target.checked)}
          />
          Favourite
        </label>

        <div className="flex flex-wrap gap-2 md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            {saving ? 'Saving…' : editingId ? 'Update card' : 'Add card'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-600"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <section>
        <h2 className="mb-4 text-lg font-medium">Your cards</h2>
        {loading ? (
          <p className="text-sm text-neutral-500">Loading…</p>
        ) : cards.length === 0 ? (
          <p className="text-sm text-neutral-500">No cards yet. Add one above.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Card ID</th>
                  <th className="px-4 py-3 font-medium">Condition</th>
                  <th className="px-4 py-3 font-medium">Acquired</th>
                  <th className="px-4 py-3 font-medium">Fav</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {cards.map((card) => (
                  <tr key={card.id} className="bg-white/40 dark:bg-neutral-950/20">
                    <td className="px-4 py-3 font-mono text-xs">{card.cardId}</td>
                    <td className="px-4 py-3">{card.condition}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(card.acquiredDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{card.isFavourites ? '★' : '—'}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-neutral-600 dark:text-neutral-400">
                      {card.notes || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(card)}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(card.id)}
                          className="text-red-600 hover:underline dark:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
