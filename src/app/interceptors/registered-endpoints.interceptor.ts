import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {ConfigService} from "../config/config.service";

@Injectable()
export class RegisteredEndpointsInterceptor implements HttpInterceptor {
  private registeredEndpoints: any[] | null = null;
  ignoreList = ["assets/", "../assets/", "../../assets/"];
  skipInterceptor = false;

  constructor(private configService: ConfigService) {}

  /**
   * Lazy-initialize registered endpoints from config.
   * This avoids circular dependency issues during app initialization.
   */
  private getRegisteredEndpoints(): any[] {
    if (this.registeredEndpoints === null) {
      const config = this.configService.config();
      if (!config) {
        // Config not loaded yet, return empty array
        return [];
      }

      // Normalize URLs to ensure they end with /
      this.registeredEndpoints = [
        {
          "baseUrl": this.normalizeUrl(config?.dashboardApiUrl),
          "allowedEndpoints": [
            "*"
          ]
        },
        {
          "baseUrl": this.normalizeUrl(config?.fhirValidatorUrl),
          "allowedEndpoints": [
            "$validate",
            "$convert",
            "$packages",
            "health"
          ]
        },
        {
          "baseUrl": this.normalizeUrl(config?.ravenFhirServer?.baseUrl),
          "allowedEndpoints": [
            "*"
          ]
        },
        {
          "baseUrl": this.normalizeUrl(config?.ravenImportApiUrl),
          "allowedEndpoints": [
            "*"
          ]
        }
      ];
    }
    return this.registeredEndpoints;
  }

  /**
   * Normalize URL to ensure it ends with /
   * This matches the behavior of EnvironmentHandler.getApiUrl()
   */
  private normalizeUrl(url: string): string {
    if (!url.endsWith("/")) {
      return url.concat("/");
    }
    return url;
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.skipInterceptor) {
      return next.handle(request);
    }

    // Check if URL is in ignore list FIRST (before trying to load config)
    if (this.ignoreList.some(item => request.url.startsWith(item))) {
      return next.handle(request);
    }

    // Get registered endpoints (lazy-loaded)
    const endpoints = this.getRegisteredEndpoints();

    // If config not loaded yet, allow all requests
    if (endpoints.length === 0) {
      return next.handle(request);
    }

    // Find matching service
    let service = endpoints.find(service => request.url.startsWith(service.baseUrl));

    if (!service) {
      console.info(`${request.url} is not registered with the application (nor on the ignore list).`)
      return next.handle(request);
    }
    else {
      // baseUrl already ends with / from normalizeUrl()
      if (service?.allowedEndpoints?.some(endpoint =>
        endpoint === "*" || request.url === service.baseUrl + endpoint
      )) {
        return next.handle(request);
      }
      else {
        return throwError(() => new Error(`${request.url} does not match a registered URL.`));
      }
    }
  }

}
