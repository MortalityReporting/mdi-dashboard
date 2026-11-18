import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
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

  uploadFile(file): Observable<any> {
    const formData = new FormData();

    formData.append("file", file, file.name);
    return this.http.post(this.configService.getApiUrl('ravenImportApiUrl'), formData)
  }

  importResource(fhirResource): Observable<any> {
    return this.http.post(this.configService.getApiUrl('ravenFhirServer'), fhirResource)
  }
}
