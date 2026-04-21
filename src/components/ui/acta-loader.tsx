'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

const frames = ['/ACTA1.png', '/ACTA2.png', '/ACTA3.png'] as const;

interface ActaLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  subtext?: string;
}

/**
 * Minimalist loader that cycles through the 3 ACTA logo pieces
 * using pure CSS keyframe animation (no JS intervals).
 */
export function ActaLoader({ size = 'md', className, text, subtext }: ActaLoaderProps) {
  const sizeMap = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-24 w-24',
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className={cn('relative', sizeMap[size])}>
        {frames.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            width={56}
            height={56}
            priority
            className={cn(
              'absolute inset-0 h-full w-full object-contain',
              'acta-loader-frame'
            )}
            style={{ animationDelay: `${i * 0.9}s` }}
          />
        ))}
      </div>
      {text && <p className="text-sm text-white/80">{text}</p>}
      {subtext && <p className="text-xs text-white/50">{subtext}</p>}
    </div>
  );
}

/**
 * Inline variant for buttons — single image with pulse.
 */
export function ActaLoaderInline({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-block h-4 w-4', className)}>
      {frames.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          width={16}
          height={16}
          priority
          className="absolute inset-0 h-full w-full object-contain acta-loader-frame"
          style={{ animationDelay: `${i * 0.9}s` }}
        />
      ))}
    </span>
  );
}
