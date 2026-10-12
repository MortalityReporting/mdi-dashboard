import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { ConfigService } from '../config/config.service';

/**
 * Guard to protect routes that require Search EDRS OAuth credentials.
 * Returns true only if the credentials are properly configured in the config.
 */
export const bluejayCredentialsGuard: CanActivateFn = () => {
  const configService = inject(ConfigService);
  const config = configService.config();

  // Check if searchEdrsOAuthCredentials exists and has required properties
  const searchEdrsCredentials = config?.workflowSimulator?.searchEdrsOAuthCredentials;

  // Verify that credentials exist and have the essential properties
  // Note: audience is optional as some OAuth servers don't require it
  return !!(
    searchEdrsCredentials &&
    searchEdrsCredentials.clientId &&
    searchEdrsCredentials.clientSecret &&
    searchEdrsCredentials.accessTokenUrl &&
    searchEdrsCredentials.grantType
  );
};
