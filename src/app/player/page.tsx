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

type PlayerPayload = {
  title?: string
  poster?: string
  streams?: StreamItem[]
  description?: string
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
        <div>
          <span className="eyebrow">Player</span>
          <h1>{player.title || 'Episode Player'}</h1>
           <p>Choose a stream quality and play the episode directly inside Sanime.</p>
        </div>
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
            <div className="player-meta">
              <h2>{player.title}</h2>
              {player.description && <p>{player.description}</p>}
            </div>
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
            {selectedStream && (
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
            )}
          </div>
        </div>
      )}
    </main>
  )
}

export default PlayerPage
