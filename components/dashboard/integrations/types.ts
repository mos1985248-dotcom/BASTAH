// components/dashboard/integrations/types.ts — شكل استجابة GET /api/stores/marketing-links (واجهة التاجر)
export interface AccountType { key: string; label: string; example: string }
export interface AccountLink { platform: string; url: string }
export interface ServiceView { key: string; label: string; description: string }
export interface MerchantIntegrations {
  links: AccountLink[];
  platforms: AccountType[];
  services: ServiceView[];
  hubReady: boolean;
}
