import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { logoCursor, logoVoxels } from "./logo";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

// Geist with Cyrillic, bundled so titles in Russian render correctly
const fonts = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Geist-Regular.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Geist-Bold.ttf")),
]);

// The voxel P logo in the corner
const pitch = 34;
const cell = 30;

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
        <div style={{ position: "absolute", right: 72, top: 72, width: pitch * 4, height: pitch * 5, display: "flex" }}>
          {logoVoxels.map(([x, y]) => (
            <div
              key={`${x}-${y}`}
              style={{ position: "absolute", left: x * pitch, top: y * pitch, width: cell, height: cell, background: "#3a3a3e" }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: logoCursor.x * pitch,
              top: logoCursor.y * pitch,
              width: logoCursor.width * pitch - (pitch - cell),
              height: cell,
              background: "#7bd88f",
            }}
          />
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#7bd88f", letterSpacing: 4, textTransform: "uppercase" }}>
          {kicker}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 840 }}>
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
