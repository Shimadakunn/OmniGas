export const roundToNearestMultiple = (
  value: number,
  step: number,
  roundDown: boolean
): number => {
  const inverse = 1.0 / step;
  return roundDown
    ? Math.floor(value * inverse) / inverse
    : Math.ceil(value * inverse) / inverse;
};

export const determineStepSize = (range: number): number => {
  const magnitude = Math.pow(10, Math.floor(Math.log10(range)));
  if (range / magnitude >= 5) return magnitude;
  if (range / magnitude >= 2) return magnitude / 2;
  return magnitude / 5;
};
