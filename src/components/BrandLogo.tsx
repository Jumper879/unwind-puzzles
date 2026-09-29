type LogoVariant = 'horizontal' | 'vertical' | 'wordmark'

const SRC: Record<LogoVariant, string> = {
  horizontal: '/brand/logo-horizontal.webp',
  vertical: '/brand/logo-vertical.webp',
  wordmark: '/brand/wordmark.webp',
}

export function BrandLogo({
  variant,
  className = '',
}: {
  variant: LogoVariant
  className?: string
}) {
  return <img src={SRC[variant]} alt="Unwind Puzzles" className={className} draggable={false} />
}
