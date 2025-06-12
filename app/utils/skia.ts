import { Skia } from '@shopify/react-native-skia';

const createPathFromPoints = (points: [number, number][]) => {
  const path = Skia.Path.Make();
  if (points.length > 0) {
    path.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => path.lineTo(x, y));
  }
  return path;
};

function getSmoothPath(points: { x: number; y: number }[], minPoints = 2) {
    if (points.length < minPoints) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
        const midX = (points[i].x + points[i + 1].x) / 2;
        const midY = (points[i].y + points[i + 1].y) / 2;
        d += ` Q ${points[i].x} ${points[i].y} ${midX} ${midY}`;
    }
    // For the last segment, just draw a line to the last point
    d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
    return d;
}


export {createPathFromPoints, getSmoothPath};