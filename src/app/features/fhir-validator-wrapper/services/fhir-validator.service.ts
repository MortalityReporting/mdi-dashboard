import {Inject, Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {map, Observable} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ImplementationGuide} from "../models/implementation-guide";

@Injectable({
  providedIn: 'root'
})
export class FhirValidatorService {
  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    @Inject('serverBaseUrl') private readonly serverBaseUrl: string
  ) {}

  showErrorMessage(messageStr: string = 'Server Error.'){
    this._snackBar.open(messageStr, 'x' ,{
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-color'],
      duration: 5000
    });
  }

  showSuccessMessage(messageStr: string){
    this._snackBar.open(messageStr, 'x' ,{
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['mat-toolbar', 'mat-primary'],
      duration: 3000
    });
  }

  closeNotification(){
    this._snackBar.dismiss();
  }

  getUiValidationMessages(fhirResource: any, resourceFormat: string, selectedIg: ImplementationGuide): string {

    if(!fhirResource || (!!fhirResource && Object.keys(fhirResource).length === 0)) {
      return "Please enter a FHIR resource for validation.";
    }
    else if(!selectedIg){
      return "Please select an Implementation Guide";
    }
    else if (resourceFormat === 'json'){
      if(!this.isJson(fhirResource)){
        // Could not parse the resource at all. It is not a valid JSON as far as the js parser is concerned.
        return "Invalid json format detected.";
      }
      else if(!JSON.parse(fhirResource).resourceType){
        return "Missing required resourceType property.";
      }
    }
    else if (resourceFormat === 'xml') {
      if(!this.isXmlString(fhirResource)){
        // Could not parse the resource at all. It is not a valid XML as far as the js parser is concerned.
        return "Invalid xml format detected.";
      }
      else {
        // TODO we may need to to some error handling here
        let fhirResourceXML: any = new DOMParser().parseFromString(fhirResource, 'text/xml');
        const resourceType = fhirResourceXML.childNodes[0].nodeName;
        const xmlnsAttribute = fhirResourceXML.querySelector(resourceType).getAttribute('xmlns');

        // all FHIR resources should have xmlns="http://hl7.org/fhir"
        if(!xmlnsAttribute || xmlnsAttribute != 'http://hl7.org/fhir'){
          return "Invalid or missing xmlns attribute.";
        }
      }
    }
    // did not find any obvious errors, so returning nothing
    return '';
  }

  isJson(str: any): boolean {
    if (typeof str != 'string')
      str = JSON.stringify(str);
    try {
      JSON.parse(str.trim());
    } catch (e) {
      return false;
    }
    return true;
  }

  isXmlString(str: string): boolean {
    try {
      const parser = new DOMParser();
      const theDom = parser.parseFromString(str?.trim(), 'application/xml');
      return !(theDom.getElementsByTagName('parsererror').length > 0);
    }
    catch (e) {
      return false;
    }
  }

  beautifyJSON(str: string): string{
    return JSON.stringify(JSON.parse(str), null, 2);
  }

  // I borrowed some regex code
  beautifyXML(str: string): string{
    let formatted = '', indent= '';
    const tab='  ';
    str.split(/>\s*</).forEach(function(node) {
      if (node.match( /^\/\w/ )) {
        indent = indent.substring(tab.length);
      }
      formatted += indent + '<' + node + '>\r\n';
      if (node.match( /^<?\w[^>]*[^\/]$/ )){
        indent += tab;
      }
    });
    return formatted.substring(1, formatted.length-3);
  }

  validateFhirResource(fhirResource: any, resourceFormat: string, ig: string):  Observable<any> {

    let headers: any| null= null;
    let requestData: any| null = null;

    // Requests are formed in order to be consumed by the API.
    // Note that requestData is nothing but a wrapper to the request and should never change.
    if (resourceFormat === 'json') {
      requestData = {
        "resourceType": "Parameters",
        "parameter": [
          {
            "name": "ig",
            "valueString": ig
          },
          {
            "name": "resource",
            "resource": fhirResource,
          },
          {
            "name": "includeFormattedResource",
            "valueBoolean": true
          },
          {
            "name": "format",
            "valueString": "application/fhir+json"
          }
        ]
      }

      headers = new HttpHeaders()
        .set('Content-Type', 'application/fhir+json');
    }
    else if (resourceFormat === 'xml') {

      requestData =
        `<Parameters xmlns="http://hl7.org/fhir">
          <parameter>
            <name value="ig"/>
            <valueString value="${ig}"/>
          </parameter>
          <parameter>
            <name value="format"/>
            <valueString value="application/fhir+xml"/>
          </parameter>
          <parameter>
            <name value="includeFormattedResource"/>
            <valueBoolean value="true"/>
          </parameter>
          <parameter>
            <name value="resource" />
            <resource>
              ${fhirResource}
            </resource>
          </parameter>
      </Parameters>`;
      headers = new HttpHeaders()
        .set('Content-Type', 'application/fhir+xml');
    }

    return this.http.post(this.serverBaseUrl + "$validate", requestData, {headers: headers}).pipe(
      map((result: any) => (
      result as Object
    )));
  }

  getIgList(){
    return this.http.get(this.serverBaseUrl + "$packages")
  }
}
