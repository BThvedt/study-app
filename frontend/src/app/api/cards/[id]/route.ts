import { NextRequest, NextResponse } from 'next/server';
import { drupalFetch, getCurrentUserUuid } from '@/lib/drupal';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const userUuid = await getCurrentUserUuid();
  if (!userUuid) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const attributes: Record<string, unknown> = {};
  if (body.front !== undefined) {
    attributes.field_front = body.front;
    attributes.title = body.front.slice(0, 100);
  }
  if (body.back !== undefined) {
    attributes.field_back = body.back;
  }

  const document = {
    data: {
      type: 'node--flashcard',
      id,
      attributes,
    },
  };

  const res = await drupalFetch(`/jsonapi/node/flashcard/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(document),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: 'Failed to update card', detail: err },
      { status: res.status },
    );
  }

  return NextResponse.json(await res.json());
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const userUuid = await getCurrentUserUuid();
  if (!userUuid) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const { id } = await params;

  const res = await drupalFetch(`/jsonapi/node/flashcard/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok && res.status !== 204) {
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: res.status },
    );
  }

  return new NextResponse(null, { status: 204 });
}
