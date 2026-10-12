import {Component, computed, DestroyRef, Inject, ChangeDetectionStrategy, inject, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ModuleHeaderConfig} from "../../../../providers/module-header-config";
import {FhirValidatorResultsExportService} from "../../../../service/fhir-validator-results-export.service";
import {MatCardModule} from "@angular/material/card";
import {FhirValidatorComponent} from "../fhir-validator/fhir-validator.component";
import {ValidatorInput} from "../../models/validator-input-format";
import {ValidatorLoadingMessageComponent} from "../validator-loading-message/validator-loading-message.component";
import {FhirValidatorReadinessService} from "../../services/fhir-validator-readiness.service";
import {SharedHttpErrorService} from "../../../../service/shared-http-error.service";

@Component({
    selector: 'app-fhir-validator',
    templateUrl: './fhir-validator-wrapper.component.html',
    styleUrls: ['./fhir-validator-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatCardModule,
    FhirValidatorComponent,
    ValidatorLoadingMessageComponent
  ]
})
export class FhirValidatorWrapperComponent implements OnInit {

  isDataLoading = signal<boolean>(true);
  private readonly sharedHttpErrorService = inject(SharedHttpErrorService);
  readonly showLoadingMessage = computed(() =>
    this.isDataLoading() && !this.sharedHttpErrorService.errorDetected()
  );

  constructor(
    @Inject('fhirValidatorConfig') public config: ModuleHeaderConfig,
    private fhirValidatorResultsExportService: FhirValidatorResultsExportService,
    private fhirValidatorReadinessService: FhirValidatorReadinessService,
    private destroyRef: DestroyRef) {
  }

  validationTextFormat: ValidatorInput = {format: 'xml and json', accepts: 'text/*,.xml,.json'};

  ngOnInit(): void {
    this.fhirValidatorReadinessService.getValidatorLoaded()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          if (response.status === 'ready') {
            this.isDataLoading.set(false);
          }
          else {
            this.sharedHttpErrorService.setErrorMessage(
              `FHIR Validator returned unknown status of ${response.status}`
            );
          }
        },
        error: error => {
          this.sharedHttpErrorService.setErrorMessage(
            'FHIR validator encountered error while loading data.'
          );
          console.error('FHIR validator encountered error while loading data.', error);
        }
      });
  }

  onExportValidationResults(event: any){
    this.fhirValidatorResultsExportService.exportToPdf(event.jsonResource, event.resultsData);
  }

}
