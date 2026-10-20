import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ConfigService} from "../../../config/config.service";


@Injectable({
  providedIn: 'root'
})
export class ImportCaseService {

  constructor(
    private http:HttpClient,
    private configService: ConfigService
  ) {}

  uploadFile(file, apiImportParameter: string): Observable<any> {

    let params = new HttpParams()
      .set('type', apiImportParameter)

    const formData = new FormData();

    formData.append("file", file, file.name);

    return this.http.post(this.configService.getApiUrl('ravenImportApiUrl'), formData, { params:params })
  }

  importResource(fhirResource): Observable<any> {
    return this.http.post(this.configService.getApiUrl('ravenFhirServer'), fhirResource)
  }
}
