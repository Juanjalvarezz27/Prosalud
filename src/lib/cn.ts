// Combina clases CSS condicionales evitando valores falsy
export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}
