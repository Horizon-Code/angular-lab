import { initFederation } from '@angular-architects/native-federation';

// Level 1 is the only app that initialises federation when the tree runs together.
initFederation('federation.manifest.json', { hostRemoteEntry: { url: './remoteEntry.json' } })
  .then((federation) => import('./bootstrap').then((m) => m.bootstrap(federation)))
  .catch((err) => console.error(err));
