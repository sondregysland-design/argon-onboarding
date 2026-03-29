export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Orbital ring (behind the A) */}
      <ellipse
        cx="100"
        cy="105"
        rx="95"
        ry="40"
        stroke="#6BA3F7"
        strokeWidth="8"
        fill="none"
        transform="rotate(-25 100 105)"
        opacity="0.5"
      />

      {/* Main A letter */}
      <path
        d="M100 20 L45 170 L65 170 L78 130 L122 130 L135 170 L155 170 L100 20Z"
        fill="#1E40AF"
      />
      {/* A crossbar cutout */}
      <path d="M85 115 L100 60 L115 115Z" fill="white" />

      {/* Orbital ring (front, overlapping the A) */}
      <ellipse
        cx="100"
        cy="105"
        rx="95"
        ry="40"
        stroke="#6BA3F7"
        strokeWidth="8"
        fill="none"
        transform="rotate(-25 100 105)"
        strokeDasharray="160 140"
        strokeDashoffset="80"
      />

      {/* Accent dots */}
      <circle cx="38" cy="55" r="10" fill="#6BA3F7" />
      <circle cx="162" cy="75" r="7" fill="#6BA3F7" />
      <circle cx="155" cy="145" r="10" fill="#6BA3F7" />
    </svg>
  );
}
