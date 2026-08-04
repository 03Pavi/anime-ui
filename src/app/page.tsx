'use client'
import { SwitchLanguage } from '@/shared/ui/switch-language'
import { SkeletonCard } from '@/shared/ui'
import { useEffect, useRef, useState } from 'react'
import { API_URL } from '@/config/api'
import Link from 'next/link'

type AnimeItem = {
  title: string
  url: string
  thumbnail?: string
  synopsis?: string
}

type LatestAnime = {
  title: string
  url: string
  image?: string
  type?: string
  status?: string
  genres?: string[]
}

const Page = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AnimeItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [latest, setLatest] = useState<LatestAnime[]>([])
  const [latestLoading, setLatestLoading] = useState(true)
  const [latestError, setLatestError] = useState('')
  const searchAbortRef = useRef<AbortController | null>(null)

  const performSearch = async (searchTerm: string) => {
    setLoading(true)
    setError('')
    setSearchPerformed(true)

    searchAbortRef.current?.abort()
    const controller = new AbortController()
    searchAbortRef.current = controller

    try {
      const response = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(searchTerm)}`, {
        signal: controller.signal,
      })
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const payload = await response.json()
      const animeResults = Array.isArray(payload) ? payload : payload.results || payload.data || []

      if (controller.signal.aborted) return

      setResults(
        (animeResults as AnimeItem[]).map((item: any) => ({
          title: item.title || item.name || 'Untitled Anime',
          url: item.url || item.page || item.link || '#',
          thumbnail: item.thumbnail || item.image || item.cover,
          synopsis: item.synopsis || item.description || '',
        }))
      )
    } catch (fetchError) {
      if (controller.signal.aborted) return
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to search anime')
      setResults([])
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    const fetchLatest = async () => {
      setLatestLoading(true)
      setLatestError('')

      try {
        const response = await fetch(`${API_URL}/api/latest`)
        if (!response.ok) {
          throw new Error(`Latest releases failed: ${response.status}`)
        }

        const payload = await response.json()
        const latestItems = payload.data || payload.results || payload.items || []

        setLatest(
          (latestItems as LatestAnime[]).map((item: any) => ({
            title: item.title || item.name || 'Untitled Anime',
            url: item.url || item.link || item.page || '#',
            image: item.image || item.poster || item.thumbnail || '/logo.svg',
            type: item.type || 'Anime',
            status: item.status || 'Unknown',
            genres: item.genres || item.categories || [],
          }))
        )
      } catch (fetchError) {
        setLatestError(fetchError instanceof Error ? fetchError.message : 'Unable to load latest releases.')
      } finally {
        setLatestLoading(false)
      }
    }

    fetchLatest()
  }, [])

  const clearSearch = () => {
    searchAbortRef.current?.abort()
    searchAbortRef.current = null
    setQuery('')
    setError('')
    setResults([])
    setSearchPerformed(false)
    setLoading(false)
  }

  const searchAnime = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()

    if (!trimmed) {
      clearSearch()
      return
    }

    await performSearch(trimmed)
  }

  return (
    <main className="home-page">
      <section className="hero-banner">
        <div className="hero-content">
          <span className="eyebrow">Sanime</span>
          <h1>
            <span className="hero-title-line">Explore and watch</span>
            <span className="hero-title-subline">Without Ads</span>
          </h1>

          <form className="hero-search-bar" onSubmit={searchAnime}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search anime titles, characters, or series"
              aria-label="Search anime"
              readOnly={loading || searchPerformed}
            />
            {searchPerformed ? (
              <button type="button" className="search-submit" onClick={clearSearch}>
                Clear
              </button>
            ) : (
              <button type="submit" className="search-submit" disabled={loading || !query.trim()}>
                {loading ? <span className="button-spinner" aria-hidden="true" /> : 'Search'}
              </button>
            )}
          </form>
        </div>
      </section>

      <div className="anime-shell page-shell">
        {searchPerformed && (
          <section className="search-results-section">
            <div className="section-header">
              <div>
                <h2>Search results</h2>
                <p>
                  {results.length > 0
                    ? `Found ${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`
                    : `No matches for "${query}"`}
                </p>
              </div>
            </div>

            {loading && (
              <div className="grid-list">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            )}
            {error && <p className="status-message error">{error}</p>}

            {!loading && !error && results.length > 0 && (
              <div className="grid-list">
                {results.map((anime, index) => (
                  <Link
                    key={`${anime.title}-${index}`}
                    href={`/seasons?url=${encodeURIComponent(anime.url)}`}
                    className="anime-card"
                  >
                    <div className="card-image" style={{ backgroundImage: `url(${anime.thumbnail || '/logo.svg'})` }} />
                    <div className="card-content">
                      <h3>{anime.title}</h3>
                      <p>{anime.synopsis || 'Explore the anime page for more details.'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && !error && results.length === 0 && (
              <p className="status-message">No results found. Try another keyword.</p>
            )}
          </section>
        )}

        {!searchPerformed && (
          <section className="latest-section">
            <div className="section-header">
              <div>
                <h2>Latest releases</h2>
                <p>New drops from the Sanime API, updated just for you.</p>
              </div>
              <SwitchLanguage />
            </div>

            {latestLoading && <p className="status-message">Loading latest releases...</p>}
            {latestError && <p className="status-message error">{latestError}</p>}

            {!latestLoading && !latestError && latest.length > 0 && (
              <div className="latest-grid">
                {latest.map((item, index) => (
                  <Link
                    key={`${item.title}-${index}`}
                    href={`/seasons?url=${encodeURIComponent(item.url)}`}
                    className="latest-card"
                  >
                    <div
                      className="latest-card-image"
                      style={{ backgroundImage: `url(${item.image || '/logo.svg'})` }}
                    />
                    <div className="latest-card-content">
                      <h3>{item.title}</h3>
                      <div className="latest-meta">
                        <span>{item.type || 'Anime'}</span>
                        <span>{item.status || 'Live'}</span>
                      </div>
                      {item.genres && item.genres.length > 0 && (
                        <div className="latest-genres">{item.genres.slice(0, 3).join(' · ')}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

export default Page


  