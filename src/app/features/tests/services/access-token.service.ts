import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable, Subject, tap} from "rxjs";
import {map} from "rxjs/operators";
import {ConfigService} from "../../../config/config.service";

@Injectable({
  providedIn: 'root'
})
export class AccessTokenService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService) { }

  private accessToken = new Subject<string>();
  accessToken$ = this.accessToken.asObservable();

  setAccessTokenValue(value: string | null){
    this.accessToken.next(value)
  }


  getAccessToken(): Observable<string> {
    const config = this.configService.config();
    const searchEdrsCredentials = config?.workflowSimulator?.searchEdrsOAuthCredentials;

    if (!searchEdrsCredentials) {
      console.error('Search EDRS OAuth credentials not configured');
      return;
    }

    // Default to JSON if not specified
    const contentType = searchEdrsCredentials.contentType || 'application/json';
    const headers = new HttpHeaders({ 'Content-Type': contentType });

    let body: any;

    if (contentType === 'application/x-www-form-urlencoded') {
      // Build URL-encoded form data
      const params = new URLSearchParams();
      params.set('client_id', searchEdrsCredentials.clientId);
      params.set('client_secret', searchEdrsCredentials.clientSecret);
      params.set('grant_type', searchEdrsCredentials.grantType);
      if (searchEdrsCredentials.audience) {
        params.set('audience', searchEdrsCredentials.audience);
      }
      body = params.toString();
    } else {
      // Build JSON body
      body = {
        client_id: searchEdrsCredentials.clientId,
        client_secret: searchEdrsCredentials.clientSecret,
        grant_type: searchEdrsCredentials.grantType,
      };
      if (searchEdrsCredentials.audience) {
        body.audience = searchEdrsCredentials.audience;
      }
    }

    return this.http.post(searchEdrsCredentials.accessTokenUrl, body, { headers })
      .pipe(
        map(response => response?.['access_token']),
        tap(value => this.accessToken.next(value)),
    )
  }
}
