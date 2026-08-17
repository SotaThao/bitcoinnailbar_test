export interface ServiceLocator {
  categoryKey: string;
  groupName: string;
  name: string;
}

export interface Foundation {
  id: string;
  name: string;
  price: number;
  time: number;
  included: string[];
  source: ServiceLocator;
}

export interface AddonItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  time: number;
  source?: ServiceLocator;
}

export interface AddonGroup {
  category: string;
  description?: string;
  items: AddonItem[];
}

export interface ServiceLine {
  key: string;
  label: string;
  foundations: Foundation[];
  addonGroups: AddonGroup[];
}

export interface CartLine {
  lineKey: string;
  baseId: string;
  addonIds: string[];
}

export interface UpsellCandidate {
  id: string;
  name: string;
  priceDiff: number;
  targetPrice: number;
  newTotal: number;
  keptValue: number;
  overlapCount: number;
}

export interface UpsellContent {
  type: "price_upgrade" | "same_price_more_value" | "lower_price_package";
  label: string;
  description: string;
  buttonText: string;
  nudgeText: string;
}

export interface UpsellResult {
  currentTotal: number;
  currentBase: Foundation;
  currentAddons: AddonItem[];
  currentTime: number;
  target: UpsellCandidate | null;
}

export interface CartCalculation {
  grandTotal: number;
  grandTime: number;
  servicesData: Array<{ cartLine: CartLine; line: ServiceLine; item: Foundation; addons: AddonItem[]; currentTotal: number; time: number }>;
  upsells: Record<string, UpsellResult>;
  firstUpsell: (UpsellResult & { lineKey: string }) | null;
}