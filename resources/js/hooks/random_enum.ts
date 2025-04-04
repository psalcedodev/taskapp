export function randomEnum<T>(anEnum: T): T[keyof T] {
  const enumValues = Object.values(anEnum as any) as T[keyof T][];
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex];
}
