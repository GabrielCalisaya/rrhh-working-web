"use client";

import { useState } from "react";
import type { AppRole } from "@/lib/types";

type ProfileItem = {
  id: string;
  full_name: string;
  role: AppRole;
};

type UsersRolesManagerProps = {
  initialProfiles: ProfileItem[];
};

export function UsersRolesManager({ initialProfiles }: UsersRolesManagerProps) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [message, setMessage] = useState<string | null>(null);

  async function updateRole(id: string, role: AppRole) {
    setMessage(null);
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    const result = (await response.json()) as { data?: ProfileItem; error?: string };

    if (!response.ok || !result.data) {
      setMessage(result.error ?? "No se pudo actualizar el rol");
      return;
    }

    setProfiles((current) => current.map((profile) => (profile.id === id ? { ...profile, role: result.data?.role ?? profile.role } : profile)));
    setMessage("Rol actualizado");
  }

  return (
    <section className="space-y-4">
      {message ? <p className="text-sm text-[var(--color-primary-dark)]">{message}</p> : null}
      <div className="overflow-x-auto rounded-lg border border-[var(--color-accent)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-accent)]">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Rol</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className="border-b border-[var(--color-accent)] last:border-0">
                <td className="px-4 py-3 text-xs">{profile.id}</td>
                <td className="px-4 py-3">{profile.full_name}</td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-md border border-[var(--color-accent)] bg-white px-2 py-1 text-sm"
                    value={profile.role}
                    onChange={(event) => updateRole(profile.id, event.target.value as AppRole)}
                  >
                    <option value="admin">admin</option>
                    <option value="recruiter">recruiter</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
