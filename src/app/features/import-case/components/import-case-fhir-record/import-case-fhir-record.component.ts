import {Component, computed, DestroyRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ImportCaseService} from "../../services/import-case.service";
import {UtilsService} from "../../../../service/utils.service";
import {MatDialog} from "@angular/material/dialog";
import {ModuleHeaderConfig} from "../../../../providers/module-header-config";
import {FhirValidatorResultsExportService} from "../../../../service/fhir-validator-results-export.service";
import {MatButtonModule} from "@angular/material/button";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatIconModule} from "@angular/material/icon";
import {FhirValidatorComponent} from "../../../fhir-validator-wrapper/components/fhir-validator/fhir-validator.component";
import {ImplementationGuide} from "../../../fhir-validator-wrapper/models/implementation-guide";
import {ValidationResults} from "../../../fhir-validator-wrapper/models/validation-results";
import {openConfirmationDialog} from "../../../../components/widgets/confirmation-dialog/conformation-dialog.component";
import {FhirValidatorReadinessService} from "../../../fhir-validator-wrapper/services/fhir-validator-readiness.service";
import {ValidatorLoadingMessageComponent} from "../../../fhir-validator-wrapper/components/validator-loading-message/validator-loading-message.component";
import {SharedHttpErrorService} from "../../../../service/shared-http-error.service";


@Component({
    selector: 'app-import-case-fhir-record',
    templateUrl: './import-case-fhir-record.component.html',
    styleUrls: ['./import-case-fhir-record.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FhirValidatorComponent,
    ValidatorLoadingMessageComponent,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ]
})
export class ImportCaseFhirRecordComponent implements OnInit {

  @ViewChild(FhirValidatorComponent) fhirValidator

  readonly validatorReady = signal(false);
  readonly showValidatorLoading = computed(() =>
    !this.validatorReady() && !this.sharedHttpErrorService.errorDetected()
  );

  isLoading: boolean = false;
  fhirResource: any;
  validationExecuted: boolean = false;
  preconditionError: string;

  ig: ImplementationGuide = {
    canonicalUrl:'hl7.fhir.us.mdi#current',
    name: "hl7.fhir.us.mdi",
    version: "current"
  };

  constructor(
    @Inject('importConfig') public config: ModuleHeaderConfig,
    private importCaseService: ImportCaseService,
    private utilsService: UtilsService,
    private dialog: MatDialog,
    private fhirValidatorResultsExportService: FhirValidatorResultsExportService,
    private fhirValidatorReadinessService: FhirValidatorReadinessService,
    private sharedHttpErrorService: SharedHttpErrorService,
    private destroyRef: DestroyRef) {
  }

  ngOnInit(): void {
    this.fhirValidatorReadinessService.getValidatorLoaded()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          if (response.status === 'ready') {
            this.validatorReady.set(true)
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

  importCase(){
    this.isLoading = true;
    this.importCaseService.importResource(this.fhirResource).subscribe({
      next: value => {
        this.utilsService.showSuccessMessage("The resource was imported successfully.");
        this.isLoading = false;
      },
      error: err => {
        this.utilsService.showErrorMessage("A server error occurred while importing the resource.")
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  onExportValidationResults(event: any){
    this.fhirValidatorResultsExportService.exportToPdf(event.jsonResource, event.resultsData);
  }

  onImportRecord() {
    openConfirmationDialog(
      this.dialog,
      {
        title: "Import Invalid Resource",
        content: "Invalid records may behave unexpectedly. Do you want to proceed?",
        primaryActionBtnTitle: "Submit",
        secondaryActionBtnTitle: "Cancel",
        width: "25em",
        isPrimaryButtonLeft: true
      })
      .subscribe(
        action => {
          if (action == 'primaryAction') {
            this.importCase();
          }
          else if(action == 'secondaryAction'){
            //console.log('secondary selected');
          }
        }
      );
  }

  onValidation(event: ValidationResults) {
    this.validationExecuted = true;
    this.fhirResource = event.resource;
  }

  onValidationError(event: any) {
    this.validationExecuted = true;
  }

  onValidate() {
    this.fhirValidator.validateFhirResource();
  }

  onResourceContentChanged(event: any) {
    this.validationExecuted = false;
  }
}
