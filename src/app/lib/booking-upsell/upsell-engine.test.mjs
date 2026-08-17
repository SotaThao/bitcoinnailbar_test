import test from "node:test";
import assert from "node:assert/strict";
import { calculateAll, calculateUpsell, getUpsellContent } from "./upsell-engine.ts";
import { resolveTierConfig, TIER_CONFIG } from "./tier-config.ts";

const addon = (id, price, time = 10) => ({ id, name: id, price, time });
const addons = new Map([["scrub", addon("scrub", 8)], ["callus", addon("callus", 10)], ["paraffin", addon("paraffin", 15)], ["art", addon("art", 20)]]);
const line = (foundations) => ({ key: "pedi", label: "Pedicure", foundations, addonGroups: [] });
const base = (id, price, included = []) => ({ id, name: id, price, time: 30, included, source: { categoryKey: "x", groupName: "y", name: id } });

test("no add-ons produces no upsell", () => {
  assert.equal(calculateUpsell({ lineKey: "pedi", baseId: "one", addonIds: [] }, line([base("one", 35), base("two", 42, ["scrub"])]), addons).target, null);
});

test("tiers without overlap produce no upsell", () => {
  assert.equal(calculateUpsell({ lineKey: "pedi", baseId: "one", addonIds: ["art"] }, line([base("one", 35), base("two", 42, ["scrub"])]), addons).target, null);
});

test("positive difference uses price upgrade copy", () => {
  const result = calculateUpsell({ lineKey: "pedi", baseId: "one", addonIds: ["scrub"] }, line([base("one", 35), base("two", 50, ["scrub"])]), addons);
  assert.equal(result.target?.priceDiff, 7);
  assert.equal(getUpsellContent(result.target, result.currentBase.name, result.currentTotal).type, "price_upgrade");
});

test("zero difference uses same-price copy without Save $0", () => {
  const result = calculateUpsell({ lineKey: "pedi", baseId: "one", addonIds: ["scrub"] }, line([base("one", 35), base("two", 43, ["scrub"])]), addons);
  const content = getUpsellContent(result.target, result.currentBase.name, result.currentTotal);
  assert.equal(content.type, "same_price_more_value");
  assert.ok(!JSON.stringify(content).includes("Save $0"));
});

test("negative difference uses lower-price package copy", () => {
  const result = calculateUpsell({ lineKey: "pedi", baseId: "one", addonIds: ["scrub", "callus"] }, line([base("one", 35), base("two", 45, ["scrub", "callus"])]), addons);
  assert.equal(getUpsellContent(result.target, result.currentBase.name, result.currentTotal).type, "lower_price_package");
});

test("equal overlap chooses the smaller price difference", () => {
  const result = calculateUpsell({ lineKey: "pedi", baseId: "one", addonIds: ["scrub"] }, line([base("one", 35), base("two", 50, ["scrub"]), base("three", 45, ["scrub"])]), addons);
  assert.equal(result.target?.id, "three");
});

test("kept value retains add-ons outside the package", () => {
  const result = calculateUpsell({ lineKey: "pedi", baseId: "one", addonIds: ["scrub", "art"] }, line([base("one", 35), base("two", 50, ["scrub"])]), addons);
  assert.equal(result.target?.keptValue, 20);
  assert.equal(result.target?.newTotal, 70);
});

test("calculateAll never proposes a tier from another line", () => {
  const other = { ...line([base("foreign", 40, ["scrub"])]), key: "mani" };
  const result = calculateAll([{ lineKey: "pedi", baseId: "one", addonIds: ["scrub"] }], [line([base("one", 35), base("two", 50, [])]), other], addons);
  assert.equal(result.firstUpsell, null);
});

test("every tier-config locator maps to the real-menu fixture", () => {
  const locators = TIER_CONFIG.flatMap((entry) => [entry.foundation, ...entry.included]);
  const services = locators.map((locator, index) => ({ id: `service-${index}`, name: locator.name, categoryKey: locator.categoryKey, groupName: locator.groupName, price: 10, regular: 10, member: 10, durationMinutes: 10 }));
  const resolved = resolveTierConfig(services);
  assert.equal(resolved.unmatched.length, 0);
  assert.equal(resolved.lines[0]?.foundations.length, 4);
});