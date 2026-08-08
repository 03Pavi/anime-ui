'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { API_URL } from '@/config/api'
import { SkeletonPlayer } from '@/shared/ui'

type StreamItem = {
  quality: string
  url: string
  label?: string
  resolution?: string
  bandwidth?: number
  type?: string
}

type AudioItem = {
  url: string
  language: string
  label: string
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
  video?: StreamItem[]
  audio?: AudioItem[]
  description?: string
  episodeDetails?: EpisodeDetails
  relatedEpisodes?: RelatedEpisode[]
}

const PlayerPage = () => {
  const searchParams = useSearchParams()
  const episodeUrl = searchParams.get('url') || ''
  const [player, setPlayer] = useState<PlayerPayload>({})
  const [selectedVideo, setSelectedVideo] = useState<StreamItem | null>(null)
  const [selectedAudio, setSelectedAudio] = useState<AudioItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

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
        const data = payload.data || payload

        const streams = (data.streams || []).map((item: any) => ({
          quality: item.quality || item.label || 'Default',
          url: item.url || item.src || '',
          label: item.label || item.quality || 'Stream',
          type: item.type || 'hls',
        }))

        const videoList = (data.video || []).map((item: any) => ({
          quality: item.quality || 'Unknown',
          url: item.url || '',
          resolution: item.resolution || '',
          bandwidth: item.bandwidth,
        }))

        const audioList = (data.audio || []).map((item: any) => ({
          url: item.url || '',
          language: item.language || 'unknown',
          label: item.label || item.language || 'Audio',
        }))

        const availableVideos = videoList.length > 0 ? videoList : streams

        setPlayer({
          title: data.title || payload.title || 'Video Player',
          poster: data.poster || payload.poster || '',
          description: data.description || payload.description || '',
          streams,
          video: videoList,
          audio: audioList,
          episodeDetails: data.episodeDetails || payload.episodeDetails,
          relatedEpisodes: (data.relatedEpisodes || payload.relatedEpisodes || []).map((item: any) => ({
            title: item.title || 'Untitled',
            url: item.url || '#',
            image: item.image || item.thumbnail || item.poster || '/logo.svg',
            type: item.type || '',
            genres: item.genres || [],
            status: item.status || '',
          })),
        })

        if (availableVideos.length > 0) {
          setSelectedVideo(availableVideos[0])
        }

        if (audioList.length > 0) {
          const defaultAudio = audioList.find((a: AudioItem) => a.language === 'hin') || audioList[0]
          setSelectedAudio(defaultAudio)
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load player data.')
      } finally {
        setLoading(false)
      }
    }

    fetchPlayer()
  }, [episodeUrl])

  // Sync audio and video control events
  const handlePlay = () => {
    setIsPlaying(true)
    if (audioRef.current && selectedAudio) {
      audioRef.current.play().catch(() => {})
    }
  }

  const handlePause = () => {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const handleSeeking = () => {
    if (videoRef.current && audioRef.current && selectedAudio) {
      audioRef.current.currentTime = videoRef.current.currentTime
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current && audioRef.current && selectedAudio) {
      const diff = Math.abs(videoRef.current.currentTime - audioRef.current.currentTime)
      if (diff > 0.25) {
        audioRef.current.currentTime = videoRef.current.currentTime
      }
    }
  }

  const handleVideoChange = (video: StreamItem) => {
    const currentTime = videoRef.current ? videoRef.current.currentTime : 0
    setSelectedVideo(video)
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime
        if (isPlaying) {
          videoRef.current.play().catch(() => {})
        }
      }
    }, 100)
  }

  const handleAudioChange = (audio: AudioItem) => {
    const currentTime = videoRef.current ? videoRef.current.currentTime : 0
    setSelectedAudio(audio)
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = currentTime
        if (isPlaying) {
          audioRef.current.play().catch(() => {})
        }
      }
    }, 100)
  }

  const availableVideos = player.video && player.video.length > 0 ? player.video : player.streams || []

  return (
    <main className="anime-shell page-shell">
      <div className="page-header">
        {!loading && !error && player.episodeDetails && (
          <section className="episode-details">
            <div className="episode-details-card">
              <div
                className="episode-details-poster"
                style={{ backgroundImage: `url(${player.episodeDetails.poster || '/logo.svg'})` }}
              />
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
                  {selectedVideo && (
                    <span className="episode-detail-badge active-res-badge">
                      Resolution: {selectedVideo.quality} {selectedVideo.resolution ? `(${selectedVideo.resolution})` : ''}
                    </span>
                  )}
                  {selectedAudio && (
                    <span className="episode-detail-badge active-audio-badge">
                      Audio: {selectedAudio.label}
                    </span>
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

      {!loading && !error && episodeUrl && availableVideos.length === 0 && (
        <p className="status-message">No playable video streams were returned for this episode.</p>
      )}

      {!loading && !error && availableVideos.length > 0 && (
        <div className="player-shell">
          <div className="player-frame">
            <video
              ref={videoRef}
              controls
              autoPlay
              playsInline
              muted={!!selectedAudio}
              poster={player.poster}
              className="video-player"
              src={selectedVideo?.url || undefined}
              onPlay={handlePlay}
              onPause={handlePause}
              onSeeking={handleSeeking}
              onTimeUpdate={handleTimeUpdate}
            />
            {selectedAudio && (
              <audio
                ref={audioRef}
                src={selectedAudio.url}
                preload="auto"
              />
            )}
          </div>

          <div className="player-sidebar-grid">
            <div className="quality-controls">
              <h3>Video Resolution / Quality</h3>
              <div className="quality-list">
                {availableVideos.map((item) => (
                  <button
                    key={item.url}
                    type="button"
                    className={item.url === selectedVideo?.url ? 'quality-button selected' : 'quality-button'}
                    onClick={() => handleVideoChange(item)}
                  >
                    {item.quality} {item.resolution ? `(${item.resolution})` : ''}
                  </button>
                ))}
              </div>
            </div>

            {player.audio && player.audio.length > 0 && (
              <div className="quality-controls">
                <h3>Audio Track</h3>
                <div className="quality-list">
                  {player.audio.map((audio) => (
                    <button
                      key={audio.url}
                      type="button"
                      className={audio.url === selectedAudio?.url ? 'quality-button selected' : 'quality-button'}
                      onClick={() => handleAudioChange(audio)}
                    >
                      {audio.label} ({audio.language.toUpperCase()})
                    </button>
                  ))}
                </div>
              </div>
            )}
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
            {player.relatedEpisodes
              .filter((item) => item?.type !== 'Movie')
              .map((episode, index) => (
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

