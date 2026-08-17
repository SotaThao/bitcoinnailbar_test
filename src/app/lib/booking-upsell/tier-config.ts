import type { Service } from "@/app/lib/admin-types";
import type { AddonItem, ServiceLine, ServiceLocator } from "./types";

export interface TierConfigEntry {
  lineKey: string;
  label: string;
  foundation: ServiceLocator;
  included: ServiceLocator[];
}

const addOn = (name: string): ServiceLocator => ({ categoryKey: "additional_service", groupName: "General", name });

// Stable menu identity: never use the generated positional service ID here.
export const TIER_CONFIG: TierConfigEntry[] = [
  { lineKey: "pedicure-rituals", label: "Pedicure", foundation: { categoryKey: "pedicure", groupName: "General", name: "Express Pedicure" }, included: [] },
  { lineKey: "pedicure-rituals", label: "Pedicure", foundation: { categoryKey: "pedicure", groupName: "General", name: "Essential Pedicure" }, included: [addOn("Sugar Scrub Exfoliation"), addOn("Callus Removal")] },
  { lineKey: "pedicure-rituals", label: "Pedicure", foundation: { categoryKey: "pedicure", groupName: "General", name: "Milk and Honey" }, included: [addOn("Sugar Scrub Exfoliation"), addOn("Callus Removal"), addOn("Paraffin Wax")] },
  { lineKey: "pedicure-rituals", label: "Pedicure", foundation: { categoryKey: "pedicure", groupName: "General", name: "Bitcoin 24K Gold" }, included: [addOn("Sugar Scrub Exfoliation"), addOn("Callus Removal"), addOn("Paraffin Wax"), addOn("Hot Stone Message Added on"), addOn("Collagen Sock")] },
];

export function locatorKey(locator: ServiceLocator): string {
  return `${locator.categoryKey}|${locator.groupName}|${locator.name}`;
}

export function resolveTierConfig(services: Service[]): { lines: ServiceLine[]; unmatched: ServiceLocator[]; configuredAddons: AddonItem[] } {
  const byLocator = new Map(services.map((service) => [locatorKey({ categoryKey: service.categoryKey || "", groupName: service.groupName || "", name: service.name }), service]));
  const unmatched: ServiceLocator[] = [];
  const configuredAddons = new Map<string, AddonItem>();
  const linesByKey = new Map<string, ServiceLine>();

  TIER_CONFIG.forEach((entry) => {
    const foundationService = byLocator.get(locatorKey(entry.foundation));
    if (!foundationService) {
      unmatched.push(entry.foundation);
      return;
    }
    const included: string[] = [];
    entry.included.forEach((locator) => {
      const addon = byLocator.get(locatorKey(locator));
      if (!addon) {
        unmatched.push(locator);
        return;
      }
      included.push(addon.id);
      configuredAddons.set(addon.id, { id: addon.id, name: addon.name, description: addon.description, price: foundationPrice(addon), time: addon.durationMinutes || 10, source: locator });
    });
    const line = linesByKey.get(entry.lineKey) || { key: entry.lineKey, label: entry.label, foundations: [], addonGroups: [] };
    line.foundations.push({ id: foundationService.id, name: foundationService.name, price: foundationPrice(foundationService), time: foundationService.durationMinutes || 45, included, source: entry.foundation });
    linesByKey.set(entry.lineKey, line);
  });

  const addOns = [...configuredAddons.values()];
  linesByKey.forEach((line) => {
    line.addonGroups = addOns.length ? [{ category: "Enhance your ritual", description: "Add only what you love. Included treatments are clearly marked.", items: addOns }] : [];
  });
  return { lines: [...linesByKey.values()], unmatched, configuredAddons: addOns };
}

function foundationPrice(service: Service): number {
  return typeof service.price === "number" ? service.price : Number(service.price) || 0;
}