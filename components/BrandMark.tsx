export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label="نشان میزانه"
    >
      <path
        d="M10 34h44c-1.8 12.7-10.5 20-22 20S11.8 46.7 10 34Z"
        fill="currentColor"
      />
      <path
        d="M17 34c2-8.2 7-12.3 15-12.3S45 25.8 47 34"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="M33.8 20.7C34.2 11.7 40.2 7 50 8.3c-.9 8.4-6.2 12.6-16.2 12.4Z"
        fill="#9dd24b"
      />
      <path
        d="M29.8 20.5c-1.1-6.7-5.4-10.1-12.9-10.3.2 6.8 4.5 10.3 12.9 10.3Z"
        fill="#ff6b55"
      />
      <path d="M18 58h28" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
    </svg>
  );
}
