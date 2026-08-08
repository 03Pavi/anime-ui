'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { API_URL } from '@/config/api'
import { SkeletonSeasonCard } from '@/shared/ui'
import { isDirectPlayerUrl, getTargetNavigationUrl } from '@/shared/utils/navigation'

type SeasonItem = {
  title: string
  url: string
  episodes?: number
  synopsis?: string
  thumbnail?: string
}

type AnimeDetail = {
  title?: string
  alterTitle?: string
  cover?: string
  poster?: string
  rating?: string
  trailerUrl?: string
  status?: string
  network?: string
  studio?: string
  released?: string
  duration?: string
  season?: string
  country?: string
  type?: string
  episodes?: string
  genres?: string[]
  synopsis?: string
}

const SeasonsPage = () => {
  const searchParams = useSearchParams()
  const animeUrl = searchParams.get('url') || ''
  const query = searchParams.get('q') || ''
  const [seasons, setSeasons] = useState<SeasonItem[]>([])
  const [detail, setDetail] = useState<AnimeDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!animeUrl) {
      return
    }

    const controller = new AbortController()

    const fetchSeasons = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await fetch(`${API_URL}/api/seasons?url=${encodeURIComponent(animeUrl)}`, {
          signal: controller.signal,
        })
        if (!res.ok) {
          throw new Error(`Unable to load seasons: ${res.status}`)
        }

        const payload = await res.json()
        const items = payload.data || payload.results || payload.items || []
        const animeDetail = payload.detail || null

        setDetail(animeDetail)
        setSeasons(
          items.map((item: any) => ({
            title: item.title || item.name || item.season || 'Season',
            url: item.url || item.link || item.page || '',
            episodes: item.episodeCount || item.episodes || item.totalEpisodes,
            synopsis: item.description || item.synopsis || item.summary || '',
            thumbnail: item.thumbnail || item.image || item.poster,
          }))
        )
      } catch (fetchError) {
        if ((fetchError as any)?.name === 'AbortError' || controller.signal.aborted) return
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load seasons.')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchSeasons()

    return () => {
      controller.abort('Component unmounted or effect re-ran')
    }
  }, [animeUrl])

  const displayTitle = detail?.title || detail?.alterTitle || 'Anime Details'
  const displayPoster = detail?.poster || detail?.cover || '/logo.svg'
  const displayGenres = detail?.genres || []

  return (
    <main className="anime-shell page-shell seasons-page">
      {detail && (
        <section className="anime-hero">
          <div className="anime-hero-backdrop" style={{ backgroundImage: `url(${detail.cover || detail.poster || '/logo.svg'})` }} />
          <div className="anime-hero-content">
            <div className="anime-hero-poster">
              <img src={displayPoster} alt={displayTitle} />
            </div>
            <div className="anime-hero-info">
              <span className="eyebrow">Anime Details</span>
              <h1>{displayTitle}</h1>
              <div className="anime-hero-meta">
                {detail.type && <span className="anime-meta-badge">{detail.type}</span>}
                {detail.rating && <span className="anime-meta-badge rating">⭐ {detail.rating}</span>}
                {detail.released && <span className="anime-meta-badge">{detail.released}</span>}
                {detail.duration && <span className="anime-meta-badge">{detail.duration}</span>}
                {detail.status && <span className="anime-meta-badge">{detail.status}</span>}
              </div>
              {displayGenres.length > 0 && (
                <div className="anime-hero-genres">
                  {displayGenres.map((genre) => (
                    <span key={genre} className="genre-badge">{genre}</span>
                  ))}
                </div>
              )}
              {detail.synopsis && <p className="anime-hero-synopsis">{detail.synopsis}</p>}
            </div>
          </div>
        </section>
      )}

      <div className="page-header">
        <div className="page-header-content">
          <h1>{detail?.title ? 'Seasons' : 'Choose a season'}</h1>
          <p>Select a season to browse its episodes and start watching.</p>
        </div>
        <Link href={query ? `/?q=${encodeURIComponent(query)}` : '/'} className="secondary-button">
          Back
        </Link>
      </div>

      {loading && (
        <div className="seasons-grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonSeasonCard key={index} />
          ))}
        </div>
      )}
      {error && <p className="status-message error">{error}</p>}

      {!loading && !error && !animeUrl && (
        <p className="status-message">Missing anime URL. Please search for an anime and click a result first.</p>
      )}

      {!loading && !error && animeUrl && seasons.length === 0 && (
        <p className="status-message">No seasons found for this anime yet.</p>
      )}

      {!loading && !error && seasons.length > 0 && (
        <div className="seasons-grid seasons-card-grid">
          {seasons.map((season, index) => {
            const targetHref = isDirectPlayerUrl(season.url)
              ? `/player?url=${encodeURIComponent(season.url)}`
              : `/episodes?url=${encodeURIComponent(season.url)}&title=${encodeURIComponent(season.title)}`

            return (
              <Link
                key={`${season.title}-${index}`}
                href={targetHref}
                className="season-card"
              >
              <div
                className="season-card-thumb"
                style={{ backgroundImage: `url(${season.thumbnail || '/logo.svg'})` }}
              />
              <div className="season-card-body">
                <h3>{season.title}</h3>
                <div className="season-card-meta">
                  {season.episodes != null && (
                    <span className="season-badge episodes">{season.episodes} Episodes</span>
                  )}
                </div>
                {season.synopsis && (
                  <p className="season-synopsis">{season.synopsis}</p>
                )}
              </div>
              </Link>
          )
        })}
        </div>
      )}
    </main>
  )
}

export default SeasonsPage
