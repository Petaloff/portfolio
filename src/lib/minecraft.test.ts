import { describe, expect, it } from "vitest";
import { fallbackSkin, skinFromTextures } from "./minecraft";

const encode = (data: unknown) => Buffer.from(JSON.stringify(data)).toString("base64");
const hash = "a".repeat(64);

describe("skinFromTextures", () => {
  it("points at the texture by its hash", () => {
    const value = encode({ textures: { SKIN: { url: `http://textures.minecraft.net/texture/${hash}` } } });
    expect(skinFromTextures("Petaloff", value)).toEqual({
      name: "Petaloff",
      id: hash,
      url: `/api/skin/${hash}`,
      slim: false,
    });
  });

  it("notices slim arms", () => {
    const value = encode({
      textures: { SKIN: { url: `http://textures.minecraft.net/texture/${hash}`, metadata: { model: "slim" } } },
    });
    expect(skinFromTextures("Petaloff", value)?.slim).toBe(true);
  });

  it("gives up on anything else", () => {
    expect(skinFromTextures("x", "not base64 json")).toBeNull();
    expect(skinFromTextures("x", encode({ textures: {} }))).toBeNull();
    expect(skinFromTextures("x", encode({ textures: { SKIN: { url: "http://evil/texture/../x" } } }))).toBeNull();
  });
});

describe("fallbackSkin", () => {
  it("uses the name with mc-heads", () => {
    expect(fallbackSkin("Petaloff").url).toBe("https://mc-heads.net/skin/Petaloff");
  });
});
