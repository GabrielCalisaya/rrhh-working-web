import { beforeEach, describe, expect, it, vi } from "vitest";

const getStaffSession = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getStaffSession: () => getStaffSession(),
}));

const { requireStaffApi } = await import("@/lib/auth/api-guards");
const { isAppError } = await import("@/lib/errors");

function session(role: string | null) {
  return { user: { id: "11111111-1111-1111-1111-111111111111" }, role, fullName: "Test" };
}

async function statusOf(promise: Promise<unknown>) {
  try {
    await promise;
    return "ok";
  } catch (error) {
    return isAppError(error) ? error.status : "unknown-error";
  }
}

describe("requireStaffApi", () => {
  beforeEach(() => {
    getStaffSession.mockReset();
  });

  it("rejects anonymous requests with 401", async () => {
    getStaffSession.mockResolvedValue(null);
    expect(await statusOf(requireStaffApi())).toBe(401);
  });

  it("rejects authenticated users without a role with 403", async () => {
    // Caso real: alguien con cuenta en auth.users pero sin fila en profiles.
    getStaffSession.mockResolvedValue(session(null));
    expect(await statusOf(requireStaffApi())).toBe(403);
  });

  it("allows recruiter on staff endpoints", async () => {
    getStaffSession.mockResolvedValue(session("recruiter"));
    const staff = await requireStaffApi();
    expect(staff.role).toBe("recruiter");
    expect(staff.userId).toBe("11111111-1111-1111-1111-111111111111");
  });

  it("allows admin on staff endpoints", async () => {
    getStaffSession.mockResolvedValue(session("admin"));
    expect((await requireStaffApi()).role).toBe("admin");
  });

  it("blocks recruiter on admin-only endpoints", async () => {
    // /api/admin/users: solo admin puede cambiar roles.
    getStaffSession.mockResolvedValue(session("recruiter"));
    expect(await statusOf(requireStaffApi(["admin"]))).toBe(403);
  });

  it("allows admin on admin-only endpoints", async () => {
    getStaffSession.mockResolvedValue(session("admin"));
    expect((await requireStaffApi(["admin"])).role).toBe("admin");
  });

  it("rejects unknown roles even if they reach the session", async () => {
    getStaffSession.mockResolvedValue(session("superuser"));
    expect(await statusOf(requireStaffApi())).toBe(403);
  });
});
