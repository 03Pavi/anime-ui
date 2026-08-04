import { SkeletonCard } from '@/shared/ui'

const Loading = () => {
  return (
    <div className="page-loader">
      <div className="loading-animation">
        <div className="loader-icon" />
        <div className="loading-skeletons">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Loading
