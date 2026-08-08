'use client'
import { SwitchLanguage } from '@/shared/ui/switch-language'
import { SkeletonCard } from '@/shared/ui'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { API_URL } from '@/config/api'
import { getTargetNavigationUrl } from '@/shared/utils/navigation'
import Link from 'next/link'

type AnimeItem = {
  title: string
  url: string
  thumbnail?: string
  type?: string
  genres?: string[]
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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [paginationPages, setPaginationPages] = useState<{ page: number; isCurrent: boolean }[]>([])
  const [latest, setLatest] = useState<LatestAnime[]>([])
  const [latestLoading, setLatestLoading] = useState(true)
  const [latestError, setLatestError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialSearchProcessedRef = useRef(false)
  const searchAbortRef = useRef<AbortController | null>(null)

  const syncUrlQuery = (value: string, page = 1) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()))

    if (value.trim()) {
      params.set('q', value.trim())
    } else {
      params.delete('q')
    }

    if (page > 1) {
      params.set('page', String(page))
    } else {
      params.delete('page')
    }

    const queryString = params.toString()
    const pathname = window.location.pathname
    router.replace(queryString ? `${pathname}?${queryString}` : pathname)
  }

  const performSearch = async (searchTerm: string, page = 1) => {
    setLoading(true)
    setError('')
    setSearchPerformed(true)
    setCurrentPage(page)

    searchAbortRef.current?.abort()
    const controller = new AbortController()
    searchAbortRef.current = controller

    try {
      const response = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(searchTerm)}&page=${page}`, {
        signal: controller.signal,
      })
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const payload = await response.json()
      const animeResults = Array.isArray(payload) ? payload : payload.results || payload.data || []
      const pagination = payload.pagination

      if (controller.signal.aborted) return

      setResults(
        (animeResults as AnimeItem[]).map((item: any) => ({
          title: item.title || item.name || 'Untitled Anime',
          url: item.url || item.page || item.link || '#',
          thumbnail: item.thumbnail || item.image || item.cover,
          synopsis: item.synopsis || item.description || '',
          type: item.type || '',
          genres: item.genres || [],
        }))
      )
      setTotalPages(pagination?.totalPages ?? 1)
      setPaginationPages(pagination?.pages ?? [])
    } catch (fetchError) {
      if (controller.signal.aborted) return
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to search anime')
      setResults([])
      setTotalPages(1)
      setPaginationPages([])
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    const q = searchParams.get('q')?.trim() || ''
    const page = Number(searchParams.get('page') ?? '1') || 1

    if (q && !initialSearchProcessedRef.current) {
      initialSearchProcessedRef.current = true
      setQuery(q)
      performSearch(q, page)
    }
  }, [performSearch])

  const handlePageChange = async (page: number) => {
    if (page === currentPage || !query.trim()) return
    await performSearch(query.trim(), page)
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
    setCurrentPage(1)
    setTotalPages(1)
    setPaginationPages([])
    router.replace(window.location.pathname)
  }

  const searchAnime = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()

    if (!trimmed) {
      clearSearch()
      return
    }

    syncUrlQuery(trimmed, 1)
    await performSearch(trimmed, 1)
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
              onChange={(event) => {
                const value = event.target.value
                setQuery(value)
              }}
              placeholder="Search anime titles, characters, or series"
              aria-label="Search anime"
              readOnly={loading}
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
              <>
                <div className="grid-list">
                  {results.map((anime, index) => (
                    <Link
                      key={`${anime.title}-${index}`}
                      href={getTargetNavigationUrl(anime.url, { query })}
                      className="anime-card"
                    >
                      <div className="card-image" style={{ backgroundImage: `url(${anime.thumbnail || '/logo.svg'})` }} />
                      <div className="card-content">
                        <h3>{anime.title}</h3>
                        <p>
                          {anime.type || anime.genres?.length
                            ? [anime.type, ...(anime.genres || [])].filter(Boolean).join(' · ')
                            : 'Explore the anime page for more details.'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination-bar">
                    <button
                      type="button"
                      className="pagination-nav-button"
                      disabled={currentPage === 1 || loading}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </button>

                    <div className="pagination-buttons">
                      {paginationPages.length > 0
                        ? paginationPages.map((page) => (
                            <button
                              key={page.page}
                              type="button"
                              className={`pagination-button ${page.isCurrent ? 'active' : ''}`}
                              disabled={page.isCurrent || loading}
                              onClick={() => handlePageChange(page.page)}
                            >
                              {page.page}
                            </button>
                          ))
                        : Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                            <button
                              key={pageNumber}
                              type="button"
                              className={`pagination-button ${pageNumber === currentPage ? 'active' : ''}`}
                              disabled={pageNumber === currentPage || loading}
                              onClick={() => handlePageChange(pageNumber)}
                            >
                              {pageNumber}
                            </button>
                          ))}
                    </div>

                    <button
                      type="button"
                      className="pagination-nav-button"
                      disabled={currentPage === totalPages || loading}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
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
                    href={getTargetNavigationUrl(item.url)}
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


  