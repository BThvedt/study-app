import { NextResponse } from 'next/server';
import { drupalFetch, getCurrentUserUuid } from '@/lib/drupal';
import type { JsonApiResource } from '@/lib/drupal';

const PAGE_LIMIT = 50;

/**
 * GET /api/cards
 * Returns all flashcards owned by the current user, with full study fields
 * and included deck taxonomy (field_area, field_subject) for SRS filtering.
 * Paginates Drupal JSON:API automatically and returns a flat array.
 */
export async function GET() {
  const userUuid = await getCurrentUserUuid();
  if (!userUuid) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const base =
    `/jsonapi/node/flashcard` +
    `?filter[uid.id][value]=${userUuid}` +
    `&fields[node--flashcard]=id,created,field_front,field_back,field_deck` +
    `&include=field_deck` +
    `&fields[node--flashcard_deck]=id,field_area,field_subject` +
    `&page[limit]=${PAGE_LIMIT}`;

  const allCards: JsonApiResource[] = [];
  const includedMap: Record<string, JsonApiResource> = {};

  let nextPath: string | null = base;

  while (nextPath) {
    const res = await drupalFetch(nextPath);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch cards' }, { status: res.status });
    }

    const json = await res.json() as {
      data: JsonApiResource[];
      included?: JsonApiResource[];
      links?: { next?: { href?: string } };
    };

    allCards.push(...(json.data ?? []));

    for (const inc of json.included ?? []) {
      includedMap[inc.id] = inc;
    }

    const nextHref = json.links?.next?.href ?? null;
    if (nextHref) {
      // Strip the Drupal base URL — drupalFetch prepends it
      const DRUPAL_BASE = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ?? '';
      nextPath = nextHref.startsWith(DRUPAL_BASE)
        ? nextHref.slice(DRUPAL_BASE.length)
        : nextHref;
    } else {
      nextPath = null;
    }
  }

  return NextResponse.json({ data: allCards, included: Object.values(includedMap) });
}
