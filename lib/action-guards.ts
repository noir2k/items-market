export function requireDeleteConfirmation(formData: FormData): void {
  if (String(formData.get("confirmDelete") || "") !== "on") {
    throw new Error("삭제 확인이 필요합니다.");
  }
}
