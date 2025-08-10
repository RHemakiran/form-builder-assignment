
export function evaluateDerivedField(
  derived: { parentIds: string[]; formula: string },
  values: Record<string, unknown>
): unknown {
  try {
    const scope: Record<string, unknown> = {};
    derived.parentIds.forEach((id) => {
      scope[id] = values[id];
    });
    // Simple formula evaluator
    // Example formula: `${parent1} + ${parent2}`
    // Uses Function constructor for flexibility (CAUTION: only for trusted formulas)
    // For production, use a math parser library
    const fn = new Function(...Object.keys(scope), `return ${derived.formula}`);
    return fn(...Object.values(scope));
  } catch {
    return null;
  }
}