import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { defer, last, Observable, repeat, shareReplay, takeWhile, timer } from 'rxjs';

import { ValidatorLoadedResponse } from '../models/validator-loaded-response';

const VALIDATOR_POLL_INTERVAL_MS = 3000;

@Injectable({ providedIn: 'root' })
export class FhirValidatorReadinessService {
  private readonly validatorLoaded$: Observable<ValidatorLoadedResponse>;

  constructor(
    private http: HttpClient,
    @Inject('serverBaseUrl') private readonly serverBaseUrl: string
  ) {
    const url = this.serverBaseUrl + 'health';

    this.validatorLoaded$ = defer(() => this.fetchValidatorStatus(url)).pipe(
      repeat({ delay: () => timer(VALIDATOR_POLL_INTERVAL_MS) }),
      takeWhile(response => response.status !== 'ready', true),
      last(),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private fetchValidatorStatus(url: string): Observable<ValidatorLoadedResponse> {
    return this.http.get<ValidatorLoadedResponse>(url);
  }

  getValidatorLoaded(): Observable<ValidatorLoadedResponse> {
    return this.validatorLoaded$;
  }
}
