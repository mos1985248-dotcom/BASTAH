// components/admin/integrations/types.ts — شكل استجابة GET /api/admin/integrations
export interface ProviderField { name: string; label: string; placeholder?: string; secret?: boolean; generate?: boolean }
export interface ProviderView {
  key: string; label: string; description: string; fields: ProviderField[];
  configured: boolean; summary: string | null; lastTestedAt: string | null; lastTestOk: boolean | null;
}
export interface EventView { key: string; label: string; description: string; enabled: boolean; providers: string[] }
export interface AccountTypeView { key: string; label: string; enabled: boolean; links: number }
export interface Overview {
  providers: ProviderView[]; events: EventView[]; accountTypes: AccountTypeView[];
  stats: { linkedStores: number; links: number };
}

