import { cn } from "@/lib/utils";

export const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-6 h-6", className)}
    {...props}
  >
    <path d="M12 8V4H8" />
    <rect x="4" y="12" width="16" height="8" rx="2" />
    <path d="M12 12v4" />
    <path d="M16 12v4" />
    <path d="M8 12v4" />
  </svg>
);
