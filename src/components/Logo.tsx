import { logoCursor, logoVoxels } from "@/lib/logo";

// Inline mark so it follows the text color; the cursor blinks like the one in a terminal
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 20" aria-hidden className={className}>
      <g fill="currentColor">
        {logoVoxels.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x * 4} y={y * 4} width={3.4} height={3.4} />
        ))}
      </g>
      <rect
        x={logoCursor.x * 4}
        y={logoCursor.y * 4}
        width={logoCursor.width * 4 - 0.6}
        height={3.4}
        className="logo-cursor fill-accent"
      />
    </svg>
  );
}
