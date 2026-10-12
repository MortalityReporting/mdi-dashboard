import {Inject, Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {Address, BundleHelperService, FhirClientService, FhirHelperService,} from "../../fhir-util";
import {map} from "rxjs/operators";
import {FHIRProfileConstants} from "../../../providers/fhir-profile-constants";
import {TrackingNumberType} from "../../fhir-mdi-library";
import {
  CaseAdminInfo,
  CremationClearanceInfo,
  DcrGridDTO,
  DcrHeader, DcrSummary,
  DeathInvestigation,
  FuneralHome,
  PlaceOfDeath, SignatureBlock, SignedBy
} from "../models/dcr-record";
import {MdiToEdrsDocumentHandlerService} from "./mdi-to-edrs-document-handler.service";
import {PatientNameReturn} from "../../fhir-util/services/fhir-helper.service";
import {AppConstants} from "../../../providers/app-constants";

export interface Parameters{
  name: string;
  valueString?: string;
  valueDateTime?: string;
  valueCode?: string;
}


@Injectable({
  providedIn: 'root'
})
export class DcrDocumentHandlerService {

  public defaultString: string = this.appConstants.VALUE_NOT_FOUND;

  constructor(
    private fhirClient: FhirClientService,
    private fhirHelper: FhirHelperService,
    private bundleHelper: BundleHelperService,
    private mdiToEdrsDocumentHandlerService: MdiToEdrsDocumentHandlerService,
    private appConstants: AppConstants,
    @Inject('fhirProfiles') public fhirProfiles: FHIRProfileConstants
  ) { }


  getRecords(): Observable<DcrGridDTO[]> {
    return this.fhirClient.read('Composition', '$dcr-message').pipe(
      map((record: any) => {
        if(!record.entry){
          return [];
        }
        const result = record.entry.map(documentBundle => {
          const documentBundleList = documentBundle.resource.entry?.[1]?.resource;
          const dcrGridDTO: DcrGridDTO = this.constructDcrGridDto(documentBundleList);
          return dcrGridDTO;
        });
        return result;
      })
    )
  }

  getById(id: string): Observable<any> {
    return this.fhirClient.read(`Composition/${id}`, '$dcr-message').pipe(
      map((record: any) => {
        const documentBundleList = record.entry[1].resource;
        const dcrHeader = this.constructHeader(documentBundleList);

        const patientResource = this.bundleHelper.findResourceByProfileName(documentBundleList, this.fhirProfiles.USCore.USCorePatient);
        const demographics = this.mdiToEdrsDocumentHandlerService.generateDemographics(patientResource);
        const deathInvestigation = this.generateDeathInvestigation(documentBundleList);
        const placeOfDeath = this.generatePlaceOfDeath(documentBundleList);
        const cremationClearanceInfo = this.generateCremationClearanceInfo(documentBundleList);
        const caseAdminInfo = this.generateCaseAdminInfo(documentBundleList);
        const signatureBlock = this.generateSignatureBlock(documentBundleList);

        const dcrSummary: DcrSummary = {
          caseAdminInfo: caseAdminInfo,
          dcrHeader: dcrHeader,
          demographics: demographics,
          deathInvestigation: deathInvestigation,
          cremationClearanceInfo: cremationClearanceInfo,
          placeOfDeath: placeOfDeath,
          signatureBlock: signatureBlock,
        };
        const dcrGridDTO: DcrGridDTO = this.constructDcrGridDto(documentBundleList);
        const result = {resource: record, dcrSummary: dcrSummary, dcrGridDTO: dcrGridDTO};
        return result;
      })
    )
  }

  private constructHeader(documentBundleList: any): DcrHeader {
    const patientResource = this.bundleHelper.findResourceByProfileName(documentBundleList, this.fhirProfiles.USCore.USCorePatient);

    const fullName: string = this.fhirHelper.getOfficialName(patientResource);

    const composition = this.bundleHelper.findResourceByProfileName(documentBundleList, this.fhirProfiles.DCR.Dcr_composition);
    const dcrCaseNumber = this.fhirHelper.getTrackingNumber(composition,  TrackingNumberType.Dcr);

    const deathDateResource = this.bundleHelper.findResourceByProfileName(documentBundleList, this.fhirProfiles.VRDR.Obs_DeathDate);
    const deathDate = deathDateResource?.valueDateTime || this.defaultString;

    const header: DcrHeader = {
      fullName: fullName,
      reportDate: deathDate,
      dcrCaseNumber: dcrCaseNumber,
    }
    return header;
  }

  private generateDeathInvestigation(documentBundleList: any) : DeathInvestigation{
    const deathDateResource = this.bundleHelper.findResourceByProfileName(documentBundleList, this.fhirProfiles.VRDR.Obs_DeathDate);
    if(!deathDateResource){
      return null;
    }
    const component = deathDateResource.component.find(component => component.code.coding.find(coding => coding.code === "58332-8"));
    const type =  component.valueCodeableConcept.text || component?.valueCodeableConcept?.coding?.[0]?.display;
    const placeOfDeath = this.generatePlaceOfDeath(documentBundleList);
    const result = {
      dateTimeOfDeath: deathDateResource?.valueDateTime || this.defaultString,
      resource: deathDateResource ,
      placeOfDeath:placeOfDeath,
      type: type || this.defaultString };
    return result;
  }

  private generatePlaceOfDeath(documentBundleList: any): PlaceOfDeath{
    const deathLocationResource = this.bundleHelper.findResourceByProfileName(documentBundleList, this.fhirProfiles.VRDR.Loc_DeathLocation);

    const type = this.defaultString;
    const address: Address = new Address(deathLocationResource);
    const addressText = deathLocationResource?.['address']?.text;
    const facility = this.defaultString;
    const facilityName = deathLocationResource?.name || this.defaultString;
    return {type: type, address: address, addressText: addressText, facility: facility, facilityName: facilityName, resource: deathLocationResource};
  }

  private generateCremationClearanceInfo(documentBundleList: any): CremationClearanceInfo {
    let organizationResource = this.bundleHelper.findResourceByProfileName(documentBundleList, this.fhirProfiles.VRDR.Org_Funeral_Home);
    if(!organizationResource) {
      return null;
    }
    const address = new Address(organizationResource);
    const addressText = organizationResource?.['address']?.text;
    const funeralHome: FuneralHome = {address: address, name: organizationResource.name, addressText: addressText};
    return {resource: organizationResource, funeralHome: funeralHome};
  }

  private generateCaseAdminInfo(documentBundleList: any): CaseAdminInfo | null{
    let practitionerResource = this.bundleHelper.findResourceByProfileName(documentBundleList, this.fhirProfiles.DCR.Dcr_core_practitioner)
      || this.bundleHelper.findResourceByProfileName(documentBundleList, this.fhirProfiles.USCore.USCorePractitioner);

    if(!practitionerResource){
      return null;
    }
    const name  = this.fhirHelper.getOfficialName(practitionerResource) || this.defaultString;
    const email = practitionerResource.telecom.find(el=> el.system == 'email').value || this.defaultString;
    return {name: name, resource: practitionerResource, email: email};
  }

  private constructDcrGridDto(documentBundleList: any): DcrGridDTO  {

    const patientResource = this.bundleHelper.findResourceByProfileName(documentBundleList, this.fhirProfiles.USCore.USCorePatient);
    const firstName = this.fhirHelper.getOfficialName(patientResource, PatientNameReturn.firstonly) || this.defaultString;
    const lastName = this.fhirHelper.getOfficialName(patientResource, PatientNameReturn.lastonly) || this.defaultString;

    //const gender = patientResource.gender;

    const deathDateObsResource = this.bundleHelper.findResourceByProfileName(documentBundleList, this.fhirProfiles.VRDR.Obs_DeathDate);
    const deathDate = deathDateObsResource?.valueDateTime || this.defaultString;
    const compositionResource = this.bundleHelper.findResourceByProfileName(documentBundleList, this.fhirProfiles.DCR.Dcr_composition);
    const recordId = compositionResource.id || this.defaultString;

    let organizationResource = this.bundleHelper.findResourceByProfileName(documentBundleList, this.fhirProfiles.VRDR.Org_Funeral_Home);
    const funeralHomeName = organizationResource?.name || this.defaultString;

      // TODO uncomment when we know how to use gender/sex fields per the CDC guidelines. Note that gender should come from Sex at Death
    //return {firstName: firstName, lastName: lastName, deathDate: deathDate, gender: gender, recordId: recordId, funeralHomeName: funeralHomeName};

    return {firstName: firstName, lastName: lastName, deathDate: deathDate, recordId: recordId, funeralHomeName: funeralHomeName};
  }

  private generateSignatureBlock(documentBundleList: any): SignatureBlock | null {
    if (!documentBundleList?.signature) {
      return null;
    }
    const signatureData = documentBundleList.signature
    const fileFormat = signatureData.targetFormat;
    const dateTime = signatureData.when || this.defaultString;
    const signatureStr = signatureData.data;
    const signedByPractitionerResource = this.bundleHelper.findResourceByFullUrl(documentBundleList, signatureData?.who?.reference);
    const signedByName = this.fhirHelper.getOfficialName(signedByPractitionerResource, PatientNameReturn.fullname) || this.defaultString;
    const signedBy: SignedBy = {resource: signedByPractitionerResource, name: signedByName};
    return {resource: documentBundleList, signatureStr: signatureStr, dateTime: dateTime, fileFormat: fileFormat, signedBy: signedBy};
  }

  submitForm(data: Parameters[]):Observable<any> {
    const parametersResource = { resourceType: "Parameters", parameter: data };
    return this.fhirClient.create('Parameters' , parametersResource);
  }
}
