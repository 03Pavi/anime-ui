export const isDirectPlayerUrl = (url: string): boolean => {
  if (!url) return false
  
  // Direct link checking for URLs that should open player straight away
  // Pattern 1: https://animesalt.ro/rest-url (where rest-url does NOT start with 'anime/')
  // Pattern 2: https://animesalt.ro/anime/rest-url (explicit anime episode links)
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.replace(/\/$/, '')
    
    if (parsed.hostname.includes('animesalt.ro') && pathname) {
      return true
    }
  } catch {
    // If not a full valid URL string but contains animesalt.ro path structure
    if (url.includes('animesalt.ro/')) {
      return true
    }
  }

  return false
}

export const getTargetNavigationUrl = (url: string, searchParams?: { query?: string; seasonTitle?: string }): string => {
  if (!url) return '/'

  if (isDirectPlayerUrl(url)) {
    return `/player?url=${encodeURIComponent(url)}`
  }

  const queryPart = searchParams?.query ? `&q=${encodeURIComponent(searchParams.query)}` : ''
  const titlePart = searchParams?.seasonTitle ? `&title=${encodeURIComponent(searchParams.seasonTitle)}` : ''

  return `/seasons?url=${encodeURIComponent(url)}${queryPart}${titlePart}`
}
