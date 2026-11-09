/** Named behaviours of the mock API. Selected with `?scenario=<name>` in the URL. */
export const MOCK_SCENARIOS = [
  'accepted',
  'requires-consent',
  'rejected:insufficient-funds',
  'rejected:market-closed',
  'rejected:invalid-price',
  'rejected:position-exceeded',
  'server-error',
  'network-error',
  'slow',
  'empty',
] as const;

export type MockScenario = (typeof MOCK_SCENARIOS)[number];

export const DEFAULT_SCENARIO: MockScenario = 'accepted';

/** Unknown or missing names fall back to the default, so a typo never breaks the app. */
export function parseScenario(raw: string | null | undefined): MockScenario {
  return (MOCK_SCENARIOS as readonly string[]).includes(raw ?? '') ? (raw as MockScenario) : DEFAULT_SCENARIO;
}
