import { Injectable } from '@angular/core';
import {FhirResource} from "../models/fhir/r4/base/fhir.resource";
import {Bundle, BundleEntryComponent} from "../models/fhir/r4/resources/bundle";

@Injectable({
  providedIn: 'root'
})
export class BundleHelperService {

  constructor() { }

  // Passing a resource with a subject and a bundle, this will find that subject in the bundle.
  /**
   *
   * @param resource - Any FHIR Resource with a subject field.
   * @param bundle - The FHIR Bundle to locate the subject resource within.
   * @returns a FHIR Resource (typically a Patient) which is the subject referenced.
   *
   * @example
   * ```
   * resource = {
   *   "resourceType": "Observation",
   *   "subject": { "reference": "Patient/1234"}
   * }
   * bundle = {
   *   ... // abbreviated
   *   "entry": [{
   *     "resource": {"resourceType": "Patient", "id": "1234"}
   *   }]
   * }
   *
   *
   * ```
   *
   * TODO: Handle passing a resource without a subject or that uses patient/etc.
   **/
  findSubjectInBundle(resource: FhirResource, bundle: Bundle): FhirResource {
    const subjectId = resource?.['subject']?.reference?.split("/").pop();
    const subject = bundle.entry.find(bec => bec?.resource?.['id'] === subjectId).resource;
    return subject; // Return subject resource
  }

  // For singleton profiles, this function can be used to find the resource by the profile name. ID should be preferred whenever available.
  findResourceByProfileName(bundle: any, profileName: string): any {
    try {
      return bundle.entry.find((entry: any) => entry.resource.meta.profile.includes(profileName))?.resource || undefined;
    } catch(e) {
      return undefined;
    }
  }

  // For non-singleton profiles, this function can be used to return a list of those resources matching by profile name.
  findResourcesByProfileName(bundle: any, profileName: string): any[] {
    try {
      let items = [];
      bundle.entry.map( (entry: any) => {
        if (entry.resource.meta.profile.includes(profileName)) {
          items.push( entry.resource );
        }
      })
      return items;
    } catch(e) {
      return undefined;
    }
  }

  // This function should be used whenever possible to go off of absolute references to the full URL within the Document Bundle.
  // The input is the bundle to search and the expected form of the fullUrl, often "resource/id". E.g., "Patient/134-412-21".
  // TODO: Handle Reference objects in addition to the fullUrlReference string.
  findResourceByFullUrl(bundle: any, fullUrlReference: string): any {
    if(!bundle || !bundle.entry){
      return null;
    }
    return (bundle.entry.find((entry: any) => entry.fullUrl.endsWith(fullUrlReference)))?.resource || undefined;
  }

  public flattenBundle (completeBundle: Bundle) {
    if(!completeBundle || !completeBundle['entry']) return null;

    let resourceList: FhirResource[] = [];
    if (completeBundle['entry']) {
      completeBundle['entry'].map((bundleEntry: BundleEntryComponent) => {
        resourceList.push(bundleEntry.resource)
      });
    }
    return resourceList;
  }

}
