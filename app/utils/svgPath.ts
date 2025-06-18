export default function getSvgPathFromPoints(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  const d = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');
  return d;
}
