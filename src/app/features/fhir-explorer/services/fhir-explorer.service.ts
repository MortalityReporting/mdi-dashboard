import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {BehaviorSubject, Observable} from 'rxjs';
import {FhirResource} from "../../fhir-util";
import {ConfigService} from "../../../config/config.service";

@Injectable({
  providedIn: 'root'
})
export class FhirExplorerService {

  private fhirResource = new BehaviorSubject<FhirResource>(undefined);
  fhirResource$ = this.fhirResource.asObservable();

  apiUrl: string;

  constructor(private configService: ConfigService, private http:HttpClient) {
    this.apiUrl =`${this.configService.getApiUrl('fhirValidatorUrl')}$convert`
  }

  setSelectedFhirResource(fhirResource: any) {
    this.fhirResource.next(fhirResource);
  }

  translateToXml( resource: any ): Observable<any> {
    const body = {"resourceType": "Parameters", "parameter": [
      {
        "name": "resource",
        "resource": resource
      }
    ]};

    const options  = {
      responseType: 'text' as 'text',
      headers: new HttpHeaders({
        'Accept': 'application/xml'
      })
    };

    return this.http.post(this.apiUrl, body, options );
  }

}
