'use client'
import { useEffect, useState } from 'react'
import { API_URL } from '@/config/api'
import { SkeletonCard } from '@/shared/ui'

type LatestAnime = {
  title: string
  url: string
  image: string
  type?: string
  status?: string
  genres?: string[]
}

const LatestPage = () => {
  const [latest, setLatest] = useState<LatestAnime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(`${API_URL}/api/latest`)
        if (!res.ok) {
          throw new Error(`Failed to load latest: ${res.status}`)
        }
        const payload = await res.json()
        const items = payload.data || payload.results || payload.items || []
        setLatest(
          items.map((item: any) => ({
            title: item.title || item.name || 'Untitled',
            url: item.url || item.link || '#',
            image: item.image || item.poster || '/logo.svg',
            type: item.type || '',
            status: item.status || 'Unknown',
            genres: item.genres || [],
          }))
        )
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load latest releases.')
      } finally {
        setLoading(false)
      }
    }

    fetchLatest()
  }, [])

  return (
    <main className="anime-shell latest-shell">
      <div className="section-header latest-header">
        <div>
          <span className="eyebrow">New Release Dashboard</span>
           <h1>Fresh anime releases</h1>
          <p>Browse the latest release collection powered by the dashboard API.</p>
        </div>
      </div>

      {loading && (
        <div className="latest-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      )}
      {error && <p className="status-message error">{error}</p>}

      {!loading && !error && (
        <div className="latest-grid">
          {latest.map((item, index) => (
            <a key={`${item.title}-${index}`} href={item.url} className="latest-card" target="_blank" rel="noreferrer">
              <div className="latest-card-image" style={{ backgroundImage: `url(${item.image})` }} />
              <div className="latest-card-content">
                <h3>{item.title}</h3>
                <div className="latest-meta">
                  <span>{item.type || 'Anime'}</span>
                  <span>{item.status || 'Unknown'}</span>
                </div>
                {item.genres && item.genres.length > 0 && (
                  <div className="latest-genres">{item.genres.slice(0, 3).join(' · ')}</div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  )
}

export default LatestPage
