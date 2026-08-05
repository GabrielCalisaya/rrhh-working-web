import { requireStaffAccess } from "@/lib/auth/guards";
import { listDeletionRequests } from "@/lib/services/privacy";
import { DeletionRequestsManager } from "@/components/admin/DeletionRequestsManager";
import { logError } from "@/lib/observability/log";

export default async function AdminPrivacidadPage() {
  await requireStaffAccess();

  const requests = await listDeletionRequests().catch((error) => {
    logError("AdminPrivacidadPage.list", error);
    return [];
  });

  const pending = requests.filter((item) => item.status === "pending").length;

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Solicitudes de eliminación</h1>
        <p className="mt-1 text-sm text-[var(--color-primary-dark)]">
          Derecho de supresión (Ley 25.326). Verificá la identidad de quien solicita antes de ejecutar el borrado: la
          acción elimina la ficha del candidato, todas sus postulaciones y sus CV de forma permanente.
          {pending > 0 ? ` Hay ${pending} pendiente${pending === 1 ? "" : "s"}.` : ""}
        </p>
      </div>

      <DeletionRequestsManager initialRequests={requests} />
    </section>
  );
}
