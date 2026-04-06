import cannafyIcon from "@/assets/cannafy-icon.png";

interface CannafyIconProps {
  className?: string;
}

export function CannafyIcon({ className = "h-6 w-auto" }: CannafyIconProps) {
  return (
    <img
      src={cannafyIcon}
      alt="Cannafy"
      className={className}
      draggable={false}
    />
  );
}
