/** Nail Solution Plus online scheduler (store-specific booking). */
export const EXTERNAL_BOOKING_URL =
  "https://nailsolutionplus.firebaseapp.com/?storeKey=-OiuBNzy2Knxtk0uDGmn";

export function openExternalBookingInNewTab(): void {
  window.open(EXTERNAL_BOOKING_URL, "_blank", "noopener,noreferrer");
}
