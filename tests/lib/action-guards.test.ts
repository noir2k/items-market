import { describe, expect, it } from "vitest";
import { requireDeleteConfirmation } from "../../lib/action-guards";

describe("requireDeleteConfirmation", () => {
  it("throws when the delete confirmation checkbox is missing", () => {
    expect(() => requireDeleteConfirmation(new FormData())).toThrow("삭제 확인이 필요합니다.");
  });

  it("allows deletion when the confirmation checkbox is checked", () => {
    const formData = new FormData();
    formData.set("confirmDelete", "on");

    expect(() => requireDeleteConfirmation(formData)).not.toThrow();
  });
});
