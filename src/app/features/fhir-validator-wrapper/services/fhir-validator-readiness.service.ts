import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {defer, delayWhen, filter, Observable, repeatWhen, shareReplay, take, timer} from 'rxjs';

import { ValidatorLoadedResponse } from '../models/validator-loaded-response';

const VALIDATOR_POLL_INTERVAL_MS = 1000;

@Injectable({ providedIn: 'root' })
export class FhirValidatorReadinessService {
  private readonly validatorLoaded$: Observable<ValidatorLoadedResponse>;

  constructor(
    private http: HttpClient,
    @Inject('serverBaseUrl') private readonly serverBaseUrl: string
  ) {
    const url = this.serverBaseUrl + 'health';

    this.validatorLoaded$ = defer(() => this.fetchValidatorStatus(url)).pipe(
      repeatWhen(completions =>
        completions.pipe(delayWhen(() => timer(VALIDATOR_POLL_INTERVAL_MS)))
      ),
      filter(response => response.status === 'ready'),
      take(1),
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
