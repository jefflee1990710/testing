import { NextResponse } from 'next/server';
import { CardService } from '@/src/services/card.service';
import { CreateCardSchema } from '@/src/models/card';

/**
 * GET /api/cards — list all cards.
 * POST /api/cards — create a card.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const cards = await CardService.listCards();
    return NextResponse.json({ cards }, { status: 200 });
  } catch (error: unknown) {
    console.error('[API cards] GET error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const validation = CreateCardSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const card = await CardService.createCard(validation.data);
    return NextResponse.json({ card }, { status: 201 });
  } catch (error: unknown) {
    console.error('[API cards] POST error:', error);
    if (error instanceof Error && error.message === 'A card with this Card ID already exists') {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
