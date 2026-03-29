export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M20 4L6 36h6l2.5-6h11L28 36h6L20 4zm-3.5 20L20 14l3.5 10h-7z"
        fill="#1E40AF"
      />
      <ellipse
        cx="20"
        cy="20"
        rx="18"
        ry="8"
        stroke="#3B82F6"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
        transform="rotate(-30 20 20)"
      />
      <circle cx="8" cy="12" r="2" fill="#3B82F6" opacity="0.8" />
      <circle cx="33" cy="27" r="2" fill="#3B82F6" opacity="0.8" />
    </svg>
  );
}
