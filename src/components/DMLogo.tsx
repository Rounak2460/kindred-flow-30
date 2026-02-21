interface DMLogoProps {
  size?: number;
  className?: string;
}

export default function DMLogo({ size = 32, className = "" }: DMLogoProps) {
  const id = `dm-${size}-${Math.random().toString(36).slice(2, 6)}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.8)" />
        </linearGradient>
      </defs>
      {/* Rounded square */}
      <rect width="48" height="48" rx="12" fill={`url(#${id}-bg)`} />
      {/* D */}
      <path
        d="M10 12h6c6.1 0 10 4 10 10s-3.9 10-10 10h-6V12zm4.2 3.6v12.8H16c4 0 6.4-2.6 6.4-6.4s-2.4-6.4-6.4-6.4h-1.8z"
        fill="white"
      />
      {/* M */}
      <path
        d="M28 32V12h3.6l4.4 13h.1l4.4-13H44v20h-3.4V18.4h-.1L36.4 30h-2.2l-4-11.6h-.1V32H28z"
        fill="white"
      />
    </svg>
  );
}
