import { describe, expect, it } from "vitest";
import { mapVacancyRow } from "@/lib/services/vacancies";

describe("mapVacancyRow", () => {
  it("maps unknown row shape into vacancy", () => {
    const mapped = mapVacancyRow({
      id: "1",
      title: "Backend",
      slug: "backend",
      city: "Salta",
      modality: "Remoto",
      employment_type: "Contrato",
      seniority: "Senior",
      description: "Node",
      requirements: ["Node"],
      nice_to_have: [],
      status: "open",
      created_at: "2025-01-01",
      updated_at: "2025-01-02",
    });

    expect(mapped.title).toBe("Backend");
    expect(mapped.requirements).toEqual(["Node"]);
  });
});
