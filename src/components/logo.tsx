import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-6", className)}
    >
      {/* Three claw marks */}
      <path
        d="M8 6C8 6 6 14 7 20C7.5 23 9 25 9 25"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M16 4C16 4 15 12 15.5 18C15.8 21.5 17 25 17 25"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M24 6C24 6 25 14 24.5 20C24 23 22.5 25 22.5 25"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Claw tips */}
      <circle cx="8" cy="5" r="1.8" fill="currentColor" />
      <circle cx="16" cy="3" r="1.8" fill="currentColor" />
      <circle cx="24" cy="5" r="1.8" fill="currentColor" />
    </svg>
  );
}
