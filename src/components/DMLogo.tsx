interface DMLogoProps {
  size?: number;
  className?: string;
}

export default function DMLogo({ size = 32, className = "" }: DMLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="40" height="40" rx="10" className="fill-primary" />
      <path
        d="M8 11h5.5c4.8 0 7.8 3 7.8 7.2s-3 7.3-7.8 7.3H8V11zm3.2 2.6v9.3h2.2c3 0 4.7-1.8 4.7-4.7 0-2.8-1.7-4.6-4.7-4.6h-2.2z"
        className="fill-primary-foreground"
      />
      <path
        d="M22.5 11h3.4l3.5 9.5h.1L33 11h3.4v14.5H33.8V15.2h-.1l-3.2 8.6h-2l-3.2-8.6h-.1v10.3H22.5V11z"
        className="fill-primary-foreground"
      />
      <rect x="8" y="28.5" width="28" height="1.5" rx="0.75" className="fill-primary-foreground" opacity="0.4" />
    </svg>
  );
}
