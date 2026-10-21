import { describe, expect, it } from "vitest";

import { can, checkUserChange, validateNewPassword, validateNewUser } from "./user-rules";

const admin = { id: 1, role: "admin" as const, active: true };
const otherAdmin = { id: 2, role: "admin" as const, active: true };
const user = { id: 3, role: "user" as const, active: true };

describe("can", () => {
  it("gives admins every permission", () => {
    expect(can("admin", "manage-users")).toBe(true);
    expect(can("admin", "edit-catalog")).toBe(true);
    expect(can("admin", "edit-sod-curation")).toBe(true);
    expect(can("admin", "view-all-activity")).toBe(true);
  });

  it("gives plain users none of the admin permissions", () => {
    expect(can("user", "manage-users")).toBe(false);
    expect(can("user", "edit-catalog")).toBe(false);
    expect(can("user", "edit-sod-curation")).toBe(false);
    expect(can("user", "view-all-activity")).toBe(false);
  });
});

describe("validateNewPassword", () => {
  it("rejects passwords shorter than 8 characters", () => {
    expect(validateNewPassword("1234567")).toMatch(/8 caracteres/);
  });

  it("accepts an 8+ character password", () => {
    expect(validateNewPassword("12345678")).toBeNull();
  });
});

describe("validateNewUser", () => {
  it("accepts a well-formed user", () => {
    expect(
      validateNewUser({ username: "maria.silva", fullName: "Maria Silva", password: "segredo123", role: "user" })
    ).toBeNull();
  });

  it("rejects usernames with spaces or uppercase", () => {
    expect(validateNewUser({ username: "Maria Silva", fullName: "Maria", password: "segredo123", role: "user" })).toMatch(
      /usuário/i
    );
  });

  it("requires a full name", () => {
    expect(validateNewUser({ username: "maria", fullName: "  ", password: "segredo123", role: "user" })).toMatch(/nome/i);
  });

  it("rejects an unknown role", () => {
    expect(validateNewUser({ username: "maria", fullName: "Maria", password: "segredo123", role: "root" })).toMatch(
      /perfil/i
    );
  });
});

describe("checkUserChange", () => {
  it("blocks an admin from deactivating themselves", () => {
    expect(checkUserChange(admin, admin, { active: false }, [admin, otherAdmin])).toMatch(/própria conta/);
  });

  it("blocks an admin from demoting themselves", () => {
    expect(checkUserChange(admin, admin, { role: "user" }, [admin, otherAdmin])).toMatch(/própria conta/);
  });

  it("blocks an admin from deleting themselves", () => {
    expect(checkUserChange(admin, admin, "delete", [admin, otherAdmin])).toMatch(/própria conta/);
  });

  it("blocks removing the last active admin", () => {
    const inactiveAdmin = { ...otherAdmin, active: false };
    expect(checkUserChange(inactiveAdmin, { ...admin, id: 9 }, "delete", [admin, inactiveAdmin])).toBeNull();
    expect(checkUserChange({ ...admin, id: 9 }, admin, { role: "user" }, [admin, user])).toMatch(/último administrador/);
  });

  it("allows editing another user freely", () => {
    expect(checkUserChange(admin, user, { active: false }, [admin, user])).toBeNull();
    expect(checkUserChange(admin, user, "delete", [admin, user])).toBeNull();
    expect(checkUserChange(admin, user, { role: "admin" }, [admin, user])).toBeNull();
  });

  it("allows demoting an admin when another active admin remains", () => {
    expect(checkUserChange(admin, otherAdmin, { role: "user" }, [admin, otherAdmin])).toBeNull();
  });
});
