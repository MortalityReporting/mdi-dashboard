import {Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";
import {DecedentSimpleInfo} from "../../../model/decedent-simple-info";
import {map} from "rxjs/operators";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {TestStatusCodes} from "../../testing-events";
import {AppConstants} from "../../../providers/app-constants";
import {ConfigService} from "../../../config/config.service";

@Injectable({
  providedIn: 'root'
})
export class SearchEdrsService {

  private documentBundle = new Subject<any>();
  documentBundle$ = this.documentBundle.asObservable();

  private testStatus = new Subject<any>();
  testStatus$ = this.testStatus.asObservable();

  private edrsHttpRequestInfo = new Subject<any>();
  edrsHttpRequestInfo$ = this.edrsHttpRequestInfo.asObservable();

  private decedentData = new Subject<DecedentSimpleInfo>();
  decedentData$ = this.decedentData.asObservable();

  private endpoint = new Subject<any>();
  endpoint$ = this.endpoint.asObservable();

  constructor(
    private http:HttpClient,
    private configService: ConfigService,
    private appConstants: AppConstants
  ) {}

  setDocumentBundle(data): void {
    this.documentBundle.next(data);
  }

  setEdrsHttpRequestInfo(data): void {
    this.edrsHttpRequestInfo.next(data);
  }

  setTestStatus(status): void {
    this.testStatus.next(status);
  }

  setEndpoint(endpoint: string, basic: {username: string, password: string}) {
    if (!endpoint) this.endpoint.next(undefined);
    else {
      this.endpoint.next({
        endpoint: endpoint,
        auth: basic
      }
      )
    }
  }

  setDecedentData(data: DecedentSimpleInfo): void {
    this.decedentData.next(data);
  }

  getOperationDefinitionList(): Observable<any> {
    return this.http.get(this.configService.getApiUrl('ravenFhirServer') + this.appConstants.COMPOSITION_IT_DOCUMENT_OPERATION_DEFINITION)
  }


  searchEdrs(uri, params, basicAuth: { username: string, password: string }, accessToken: string): Observable<any> {
    let httpHeaders = new HttpHeaders().set('Content-Type', 'application/fhir+json');
    if (basicAuth) {
      const basicAuthString = 'Basic ' + btoa(`${basicAuth.username}:${basicAuth.password}`);
      httpHeaders = httpHeaders.set('Authorization', basicAuthString);
    }
    else if(accessToken){
      httpHeaders = httpHeaders.set('Authorization', `Bearer ${accessToken}`);
    }
    let httpOptions = {headers: httpHeaders}
    const operationDefinitionLocation = uri + this.appConstants.COMPOSITION_$DOCUMENT; // TODO: Move to constants.

    this.setEdrsHttpRequestInfo({
      url: operationDefinitionLocation
    });

    return this.http.post(operationDefinitionLocation, params, httpOptions).pipe(
      map((result: any) => {
        if (result?.total > 0) {
          this.setTestStatus(TestStatusCodes.complete); // The compete status is set ONLY when at least one record is returned
        }
        return result;
      }
    ));
  }

}
