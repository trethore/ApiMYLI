export const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
  const parsedValue = Number.parseInt(value ?? "", 10);

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
};

export const parseIntegerInRange = (
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number => {
  const parsedValue = Number.parseInt(value ?? "", 10);

  return Number.isInteger(parsedValue) && parsedValue >= minimum && parsedValue <= maximum
    ? parsedValue
    : fallback;
};
