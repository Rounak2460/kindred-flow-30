import { useTheme } from "next-themes";
import logoLight from "@/assets/dm-logo-light.png";
import logoDark from "@/assets/dm-logo-dark.png";

interface DMLogoProps {
  size?: number;
  className?: string;
}

export default function DMLogo({ size = 32, className = "" }: DMLogoProps) {
  const { resolvedTheme } = useTheme();
  const src = resolvedTheme === "dark" ? logoDark : logoLight;

  return (
    <div
      className={className}
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <img
        src={src}
        alt="Digi Mitra"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        draggable={false}
      />
    </div>
  );
}
