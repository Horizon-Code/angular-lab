import { SheriffConfig } from '@softarc/sheriff-core';

/**
 * Architecture as an executable contract (Angular Architects' Sheriff).
 *
 * Federated apps never import each other statically: they meet at runtime
 * through Native Federation. Sheriff enforces the static side of that rule.
 *
 * Tags:
 *  - level:1 | level:2 | level:3 — position in the micro-frontend hierarchy
 *  - industry:<name>              — which industry an app or library belongs to
 *  - type:domain | type:data-access | type:mock-api | type:shared-ui — libraries
 */
export const config: SheriffConfig = {
  enableBarrelLess: true,
  entryPoints: {
    shell: 'projects/shell/src/main.ts',
    'finance-shell': 'projects/finance-shell/src/main.ts',
    'finance-shell-remote': 'projects/finance-shell/src/app/remote.routes.ts',
    'finance-banking': 'projects/finance-banking/src/main.ts',
    'finance-banking-remote': 'projects/finance-banking/src/app/remote.routes.ts',
  },
  modules: {
    'projects/shell': ['level:1'],
    'projects/<industry>-shell': ['level:2', 'industry:<industry>'],
    'projects/<industry>-<product>': ['level:3', 'industry:<industry>'],
    'libs/shared/ui/src': ['type:shared-ui'],
    'libs/<industry>/domain/src': ['type:domain', 'industry:<industry>'],
    'libs/<industry>/data-access/src': ['type:data-access', 'industry:<industry>'],
    'libs/<industry>/mock-api/src': ['type:mock-api', 'industry:<industry>'],
  },
  depRules: {
    // The root shell is industry-agnostic: shared UI only.
    'level:1': ['type:shared-ui'],
    // Industry shells and products may use shared UI and the domain of their own industry — never another app.
    'level:2': ['type:shared-ui', 'type:domain'],
    // Products also own their API client and their mock API.
    'level:3': ['type:shared-ui', 'type:domain', 'type:data-access', 'type:mock-api'],
    // Industry isolation: finance code only sees finance (or untagged shared) code.
    'industry:*': ({ from, to }) => to === from || to === 'type:shared-ui',
    // Domain rules are pure: no UI, no apps.
    'type:domain': [],
    'type:shared-ui': [],
    // The API client speaks the domain's language; the mock implements the client's contract.
    'type:data-access': ['type:domain'],
    'type:mock-api': ['type:data-access', 'type:domain'],
    root: ['type:shared-ui', 'type:domain', 'level:*'],
    noTag: [],
  },
};
