import { describe, expect, it } from "vitest";
import { filterVacancies } from "@/lib/services/vacancies";
import type { Vacancy } from "@/lib/types";

const baseVacancy: Vacancy = {
  id: "1",
  title: "Frontend Engineer",
  slug: "frontend-engineer",
  city: "Buenos Aires",
  modality: "Híbrido",
  employment_type: "Full-time",
  seniority: "Semi Senior",
  description: "React y TypeScript",
  requirements: ["React", "TypeScript"],
  nice_to_have: [],
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("filterVacancies", () => {
  it("filters by city and query", () => {
    const vacancies = [baseVacancy, { ...baseVacancy, id: "2", city: "Mendoza", title: "Data Analyst" }];

    const result = filterVacancies(vacancies, { city: "Mendoza", query: "data" });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("2");
  });
});
