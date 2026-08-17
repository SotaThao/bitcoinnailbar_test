import type { AddonItem, CartCalculation, CartLine, ServiceLine, UpsellCandidate, UpsellContent, UpsellResult } from "./types";

export function calculateUpsell(cartLine: CartLine, line: ServiceLine, addonsById: Map<string, AddonItem>): UpsellResult {
  const currentBase = line.foundations.find((foundation) => foundation.id === cartLine.baseId);
  if (!currentBase) throw new Error(`Unknown foundation ${cartLine.baseId} in ${line.key}`);
  let currentTotal = currentBase.price;
  let currentTime = currentBase.time;
  const currentAddons: AddonItem[] = [];
  cartLine.addonIds.forEach((id) => {
    const addon = addonsById.get(id);
    if (addon) {
      currentTotal += addon.price;
      currentTime += addon.time;
      currentAddons.push(addon);
    }
  });

  const currentAddonIds = cartLine.addonIds;
  let bestCandidate: UpsellCandidate | null = null;
  if (currentAddonIds.length > 0) {
    const currentIndex = line.foundations.findIndex((foundation) => foundation.id === cartLine.baseId);
    for (let index = currentIndex + 1; index < line.foundations.length; index += 1) {
      const target = line.foundations[index];
      const overlappingIds = target.included.filter((id) => currentAddonIds.includes(id));
      const overlapCount = overlappingIds.length;
      if (overlapCount === 0) continue;
      let keptValue = 0;
      currentAddonIds.forEach((id) => {
        if (!target.included.includes(id)) keptValue += addonsById.get(id)?.price || 0;
      });
      const newTotal = target.price + keptValue;
      const priceDiff = newTotal - currentTotal;
      if (!bestCandidate || overlapCount > bestCandidate.overlapCount || (overlapCount === bestCandidate.overlapCount && priceDiff < bestCandidate.priceDiff)) {
        bestCandidate = { id: target.id, name: target.name, priceDiff, targetPrice: target.price, newTotal, keptValue, overlapCount };
      }
    }
  }
  return { currentTotal, currentBase, currentAddons, currentTime, target: bestCandidate };
}

export function calculateAll(cartLines: CartLine[], lines: ServiceLine[], addonsById: Map<string, AddonItem>): CartCalculation {
  let grandTotal = 0;
  let grandTime = 0;
  const servicesData: CartCalculation["servicesData"] = [];
  const upsells: Record<string, UpsellResult> = {};
  cartLines.forEach((cartLine) => {
    const line = lines.find((item) => item.key === cartLine.lineKey);
    if (!line) return;
    const result = calculateUpsell(cartLine, line, addonsById);
    grandTotal += result.currentTotal;
    grandTime += result.currentTime;
    servicesData.push({ cartLine, line, item: result.currentBase, addons: result.currentAddons, currentTotal: result.currentTotal, time: result.currentTime });
    if (result.target) upsells[cartLine.lineKey] = result;
  });
  const first = Object.entries(upsells)[0];
  return { grandTotal, grandTime, servicesData, upsells, firstUpsell: first ? { lineKey: first[0], ...first[1] } : null };
}

export function getUpsellContent(target: UpsellCandidate, currentBaseName: string, currentTotal: number): UpsellContent {
  if (target.priceDiff > 0) return { type: "price_upgrade", label: "A better value for you", description: `Complete the ritual for $${target.priceDiff} more. Upgrade to ${target.name} - $${target.newTotal} total.`, buttonText: `UPGRADE TO ${target.name.toUpperCase()} - $${target.newTotal}`, nudgeText: `Add $${target.priceDiff} for ${target.name}` };
  if (target.priceDiff === 0) return { type: "same_price_more_value", label: "Get more for the same price", description: `Your custom ${currentBaseName} is $${currentTotal}. ${target.name}${target.keptValue > 0 ? " with your other add-ons" : ""} is also $${target.newTotal} and includes the complete signature ritual.`, buttonText: `Switch to ${target.name} - $${target.newTotal}`, nudgeText: `Same price - more included with ${target.name}` };
  return { type: "lower_price_package", label: "A better value for you", description: `Switch to ${target.name} and save $${Math.abs(target.priceDiff)}. ${target.name} - $${target.newTotal} total.`, buttonText: `Switch to ${target.name} - $${target.newTotal}`, nudgeText: `Save $${Math.abs(target.priceDiff)} - switch to ${target.name}` };
}