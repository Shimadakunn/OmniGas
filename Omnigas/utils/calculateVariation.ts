export const calculateVariation = (
  yesterdayPrice: number,
  todayPrice: number
): string => {
  const variation = ((todayPrice - yesterdayPrice) / yesterdayPrice) * 100;
  return variation > 0 ? `${variation.toFixed(2)}` : `${variation.toFixed(2)}`;
};
