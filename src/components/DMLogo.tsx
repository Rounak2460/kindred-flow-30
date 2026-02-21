import { useTheme } from "next-themes";
import logoImg from "@/assets/dm-logo.png";

interface DMLogoProps {
  size?: number;
  className?: string;
}

export default function DMLogo({ size = 32, className = "" }: DMLogoProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        overflow: "hidden",
        borderRadius: size * 0.2,
        flexShrink: 0,
      }}
    >
      <img
        src={logoImg}
        alt="Digi Mitra"
        style={{
          width: size * 2,
          height: size,
          objectFit: "cover",
          objectPosition: isDark ? "right" : "left",
        }}
        draggable={false}
      />
    </div>
  );
}
