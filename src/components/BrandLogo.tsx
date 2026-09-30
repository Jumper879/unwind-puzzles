type Variant = 'full' | 'horizontal' | 'wordmark'
type Tone = 'white' | 'blue' | 'onLight' | 'auto'

const WORDMARK_COLOR: Record<Tone, string> = {
  white: '#ffffff',
  blue: 'var(--blue-500)',
  onLight: 'var(--navy-900)',
  auto: 'var(--home-ink)',
}

/**
 * The real hand-lettered "unwind / PUZZLES" mark, in whatever tone is
 * visible on its background — never the raw raster lockups, which read as
 * mush at small sizes (see /dev/icons).
 *
 * `wordmark` (text only) is a single alpha mask (`wordmark-mask.webp`,
 * chroma-keyed from the source art) recolored live via CSS `mask-image` —
 * one asset serves every tone. `horizontal`/`full` (mascot + text side by
 * side) is two-color, so masking a single flat color isn't enough; those
 * ship as two pre-baked raster variants (onLight navy+blue, dark white+blue)
 * extracted the same way, picked by `tone` instead of recolored live.
 */
export function BrandLogo({
  variant = 'wordmark',
  tone = 'onLight',
  className = '',
  style,
}: {
  variant?: Variant
  tone?: Tone
  className?: string
  style?: React.CSSProperties
}) {
  if (variant === 'wordmark') {
    return (
      <span
        role="img"
        aria-label="Unwind Puzzles"
        className={className}
        style={{
          display: 'block',
          backgroundColor: WORDMARK_COLOR[tone],
          maskImage: 'url(/brand/wordmark-mask.webp)',
          maskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskImage: 'url(/brand/wordmark-mask.webp)',
          WebkitMaskSize: '100% 100%',
          WebkitMaskRepeat: 'no-repeat',
          aspectRatio: '1490 / 462',
          ...style,
        }}
      />
    )
  }

  // `auto` (Home's top bar) must track the page's own light/dark theme, not
  // a caller-chosen tone — it reads the same --brand-logo-horizontal token
  // every other themed value reads, so it flips automatically with the
  // existing tokens.css cascade instead of needing JS theme detection here.
  if (tone === 'auto') {
    return (
      <div
        role="img"
        aria-label="Unwind Puzzles"
        className={className}
        style={{
          backgroundImage: 'var(--brand-logo-horizontal)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          aspectRatio: '899 / 242',
          ...style,
        }}
      />
    )
  }

  const src = tone === 'white' ? '/brand/logo-horizontal-dark.webp' : '/brand/logo-horizontal-onlight.webp'
  return <img src={src} alt="Unwind Puzzles" className={className} style={{ display: 'block', ...style }} />
}
