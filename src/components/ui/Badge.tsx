interface BadgeProps {
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

const config = {
  NOT_STARTED: { label: "Ikke startet", className: "bg-gray-100 text-gray-600" },
  IN_PROGRESS: { label: "P\u00e5g\u00e5r", className: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "Fullf\u00f8rt", className: "bg-green-100 text-green-700" },
};

export function Badge({ status }: BadgeProps) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
