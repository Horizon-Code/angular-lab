import { bootstrapApplication } from '@angular/platform-browser';
import type { NativeFederationResult } from '@angular-architects/native-federation';
import { FEDERATION } from '@lab/shared-ui';
import { appConfig } from './app/app.config';
import { App } from './app/app';

export function bootstrap(federation: NativeFederationResult) {
  return bootstrapApplication(App, {
    ...appConfig,
    providers: [...appConfig.providers, { provide: FEDERATION, useValue: federation }],
  });
}
