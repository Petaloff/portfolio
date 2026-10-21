// Static isometric voxel cluster used in the lightweight version

const cubes: [number, number, number][] = [
  [0, 0, 0],
  [1, 0, 0],
  [2, 0, 0],
  [0, 1, 0],
  [1, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [0, 0, 2],
  [0, 1, 1],
  [0, 2, 0],
  [2, 1, 0],
  [1, 0, 2],
];

export function LiteVoxels() {
  const s = 28;
  const iso = ([x, y, z]: [number, number, number]) => ({
    x: (x - z) * s * 0.87,
    y: (x + z) * s * 0.5 - y * s,
  });
  const sorted = [...cubes].sort((a, b) => a[0] + a[2] - (b[0] + b[2]) || a[1] - b[1]);
  return (
    <svg
      viewBox="-140 -110 280 220"
      className="absolute top-[12%] right-[-6%] w-[70vw] max-w-[520px] opacity-25 md:opacity-40"
    >
      {sorted.map((c) => {
        const { x, y } = iso(c);
        const h = s * 0.87;
        const accent = c[0] === 2 && c[1] === 1;
        return (
          <g key={c.join()} transform={`translate(${x} ${y})`}>
            <path
              d={`M0 ${-s} L${h} ${-s / 2} L0 0 L${-h} ${-s / 2}Z`}
              fill={accent ? "var(--accent)" : "var(--fg)"}
              opacity={0.9}
            />
            <path d={`M${-h} ${-s / 2} L0 0 L0 ${s} L${-h} ${s / 2}Z`} fill="var(--fg)" opacity={0.55} />
            <path d={`M${h} ${-s / 2} L0 0 L0 ${s} L${h} ${s / 2}Z`} fill="var(--fg)" opacity={0.3} />
          </g>
        );
      })}
    </svg>
  );
}
