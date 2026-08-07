import './styles.scss'

type SkeletonProps = {
  className?: string
  style?: React.CSSProperties
}

export const Skeleton = ({ className = '', style }: SkeletonProps) => (
  <span className={`skeleton ${className}`} style={style} />
)

type SkeletonCardProps = {
  className?: string
}

export const SkeletonCard = ({ className = '' }: SkeletonCardProps) => (
  <div className={`skeleton-card ${className}`}>
    <Skeleton className="skeleton-card-image" />
    <div className="skeleton-card-content">
      <Skeleton className="skeleton-card-title" />
      <Skeleton className="skeleton-card-text" />
      <Skeleton className="skeleton-card-text short" />
    </div>
  </div>
)

type SkeletonEpisodeRowProps = {
  className?: string
}

export const SkeletonEpisodeRow = ({ className = '' }: SkeletonEpisodeRowProps) => (
  <div className={`skeleton-episode-row ${className}`}>
    <Skeleton className="skeleton-episode-thumb" />
    <div className="skeleton-episode-info">
      <Skeleton className="skeleton-episode-title" />
      <Skeleton className="skeleton-episode-text" />
      <Skeleton className="skeleton-episode-text short" />
    </div>
  </div>
)

type SkeletonSeasonCardProps = {
  className?: string
}

export const SkeletonSeasonCard = ({ className = '' }: SkeletonSeasonCardProps) => (
  <div className={`skeleton-season-card ${className}`}>
    <Skeleton className="skeleton-season-thumb" />
    <div className="skeleton-season-body">
      <Skeleton className="skeleton-season-title" />
      <Skeleton className="skeleton-season-badge" />
      <Skeleton className="skeleton-season-text" />
      <Skeleton className="skeleton-season-text short" />
    </div>
  </div>
)

type SkeletonPlayerProps = {
  className?: string
}

export const SkeletonPlayer = ({ className = '' }: SkeletonPlayerProps) => (
  <div className={`skeleton-player ${className}`}>
    <Skeleton className="skeleton-player-frame" />
    <div className="skeleton-player-sidebar">
      <Skeleton className="skeleton-player-title" />
      <Skeleton className="skeleton-player-text" />
      <Skeleton className="skeleton-player-text short" />
      <div className="skeleton-quality-list">
        <Skeleton className="skeleton-quality-button" />
        <Skeleton className="skeleton-quality-button" />
        <Skeleton className="skeleton-quality-button short" />
      </div>
    </div>
  </div>
)
