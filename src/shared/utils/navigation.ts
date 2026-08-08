export const isDirectPlayerUrl = (url: string): boolean => {
  if (!url) return false
  
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.replace(/\/$/, '')
    
    // If it's an animesalt.ro link and DOES NOT start with /anime/ (e.g. /doraemon-1979-season-1/)
    if (parsed.hostname.includes('animesalt.ro') && pathname && !pathname.startsWith('/anime/')) {
      return true
    }
  } catch {
    if (url.includes('animesalt.ro/') && !url.includes('animesalt.ro/anime/')) {
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
