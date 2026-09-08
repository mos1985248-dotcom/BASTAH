// components/shared/address-types.ts
export interface Address {
  id: string;
  label: string;
  name: string;
  city: string;
  region?: string | null;
  address: string;
  isDefault: boolean;
}
