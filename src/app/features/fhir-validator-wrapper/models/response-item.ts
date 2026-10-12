export interface FhirLocation {
  line: number;
  col: number;
}

export interface ResponseItem {
  severity: string;
  code: string;
  details: {
    text: string;
  };
  diagnostics?: string;
  expression: string[];
  extension?: any[];
  expanded: boolean;
  location?: FhirLocation;
  locationDisplay?: string;
}
