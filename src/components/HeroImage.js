import Image from 'next/image';

/**
 * HeroImage Component
 * Optimized for maximum Core Web Vitals performance (LCP < 1.5s):
 * - Uses Next.js <Image /> with priority={true} for instant browser discovery
 * - Quality set to 85 for sharp luxury imagery at minimal byte size
 * - fill + sizes="100vw" for responsive AVIF/WebP srcset generation
 */
export default function HeroImage({
  src = 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1920&q=85',
  alt = 'ORLUXUS Exclusive Luxury Experience',
  priority = true,
  quality = 85,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`hero-image-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...style,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        quality={quality}
        sizes="100vw"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
    </div>
  );
}
