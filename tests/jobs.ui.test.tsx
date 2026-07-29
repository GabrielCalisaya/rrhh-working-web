import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JobCard } from "@/components/jobs/JobCard";

const vacancy = {
  id: "1",
  title: "QA Engineer",
  slug: "qa-engineer",
  city: "Rosario",
  modality: "Presencial" as const,
  employment_type: "Full-time" as const,
  seniority: "Junior" as const,
  description: "Pruebas manuales y automatizadas",
  requirements: ["Cypress"],
  nice_to_have: [],
  status: "open" as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("JobCard", () => {
  it("renders vacancy data", () => {
    render(React.createElement(JobCard, { vacancy }));

    expect(screen.getByText("QA Engineer")).toBeInTheDocument();
    expect(screen.getByText("Rosario")).toBeInTheDocument();
  });
});
