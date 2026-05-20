import { NextResponse } from 'next/server';
import { CardService } from '@/src/services/card.service';
import { UpdateCardSchema } from '@/src/models/card';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/cards/[id] — fetch one card by MongoDB id.
 * PATCH /api/cards/[id] — update fields.
 * DELETE /api/cards/[id] — remove card.
 */
export async function GET(_request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const card = await CardService.getCardById(id);
    if (!card) {
      return NextResponse.json({ message: 'Card not found' }, { status: 404 });
    }
    return NextResponse.json({ card }, { status: 200 });
  } catch (error: unknown) {
    console.error('[API cards/:id] GET error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const body: unknown = await request.json();
    const validation = UpdateCardSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const card = await CardService.updateCard(id, validation.data);
    if (!card) {
      return NextResponse.json({ message: 'Card not found' }, { status: 404 });
    }
    return NextResponse.json({ card }, { status: 200 });
  } catch (error: unknown) {
    console.error('[API cards/:id] PATCH error:', error);
    if (error instanceof Error && error.message === 'A card with this Card ID already exists') {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    if (error instanceof Error && error.message === 'No fields to update') {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const deleted = await CardService.deleteCard(id);
    if (!deleted) {
      return NextResponse.json({ message: 'Card not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('[API cards/:id] DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
