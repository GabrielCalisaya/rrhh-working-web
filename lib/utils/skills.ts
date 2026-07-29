export function normalizeSkill(value: string): string {
  return value.trim().toLowerCase();
}

export function calculateSkillsScore(requirements: string[], skills: string[]): { score: number; reasons: string[] } {
  if (requirements.length === 0) {
    return { score: 0, reasons: ["No hay requisitos definidos para evaluar"] };
  }

  const normalizedSkills = new Set(skills.map(normalizeSkill));
  const matched = requirements.filter((item) => normalizedSkills.has(normalizeSkill(item)));
  const score = Math.round((matched.length / requirements.length) * 100);
  const reasons = [
    `Coincidencias: ${matched.length}/${requirements.length}`,
    ...matched.map((item) => `Coincide con ${item}`),
  ];

  return { score, reasons };
}
