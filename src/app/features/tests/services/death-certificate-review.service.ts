import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ConfigService} from "../../../config/config.service";
import {Observable, tap} from "rxjs";
import {ExternalApiSubmissionService} from "./external-api-submission.service";

@Injectable({
  providedIn: 'root'
})
export class DeathCertificateReviewService {

  externalApiSubmissionService = inject(ExternalApiSubmissionService);

  private _fhirBundle = signal<any>(null);
  public readonly fhirBundle = this._fhirBundle.asReadonly();
  public setFhirBundle(bundle: any) {
    this._fhirBundle.set(bundle); this.externalApiSubmissionService.setJsonRecord(bundle);
  }

  dcrFhirBundleUrl = '';

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.dcrFhirBundleUrl = `${this.configService.getApiUrl('ravenFhirServer')}$ccr-funeralhome`;
  }

  generateDcrFhirBundle(data): Observable<any> {
    let httpHeaders = new HttpHeaders().set('Content-Type', 'application/fhir+json');
    let authStringSplit = this.configService.config()?.ravenFhirServer?.basicAuth?.split(":");
    const basicAuthString = 'Basic ' + btoa(`${authStringSplit[0]}:${authStringSplit[1]}`);
    httpHeaders = httpHeaders.set('Authorization', basicAuthString);

    const  httpOptions = {headers: httpHeaders}
    const resource =  { resourceType: "Parameters", parameter: data };

    const headerObject: Record<string, string> = {};
    httpHeaders.keys().forEach(key => {
      headerObject[key] = httpHeaders.get(key) || '';
    });
    this.externalApiSubmissionService.setRequestHeader(headerObject);

    return this.http.post(`${this.dcrFhirBundleUrl}`, resource, httpOptions).pipe(
      tap((res: any) => {
        this.setFhirBundle(res);
      })
    );
  }
}
