import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
}

export function Card({ padding = "md", className = "", children, ...props }: CardProps) {
  const paddings = { sm: "p-4", md: "p-6", lg: "p-8" };
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 ${paddings[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
}
