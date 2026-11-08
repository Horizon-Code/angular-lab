import { inject, InjectionToken } from '@angular/core';
import { Routes } from '@angular/router';
import type { NativeFederationResult } from '@angular-architects/native-federation';
import { RemoteError } from './remote-error';

/**
 * The federation instance created by `initFederation()` in the app that was
 * bootstrapped. Only that app initialises federation; nested hosts (level 2)
 * receive it through DI from the root shell, so there is exactly one runtime.
 */
export const FEDERATION = new InjectionToken<NativeFederationResult>('FEDERATION');

export interface RemoteRoutesOptions {
  readonly remoteName: string;
  readonly area: string;
  /**
   * Resolves the remote's remoteEntry URL when the remote is not in the
   * bootstrapped app's manifest (e.g. a product loaded by an industry shell).
   */
  readonly remoteEntry?: () => Promise<string | undefined>;
}

/**
 * Lazy-loads the `./routes` exposed by a remote. Must be called from a route's
 * `loadChildren` (an injection context). If the remote is down, returns a
 * route that renders an error card instead of breaking the host.
 */
export async function loadRemoteRoutes(options: RemoteRoutesOptions): Promise<Routes> {
  const federation = inject(FEDERATION);
  try {
    const entry = options.remoteEntry ? await options.remoteEntry() : undefined;
    const runtime = entry ? await federation.initRemoteEntry(entry, options.remoteName) : federation;
    const module = await runtime.loadRemoteModule<{ routes: Routes }>(options.remoteName, './routes');
    return module.routes;
  } catch (error) {
    console.error(`Remote "${options.remoteName}" failed to load`, error);
    return [{ path: '**', component: RemoteError, data: { area: options.area } }];
  }
}
