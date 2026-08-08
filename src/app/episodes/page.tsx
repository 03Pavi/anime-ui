'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { API_URL } from '@/config/api'
import { SkeletonEpisodeRow } from '@/shared/ui'

type EpisodeItem = {
  title: string
  url: string
  number?: string | number
  language?: string
  releaseDate?: string
  synopsis?: string
  thumbnail?: string
}

const EpisodesPage = () => {
  const searchParams = useSearchParams()
  const seasonUrl = searchParams.get('url') || ''
  const seasonTitle = searchParams.get('title') || ''
  const [episodes, setEpisodes] = useState<EpisodeItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!seasonUrl) {
      return
    }

    const controller = new AbortController()

    const fetchEpisodes = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await fetch(`${API_URL}/api/episodes?url=${encodeURIComponent(seasonUrl)}`, {
          signal: controller.signal,
        })
        if (!res.ok) {
          throw new Error(`Unable to load episodes: ${res.status}`)
        }

        const payload = await res.json()
        const items = payload.data || payload.results || payload.items || []

        setEpisodes(
          items.map((item: any) => ({
            title: item.title || item.name || item.episode || 'Episode',
            url: item.url || item.link || item.page || '',
            number: item.number || item.episodeNumber || item.episode || item.id,
            language: item.language || item.lang || '',
            releaseDate: item.releaseDate || item.airDate || item.date || '',
            synopsis: item.description || item.synopsis || item.summary || '',
            thumbnail: item.thumbnail || item.image || item.poster,
          }))
        )
      } catch (fetchError) {
        if ((fetchError as any)?.name === 'AbortError' || controller.signal.aborted) return
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load episodes.')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchEpisodes()

    return () => {
      controller.abort('Component unmounted or effect re-ran')
    }
  }, [seasonUrl])

  return (
    <main className="anime-shell page-shell episodes-page">
      <div className="page-header">
        <div className="page-header-content">
          {seasonTitle && <span className="eyebrow">Episodes</span>}
          <h1>{seasonTitle ? `${seasonTitle}` : 'Pick an episode'}</h1>
          <p>Choose an episode below to open the player and start streaming.</p>
        </div>
      </div>

      {loading && (
        <div className="episode-list">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonEpisodeRow key={index} />
          ))}
        </div>
      )}
      {error && <p className="status-message error">{error}</p>}

      {!loading && !error && !seasonUrl && (
        <p className="status-message">Missing season URL. Please go back and choose a season first.</p>
      )}

      {!loading && !error && seasonUrl && episodes.length === 0 && (
        <p className="status-message">No episodes found for this season yet.</p>
      )}

      {!loading && !error && episodes.length > 0 && (
        <div className="episode-list">
          {episodes.map((episode, index) => (
            <Link
              key={`${episode.title}-${index}`}
              href={`/player?url=${encodeURIComponent(episode.url)}`}
              className="episode-row"
            >
              <div className="episode-thumb-wrap">
                {episode.thumbnail ? (
                  <div
                    className="episode-thumb"
                    style={{ backgroundImage: `url(${episode.thumbnail})` }}
                  />
                ) : (
                  <div className="episode-thumb episode-thumb-fallback">
                    <span className="episode-fallback-number">
                      {episode.number ?? index + 1}
                    </span>
                  </div>
                )}
              </div>
              <div className="episode-info">
                <h3>{episode.title}</h3>
                <div className="episode-meta">
                  {episode.number != null && <span>Episode {episode.number}</span>}
                  {episode.language && <span>{episode.language}</span>}
                  {episode.releaseDate && <span>{episode.releaseDate}</span>}
                </div>
                {episode.synopsis && (
                  <p className="episode-synopsis">{episode.synopsis}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}

export default EpisodesPage
