export function Stars({ count, size = 28 }: { count: 0 | 1 | 2 | 3; size?: number }) {
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`${count} out of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <svg
          key={n}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={n <= count ? 'var(--butter-500)' : 'var(--color-surface-outline)'}
          aria-hidden
        >
          <path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17.6l-6.1 3.4 1.5-6.8L2.2 9.5l6.9-.7z" />
        </svg>
      ))}
    </div>
  )
}
