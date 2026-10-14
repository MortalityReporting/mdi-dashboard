import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpEventType, HttpParams, HttpParamsOptions, HttpRequest} from "@angular/common/http";
import {EMPTY, expand, map, mergeMap, Observable, of, reduce, takeWhile, tap} from "rxjs";
import {FhirResource} from "../models/fhir/r4/base/fhir.resource";
import {Bundle, BundleEntryComponent, BundleType} from "../models/fhir/r4/resources/bundle";
import {ConfigService} from "../../../config/config.service";
import {BundleHelperService} from "./bundle-helper.service";

@Injectable({
  providedIn: 'root'
})
export class FhirClientService {

  private readonly logFhirRequests: boolean;

  constructor(private http: HttpClient,
              private configService: ConfigService,
              private bundleHelperService: BundleHelperService) {
  }

  create(resourceType: string, resource: any): Observable<FhirResource> {
    return this.http.post<FhirResource>(`${this.configService.getApiUrl('ravenFhirServer')}/${resourceType}`, resource);
  }

  update(resourceType: string, resource: FhirResource): Observable<FhirResource> {
    const id = resource["id"];
    let requestString = `${this.configService.getApiUrl('ravenFhirServer')}${resourceType}/${id}`;
    return this.http.put<FhirResource>(requestString, resource);
  }

  read(resourceType: string, id: string, parameters?: string): Observable<FhirResource> {
    // TODO: Add parameter parsing. For now, parameters required in complete http string form.
    let requestString = `${this.configService.getApiUrl('ravenFhirServer')}${resourceType}/${id}`;
    if (parameters) requestString += parameters;
    return this.http.get<FhirResource>(requestString);
  }

  search(resourceType: string = "", parameters: string | FhirResource = "",
         flat: boolean = false, baseUrl: boolean = true,
         fullUrl?: string,
         httpParams: HttpParams = new HttpParams()
  ): Observable<Bundle | FhirResource[]> {

    let searchString: string = "";
    let pagination$: Observable<Bundle>;

    if (typeof parameters === 'string' || parameters instanceof String) {
      searchString = fullUrl ? fullUrl : this.createSearchRequestUrl(resourceType, parameters as string, baseUrl);
      pagination$ = this.http.get<Bundle>(searchString, {params: httpParams});
    }
    else {
      searchString = fullUrl ? fullUrl : this.createSearchRequestUrl(resourceType, "", baseUrl)
      pagination$ = this.http.post<Bundle>(searchString, parameters, {params: httpParams});
    }

    pagination$.pipe(
      // TODO: Is there a way to type the following operator projections?
      expand( (searchBundle: any, i) => {
          return searchBundle?.link?.find(link => link?.relation === "next") ?
            this.search(
              undefined, undefined,flat = false, false,
              searchBundle?.link?.find(link => link?.relation === "next")?.url
            ) : EMPTY;
        }
      ),
      takeWhile((searchBundle:any) => searchBundle?.link?.find(link => link?.relation === "next"), true),
      reduce((acc, current) => acc.concat(current), []),
    ).pipe(
      mergeMap((searchSetList: Bundle[]) => {
        let completeBundle: Bundle = {
          resourceType: "Bundle",
          type: BundleType.searchset,
          total: 0,
          entry: []
        };
        searchSetList.map((searchSetBundle: Bundle) => {
          searchSetBundle?.entry?.map(entry => completeBundle.entry.push(entry));
        });
        completeBundle.total = completeBundle.entry.length;
        return of(completeBundle)
      })
    );

    if (flat) {
      return pagination$.pipe(
        map((completeBundle: Bundle) => {
          const resourceList = this.bundleHelperService.flattenBundle(completeBundle)
          return resourceList;
        }))
    }
    else return pagination$;
  }

  // When baseUrl = true (default) prepend the URL. Otherwise, assume a full URL is passed and take it as is.
  private createSearchRequestUrl(resourceType: string, parameters: string, baseUrl: boolean = true): string {
    if (baseUrl) return `${this.configService.getApiUrl('ravenFhirServer')}${resourceType}${parameters}`;
    else return resourceType + parameters;
  }

}
