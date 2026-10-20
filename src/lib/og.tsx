import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

// Geist with Cyrillic, bundled so titles in Russian render correctly
const fonts = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Geist-Regular.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Geist-Bold.ttf")),
]);

// Small voxel cluster in the corner, echoing the site's 3D nickname
const voxels: [number, number, boolean][] = [
  [0, 0, false], [1, 0, false], [2, 0, true], [0, 1, false], [1, 1, false],
  [0, 2, false], [3, 0, false], [1, 2, true], [2, 1, false], [0, 3, false],
];

export async function renderOg({ kicker, title, subtitle }: { kicker: string; title: string; subtitle?: string }) {
  const [regular, bold] = await fonts;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0b0c",
          color: "#ededeb",
          padding: 72,
          fontFamily: "Geist",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", right: 72, top: 72, display: "flex" }}>
          {voxels.map(([x, y, accent]) => (
            <div
              key={`${x}-${y}`}
              style={{
                position: "absolute",
                right: x * 34,
                top: y * 34,
                width: 30,
                height: 30,
                background: accent ? "#7bd88f" : "#2a2a2d",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#7bd88f", letterSpacing: 4, textTransform: "uppercase" }}>
          {kicker}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 960 }}>
          <div style={{ fontSize: title.length > 40 ? 64 : 80, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            {title}
          </div>
          {subtitle && <div style={{ fontSize: 30, color: "#8a8a86", lineHeight: 1.35 }}>{subtitle}</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#8a8a86" }}>
          <div style={{ display: "flex" }}>
            petaloff<span style={{ color: "#7bd88f" }}>_</span>
          </div>
          <div style={{ display: "flex" }}>Discord · Minecraft · Web</div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
