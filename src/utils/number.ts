export function formatCount(value: number) {
  if (value < 1000) {
    return `${value}`;
  }

  if (value < 10000) {
    return `${(value / 1000).toFixed(value >= 1100 ? 1 : 0).replace(/\.0$/, "")}k`;
  }

  if (value < 100000000) {
    const wan = value / 10000;
    return `${wan >= 100 ? Math.round(wan) : Number(wan.toFixed(1)).toString()}万`;
  }

  const yi = value / 100000000;
  return `${Number(yi.toFixed(1)).toString()}亿`;
}
