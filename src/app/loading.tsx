const Loading = () => {
  return (
    <div className="page-loader splash-screen">
      <div className="splash-logo">
        {'Sanime'.split('').map((letter, index) => (
          <span key={letter + index}>{letter}</span>
        ))}
      </div>
      <p className="splash-subtitle">Loading your anime world…</p>
    </div>
  )
}

export default Loading
