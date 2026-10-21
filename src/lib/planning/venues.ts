/**
 * Venue-title rules: every catalog row must name a specific place.
 * Reject bare meal words and district-only labels without a venue name.
 */
const BARE_MEAL = /^(lunch|dinner|brunch)$/i;
const DISTRICT_MEAL =
  /^(marina|ruwi|opera district|qurum(?:\s+park)?|souk(?:\s+terrace)?|courtyard|wadi hub|pool cafe|beachside(?:\s+seafood)?|street-food|harbour|old\s+souk)\b.*\b(lunch|dinner|brunch)\b/i;
const GENERIC_PHRASE =
  /\b(contemporary dinner|seafood at qurum|cafe lunch|harbour lunch|street-food lunch|pool cafe lunch|courtyard lunch|souk terrace dinner|marina cafe lunch)\b/i;

export function isGenericVenueTitle(title: string): boolean {
  const t = title.trim();
  if (!t) return true;
  if (BARE_MEAL.test(t)) return true;
  if (DISTRICT_MEAL.test(t)) return true;
  if (GENERIC_PHRASE.test(t)) return true;
  return false;
}

export function assertSpecificVenueTitle(title: string, catalogId: string): void {
  if (isGenericVenueTitle(title)) {
    throw new Error(`Generic venue title for ${catalogId}: "${title}"`);
  }
}
