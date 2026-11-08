import { initFederation } from '@angular-architects/native-federation';

// Runs only in standalone mode. Inside the tree, the root shell owns federation.
initFederation({}, { hostRemoteEntry: { url: './remoteEntry.json' } })
  .then((federation) => import('./bootstrap').then((m) => m.bootstrap(federation)))
  .catch((err) => console.error(err));
