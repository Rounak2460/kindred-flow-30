interface DMLogoProps {
  size?: number;
  className?: string;
}

export default function DMLogo({ size = 32, className = "" }: DMLogoProps) {
  const id = `dm-grad-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.75)" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect width="40" height="40" rx="11" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="40" height="40" rx="11" fill={`url(#${id})`} />
        {/* Subtle inner glow */}
        <rect width="40" height="40" rx="11" fill="white" opacity="0.06" />
        {/* D letterform — geometric half-circle + vertical bar */}
        <path
          d="M7.5 10h4.8c5.2 0 8.2 3.2 8.2 7.5S17.5 25 12.3 25H10v5h-2.5V10z M10 12.8v9.4h2.3c3.4 0 5.4-2 5.4-4.7s-2-4.7-5.4-4.7H10z"
          fill="white"
          opacity="0.95"
        />
        {/* M letterform — clean angular strokes */}
        <path
          d="M22 10h2.8l4 11.5h.1L33 10h2.8V30H33.3V14.8h-.1L29.5 25h-1.8l-3.7-10.2h-.1V30H22V10z"
          fill="white"
          opacity="0.95"
        />
      </g>
    </svg>
  );
}
