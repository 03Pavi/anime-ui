'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { API_URL } from '@/config/api'
import { SkeletonSeasonCard } from '@/shared/ui'

type SeasonItem = {
  title: string
  url: string
  episodes?: number
  synopsis?: string
  thumbnail?: string
}

const SeasonsPage = () => {
  const searchParams = useSearchParams()
  const animeUrl = searchParams.get('url') || ''
  const animeTitle = searchParams.get('title') || ''
  const query = searchParams.get('q') || ''
  const [seasons, setSeasons] = useState<SeasonItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!animeUrl) {
      return
    }

    const fetchSeasons = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await fetch(`${API_URL}/api/seasons?url=${encodeURIComponent(animeUrl)}`)
        if (!res.ok) {
          throw new Error(`Unable to load seasons: ${res.status}`)
        }

        const payload = await res.json()
        const items = payload.data || payload.results || payload.items || []

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
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load seasons.')
      } finally {
        setLoading(false)
      }
    }

    fetchSeasons()
  }, [animeUrl])

  return (
    <main className="anime-shell page-shell seasons-page">
      <div className="page-header">
        <div className="page-header-content">
          {animeTitle && <span className="eyebrow">Seasons</span>}
          <h1>{animeTitle ? `${animeTitle}` : 'Choose a season'}</h1>
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
          {seasons.map((season, index) => (
            <Link
              key={`${season.title}-${index}`}
              href={`/episodes?url=${encodeURIComponent(season.url)}&title=${encodeURIComponent(season.title)}`}
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
          ))}
        </div>
      )}
    </main>
  )
}

export default SeasonsPage
