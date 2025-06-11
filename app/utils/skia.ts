import { Skia } from '@shopify/react-native-skia';

const createPathFromPoints = (points: [number, number][]) => {
  const path = Skia.Path.Make();
  if (points.length > 0) {
    path.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => path.lineTo(x, y));
  }
  return path;
};


export {createPathFromPoints};