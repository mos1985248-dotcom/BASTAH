// Stored in the existing nullable provider-reference column, outside Moyasar's UUID namespace.
export const moyasarCreationPending = "checkout:pending";
export const moyasarCreationRejected = "checkout:rejected";

export function isMoyasarInvoiceReference(value: string | null | undefined): value is string {
  return !!value && value !== moyasarCreationPending && value !== moyasarCreationRejected;
}
