import { NextResponse } from 'next/server'

const JIKAN_BASE = 'https://api.jikan.moe/v4'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const query = url.searchParams.get('q')?.trim()
  const page = Number(url.searchParams.get('page') ?? '1') || 1

  if (!query) {
    return NextResponse.json({ error: 'Missing search query' }, { status: 400 })
  }

  try {
    const response = await fetch(`${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=16&page=${page}`)
    if (!response.ok) {
      throw new Error(`Search provider responded with ${response.status}`)
    }

    const payload = await response.json()
    const results = Array.isArray(payload.data)
      ? payload.data.map((item: any) => ({
          title: item.title || item.title_english || item.title_japanese || 'Untitled Anime',
          url: item.url || item.website || '',
          thumbnail:
            item.images?.jpg?.image_url ||
            item.images?.webp?.image_url ||
            item.trailer?.images?.large_image_url ||
            '/logo.svg',
          synopsis: item.synopsis || item.background || '',
          type: item.type || '',
          genres: Array.isArray(item.genres)
            ? item.genres.map((genre: any) => genre?.name || genre).filter(Boolean)
            : [],
        }))
      : []

    const responseBody: any = { data: results }
    if (payload.pagination) {
      responseBody.pagination = payload.pagination
    }

    return NextResponse.json(responseBody)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch search results'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
