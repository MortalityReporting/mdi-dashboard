import {inject, Injectable} from '@angular/core';
import {OnboardingHttpRequest} from "../models/onboarding-http-request";
import {HttpClient, HttpContext, HttpRequest, HttpResponse} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {filter, map} from "rxjs/operators";
import {RequestType} from "../models/request-type";
import {BYPASS_INTERCEPTOR} from "../../../interceptors/http-error.interceptor";

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {

  private _httpReq$ = new BehaviorSubject<any>(null);
  httpReq$ = this._httpReq$.asObservable();

  private setHttpReq(httpReq: any){
    this._httpReq$.next(httpReq);
  }
  constructor(private http:HttpClient) { }


  // Example url for basic auth testing
  // https://raven.dev.heat.icl.gtri.org/mdi-fhir-server/fhir/Patient
  // https://bluejay.heat.icl.gtri.org/mdi-fhir-server/fhir/Patient
    onLogin(request: OnboardingHttpRequest): Observable<any> {

      // Create context with bypass flag to skip http-error.interceptor
      const context = new HttpContext().set(BYPASS_INTERCEPTOR, true);

      // Merge context with existing httpOptions
      const optionsWithContext = {
        ...request.httpOptions,
        context: context
      };

      let req: HttpRequest<any>;
      if (request.requestType == RequestType.GET) {
          req = new HttpRequest(RequestType.GET, request.url, optionsWithContext);
      }
      else if (request.requestType == RequestType.PUT) {
          req = new HttpRequest(RequestType.PUT, request.url, request.requestBody, optionsWithContext);
      }
      else if (request.requestType == RequestType.POST) {
          req = new HttpRequest(RequestType.POST, request.url, request.requestBody, optionsWithContext);
      }

      // Log to verify bypass is set (can be removed after testing)
      console.log('BYPASS_INTERCEPTOR set to:', req.context.get(BYPASS_INTERCEPTOR));

      // We cannot get the properties out of the request object unless we convert it to string and back to object
      // (in effect we are forcing an object copy)
      this.setHttpReq(JSON.parse(JSON.stringify(req)));

      return this.http.request(req).pipe(
        filter((event): event is HttpResponse<any> => event instanceof HttpResponse),
        map(response => response.body)
      );
    }
}
