export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main A letter */}
      <path
        d="M100 20 L45 170 L65 170 L78 130 L122 130 L135 170 L155 170 L100 20Z"
        fill="#3B82F6"
      />
      {/* A crossbar cutout */}
      <path d="M85 115 L100 60 L115 115Z" fill="white" />

      {/* Single orbital ring */}
      <ellipse
        cx="100"
        cy="105"
        rx="95"
        ry="40"
        stroke="#3B82F6"
        strokeWidth="7"
        fill="none"
        transform="rotate(-25 100 105)"
      />
    </svg>
  );
}
