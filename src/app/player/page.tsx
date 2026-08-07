'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { API_URL } from '@/config/api'
import { SkeletonPlayer } from '@/shared/ui'
import { useAppSelector } from '@/store/hooks'

type StreamItem = {
  quality: string
  url: string
  label?: string
}

type RelatedEpisode = {
  title: string
  url: string
  image?: string
  type?: string
  genres?: string[]
  status?: string
}

type EpisodeDetails = {
  title?: string
  poster?: string
  episodeNumber?: string
  type?: string
  language?: string
  seasonUrl?: string
  seasonTitle?: string
}

type PlayerPayload = {
  title?: string
  poster?: string
  streams?: StreamItem[]
  description?: string
  episodeDetails?: EpisodeDetails
  relatedEpisodes?: RelatedEpisode[]
}

const PlayerPage = () => {
  const searchParams = useSearchParams()
  const episodeUrl = searchParams.get('url') || ''
  const [player, setPlayer] = useState<PlayerPayload>({})
  const [selectedStream, setSelectedStream] = useState<StreamItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('');

  useEffect(() => {
    if (!episodeUrl) {
      return
    }

    const fetchPlayer = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await fetch(`${API_URL}/api/player?url=${encodeURIComponent(episodeUrl)}`)
        if (!res.ok) {
          throw new Error(`Unable to load player: ${res.status}`)
        }

        const payload = await res.json()
        const streams = payload.streams || payload.data?.streams || payload.results || []

        const normalizedStreams = (streams as any[]).map((item) => ({
          quality: item.quality || item.label || 'Default',
          url: item.url || item.src || item.source || '',
          label: item.label || item.quality || 'Stream',
        }))

        setPlayer({
          title: payload.title || payload.name || 'Video Player',
          poster: payload.poster || payload.image || '',
          description: payload.description || payload.summary || '',
          streams: normalizedStreams,
          episodeDetails: (payload.episodeDetails || payload.data?.episodeDetails || undefined),
          relatedEpisodes: (payload.relatedEpisodes || payload.data?.relatedEpisodes || []).map((item: any) => ({
            title: item.title || 'Untitled',
            url: item.url || '#',
            image: item.image || item.thumbnail || item.poster || '/logo.svg',
            type: item.type || '',
            genres: item.genres || [],
            status: item.status || '',
          })),
        })

        if (normalizedStreams.length > 0) {
          setSelectedStream(normalizedStreams[0])
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load player data.')
      } finally {
        setLoading(false)
      }
    }

    fetchPlayer()
  }, [episodeUrl])

  return (
    <main className="anime-shell page-shell">
      <div className="page-header">

      {!loading && !error && player.episodeDetails && (
        <section className="episode-details">
          <div className="episode-details-card">
            <div className="episode-details-poster" style={{ backgroundImage: `url(${player.episodeDetails.poster || '/logo.svg'})` }} />
            <div className="episode-details-info">
              <span className="eyebrow">Now Playing</span>
              <h2>{player.episodeDetails.title}</h2>
              <div className="episode-details-meta">
                {player.episodeDetails.episodeNumber && (
                  <span className="episode-detail-badge">Episode {player.episodeDetails.episodeNumber}</span>
                )}
                {player.episodeDetails.language && (
                  <span className="episode-detail-badge">{player.episodeDetails.language}</span>
                )}
              </div>
              {player.episodeDetails.seasonTitle && (
                <a href={player.episodeDetails.seasonUrl} className="episode-season-link">
                  {player.episodeDetails.seasonTitle}
                </a>
              )}
            </div>
          </div>
        </section>
      )}
      </div>

      {loading && <SkeletonPlayer />}
      {error && <p className="status-message error">{error}</p>}

      {!loading && !error && !episodeUrl && (
        <p className="status-message">Missing episode URL. Please choose an episode first.</p>
      )}

      {!loading && !error && episodeUrl && player.streams?.length === 0 && (
        <p className="status-message">No playable streams were returned for this episode.</p>
      )}

      {!loading && !error && player.streams && (player.streams.length ?? 0) > 0 && (
        <div className="player-shell">
          <div className="player-frame">
            <video
              controls
              autoPlay
              playsInline
              poster={player.poster}
              className="video-player"
              src={selectedStream?.url || undefined}
            />
          </div>
          <div className="player-sidebar">
            <div className="quality-controls">
              <h3>Quality</h3>
              <div className="quality-list">
                {player.streams?.map((stream) => (
                  <button
                    key={stream.url}
                    type="button"
                    className={stream.url === selectedStream?.url ? 'quality-button selected' : 'quality-button'}
                    onClick={() => setSelectedStream(stream)}
                  >
                    {stream.quality}
                  </button>
                ))}
              </div>
            </div>
            {/* {selectedStream && (
              <div className="quality-controls">
                <h3>Download</h3>
                <a
                  href={selectedStream.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="quality-button selected"
                  style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}
                >
                  Download {selectedStream.quality}
                </a>
              </div>
            )} */}
          </div>
        </div>
      )}

      {!loading && !error && player.relatedEpisodes && player.relatedEpisodes.length > 0 && (
        <section className="related-episodes">
          <div className="section-header">
            <div>
              <h2>Related</h2>
              <p>More episodes you might like</p>
            </div>
          </div>
          <div className="related-grid">
         {player.relatedEpisodes.filter(item=>item?.type!=="Movie")?.map((episode, index) => (
              <a
                key={`${episode.title}-${index}`}
                href={`/player?url=${encodeURIComponent(episode.url)}`}
                className="related-card"
              >
                <div className="related-image" style={{ backgroundImage: `url(${episode.image})` }} />
                <div className="related-content">
                  <h3>{episode.title}</h3>
                  <div className="related-meta">
                    {episode.type && <span>{episode.type}</span>}
                    {episode.status && <span>{episode.status}</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default PlayerPage
