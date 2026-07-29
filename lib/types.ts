export type AppRole = "admin" | "recruiter";
export type VacancyStatus = "open" | "closed" | "draft";
export type ApplicationStatus = "new" | "review" | "shortlist" | "rejected" | "hired";

export type Vacancy = {
  id: string;
  title: string;
  slug: string;
  city: string;
  modality: "Presencial" | "Híbrido" | "Remoto";
  employment_type: "Full-time" | "Part-time" | "Contrato" | "Pasantía";
  seniority: "Junior" | "Semi Senior" | "Senior" | "Lead";
  description: string;
  requirements: string[];
  nice_to_have: string[];
  status: VacancyStatus;
  created_at: string;
  updated_at: string;
};

export type Candidate = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  skills: string[];
  cv_file_path: string | null;
  consent: boolean;
  created_at: string;
};

export type Application = {
  id: string;
  vacancy_id: string;
  candidate_id: string;
  cover_letter: string | null;
  status: ApplicationStatus;
  created_at: string;
};

export type VacancyFilters = {
  city?: string;
  modality?: Vacancy["modality"];
  seniority?: Vacancy["seniority"];
  query?: string;
};
