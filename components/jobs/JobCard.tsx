import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { employmentTypeLabel, seniorityLabel } from "@/lib/content/vacancy-labels";
import type { Vacancy } from "@/lib/types";

export function JobCard({ vacancy }: { vacancy: Vacancy }) {
  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">{vacancy.title}</h3>
            <p className="text-sm text-[var(--color-primary-dark)]">{vacancy.city}</p>
          </div>
          <Badge>{seniorityLabel(vacancy.seniority)}</Badge>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <Badge>{vacancy.modality}</Badge>
          <Badge>{employmentTypeLabel(vacancy.employment_type)}</Badge>
        </div>

        <p className="line-clamp-3 text-sm">{vacancy.description}</p>

        <div className="flex justify-end">
          <Link className="text-sm font-semibold text-[var(--color-primary-dark)] hover:underline" href={`/postular/${vacancy.id}`}>
            Ver detalle y postular
          </Link>
        </div>
      </div>
    </Card>
  );
}
