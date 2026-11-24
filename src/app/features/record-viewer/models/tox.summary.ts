import {Address} from "../../fhir-util";

/**
 * @field mdiCaseNumber - The MDI Tracking Number linked to an MDI-to-EDRS record.
 * @field certifier - The primary performer considered the certifying Toxicologist and the Tox Lab details.
 * @field performers - A full list of all performers included in the Diagnostic Report.
 */
export class ToxSummary {
  patientId: string;
  mdiCaseNumber: string;
  demographics: ToxDemographics;
  certifier?: CertifierAndOrganization;
  performers: Performer[];
  specimens: Specimen[];
  results: LabResult[];
  conclusion: string;
  diagnosticReportResource: string;
}

export class ToxDemographics {
  birthDate: string;
  gender: string;
  race: string;
  ethnicity: string;
  address: Address;
  patientResource: {};
}

export class CertifierAndOrganization {
  constructor(certifyingToxicologist: Performer,
    organizationName?: string, organizationAddress?: string, organizationResource?: any
  ) {
    this.certifyingToxicologist = certifyingToxicologist;
    if (organizationName) this.organizationName = organizationName;
    if (organizationAddress) this.organizationAddress = organizationAddress;
    if (organizationResource) this.organizationResource = organizationResource;
  }
  certifyingToxicologist: Performer;
  organizationName?: string;
  organizationAddress?: string;
  organizationResource?: string;
}

export class Performer {
  constructor(name: string, practitionerResource: any) {
    this.name = name;
    this.resource = practitionerResource;
  }
  name: string;
  resource: any;
}

export class Specimen {
  constructor(
    type: string, site: string, identifier: string, collected: string,
    received: string, condition: string, container: string, note: string,
    specimenResource: any
  ) {
    this.type = type;
    this.site = site;
    this.identifier = identifier;
    this.collected = collected;
    this.received = received;
    this.condition = condition;
    this.container = container;
    this.note = note;
    this.resource = specimenResource;
  }
  type: string;
  site: string;
  identifier: string;
  collected: string;
  received: string;
  condition: string;
  container: string;
  note: string;
  resource: any;
}

export class LabResult {
  constructor(test: string, value: string, date: string, specimen: string, observationResource: any) {
    this.test = test;
    this.value = value;
    this.date = date;
    this.specimen = specimen;
    this.resource = observationResource;
  }
  test: string;
  value: string; // TODO: Add additional value types.
  date: string;
  specimen: string;
  resource: any;
}
