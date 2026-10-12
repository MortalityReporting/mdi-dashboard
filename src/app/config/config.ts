export interface FhirServerConfig {
  baseUrl: string;
  basicAuth: string;
}

export interface Auth0Config {
  audience: string;
}

export interface AuthConfig {
  redirectUrl: string;
  logoutUrl: string;
  clientId: string;
  domain: string;
  auth0: Auth0Config;
}

export interface SearchEdrsOAuthCredentials {
  grantType: string;
  accessTokenUrl: string;
  clientId: string;
  clientSecret: string;
  audience?: string;
  contentType?: 'application/json' | 'application/x-www-form-urlencoded';
}

export interface WorkflowSimulatorConfig {
  searchEdrsOAuthCredentials: SearchEdrsOAuthCredentials;
}

export class Config {
  constructor() {}

  version?: string;
  dashboardApiUrl: string = "";
  ravenImportApiUrl: string = "";
  fhirValidatorUrl: string = "";
  enableDashboardApiServices: boolean = false; //false by default
  ravenFhirServer: FhirServerConfig = {
    baseUrl: "",
    basicAuth: ""
  };
  blueJayServer: FhirServerConfig = {
    baseUrl: "",
    basicAuth: ""
  };
  auth?: AuthConfig;
  workflowSimulator?: WorkflowSimulatorConfig;
}
