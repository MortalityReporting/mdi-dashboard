import {
  Component,
  ElementRef,
  input,
  OnInit,
  output,
  signal,
  ViewChild,
  ChangeDetectionStrategy, OnDestroy
} from '@angular/core';
import { FormControl, FormGroup, UntypedFormControl, Validators, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from "@angular/material/table";
import {ResponseItem, FhirLocation} from "../../models/response-item";

import {ValidationResults} from "../../models/validation-results";
import {ApiResponse} from "../../models/api-response";
import {ValidatorInput} from "../../models/validator-input-format";
import {ImplementationGuide} from "../../models/implementation-guide";
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { NgStyle, NgClass, TitleCasePipe } from '@angular/common';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatTooltip } from '@angular/material/tooltip';
import {FhirValidatorService} from "../../services/fhir-validator.service";
import {SharedHttpWarningService} from "../../../../service/shared-http-warning.service";
import {WarningMessageComponent} from "../../../../components/warning-message/warning-message.component";

export type SubmitButtonAlignment = 'left' | 'right';
export const SEVERITY_LEVELS: string[] = ['error', 'warning', 'information', 'note'];
export const  DISPLAYED_COLUMNS = ['toggle', 'icon', 'severity', 'fhirPath', 'location'];
export const FONT_WIDTH: number = 7.54;
export const OPERATION_OUTCOME_ISSUE_LINE_URL = 'http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-line';
export const OPERATION_OUTCOME_ISSUE_COL_URL = 'http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-col';


@Component({
    selector: 'app-fhir-validator-lib',
    templateUrl: 'fhir-validator.component.html',
    styleUrls: ['fhir-validator.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatProgressSpinner, MatCardHeader, MatCardTitle, MatButton, MatIcon, MatRadioGroup, ReactiveFormsModule, FormsModule, MatRadioButton, MatFormField, MatLabel, MatSelect, MatOption, MatError, NgStyle, NgClass, MatButtonToggleGroup, MatButtonToggle, MatCheckbox, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatTooltip, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, TitleCasePipe, WarningMessageComponent]
})


export class FhirValidatorComponent implements OnInit, OnDestroy {
  validatorTitle = input<string>('');
  validationResultsExpanded = input<boolean>(false); // Validation results details initial state
  resultDetailsExpandBtnShown = input<boolean>(true); // Show/hide Expand Validation Results btn
  formatResourceBtnShown = input<boolean>(false); // Show/hide Format Resource btn
  clearValidatorBtnShown = input<boolean>(true); // Show/hide Clear Validator btn
  submitBtnShown = input<boolean>(true); // Show/hide Submit btn
  exportResultsButtonShown = input<boolean>(true);
  submitBtnTitle = input<string>('Submit'); //The submit button title. "Submit" is generic name and other apps may want to change it
  validationInputFormat = input<ValidatorInput>({format: 'json', accepts: '.json'});
  maxFileSize = input<number>(250000); // Max allowed file size is 250KB
  submitBtnAlignment = input<SubmitButtonAlignment>('right'); // The default location for the Submit btn
  cancelValidationBtnShown = input<boolean>(true);
  buttonTxtColor = input<string>('white');
  buttonBackgroundColor = input<string>('#4858B8');
  exportValidationResultsBtnName = input<string>('Export Results (.zip)');
  ig = input<ImplementationGuide | undefined>(undefined);

  onValidation = output<ValidationResults>();
  onApiError = output<any>();
  onResourceContentChanged = output<any>();
  onExportValidationResults = output<any>();


  @ViewChild('validatorInput',{static:false, read: ElementRef}) inputRef: any;

  apiResponse = signal<ApiResponse | null>(null);
  fhirResource = signal<string>(''); // The Resource.
  resourceFormat = 'json'; // The resource format could be JSON or XML, with JSON being the default format.
  fileName: string = ''; // Name of the file uploaded by the user. We need this to render the filename in the UI.
  validationErrorStr: string = ''; // We use this value to store preliminary error messages or a generic error message.
  hasResponseData = false;  // Indicates if the response generated any messages. If true, we render the report
  parsedFhirResource: string = ''; // We store value of the validator result in order to present it to the user.
  displayedColumns: string[];
  isLoading = false;
  allExpanded = true; // Used to render collapsed/expanded all icon as well as calculate if all results are expanded/collapsed
  severityLevels = SEVERITY_LEVELS;
  severityLevelsFormControl: UntypedFormControl; // A simple form control used for filtering the results.
  dataSource: MatTableDataSource<any>;// Data source for the report table.
  validationFinished = false;
  isValidResource = false; // We use this to render the success message
  serverErrorDetected = false; // Tracks if the server has responded with an error (404, 500). Used to render the error in UI.
  serverErrorList: any [] = []; // Store the data from the OperationOutcome resource
  serverErrorStatus: string = ''; // We store the error response status here (i.e. 404, 500)
  lines : number = 1;
  width : number = 0;
  igList = signal<ImplementationGuide[]>([]);
  igNameList: string[] = [];
  igVersionList: string[] = [];
  selectedIgName: string;
  selectedIgVersion: string;
  igVersionDropdownList: string[];
  selectedIG: ImplementationGuide;
  localResultDetailsExpanded: boolean = true; // Local state for expand/collapse button

  SERVER_TIMEOUT_INTERVAL = 8000; // 8 seconds

  igSelectionFg = new FormGroup({});

  constructor(
    private fhirValidatorService: FhirValidatorService,
    protected sharedHttpWarningService: SharedHttpWarningService,
  ) {
    this.displayedColumns = DISPLAYED_COLUMNS;
    this.severityLevelsFormControl = new UntypedFormControl(this.severityLevels);
    this.dataSource = new MatTableDataSource<any[]>();
    // Initialize form controls to prevent "unrecognized form control" errors
    this.igSelectionFg.addControl('selectedIgName', new FormControl('', Validators.required));
    this.igSelectionFg.addControl('selectedIgVersion', new FormControl('', Validators.required));

    // Set up valueChanges subscription
    this.igSelectionFg.controls['selectedIgName'].valueChanges.subscribe({
      next: value => {
        this.setIgVersionControl(value, this.igList());
      }
    });
  }

  ngOnDestroy(): void {
    this.sharedHttpWarningService.hideWarningComponent();
  }

  ngOnInit(): void {
    // Initialize local state from input signal
    this.localResultDetailsExpanded = this.resultDetailsExpandBtnShown();

    if(this.ig()){
      this.selectedIG = this.ig()!;
    }
    else{
      this.getIgList();
    }
  }

  getIgList() {
    this.fhirValidatorService.getIgList().subscribe({
      next: (value: any) => {
        this.igList.set(value);
        this.igNameList = value.map(el => el.name);
        this.igNameList = [...new Set(this.igNameList)];
        this.igVersionList = value.map(el => el.version);
      },
      error: err => console.error(err)
    });
  }

  formatFhirResource(){
    if(this.fhirResource()){
      if(this.resourceFormat === 'json' && this.fhirValidatorService.isJson(this.fhirResource())){
        this.fhirResource.set(this.fhirValidatorService.beautifyJSON(this.fhirResource()));
      }
      else if(this.resourceFormat === 'xml' && this.fhirValidatorService.isXmlString(this.fhirResource())){
        this.fhirResource.set(this.fhirValidatorService.beautifyXML(this.fhirResource()));
      }
    }
    this.lineNumbers()
  }

  lineNumbers() {
    const linedStrings = this.fhirResource().split(/[\n\r]/g);
    this.lines = linedStrings.length;
    this.width = this.inputRef.nativeElement.offsetWidth;
    const charInLines = this.width / FONT_WIDTH;

    for (const line of linedStrings) {
      if (line.length > charInLines) {
        this.lines = this.lines + (line.length / charInLines)
      }
    }
  }

  getLineNumbers() {
    return Array.from({length: this.lines}, (_, i) => (i + 1).toString());
  }

  // It is important the format is working with "best effort"
  // That is it may or may not format the text properly and require extensive testing to validate its operation.
  onFormatInput() {
    this.formatFhirResource()
    this.fhirValidatorService.showSuccessMessage("Formatting Attempted.");
  }

  clearUI(){
    this.fhirResource.set('');
    this.fileName=''
    this.clearValidationErrors();
    this.onResourceContentChanged.emit(this.fhirResource());
  }

  onClear(){
    this.clearUI();
  }

  onFileSelected(event: any) {

    const file: File = event.target.files[0];

    if (file) {
      if(file.size > this.maxFileSize()){
        console.error("File too big")
        this.fhirValidatorService.showErrorMessage("This file exceeds " + this.maxFileSize() /  1000 + "kb and cannot be processed");
      }
      else {
        // auto toggle the file type radio buttons
        if (file.type === "text/xml") {
          this.resourceFormat = 'xml';
        } else if (file.type === "application/json") {
          this.resourceFormat = 'json';
        }

        // set the filename in the UI
        this.fileName = file.name;

        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = () => {
          this.fhirResource.set(reader.result as string);
          this.onResourceContentChanged.emit(this.fhirResource());
          this.formatFhirResource();
        }
        reader.onerror = () => {
          this.fhirValidatorService.showErrorMessage("Unable to open the file.");
        }
      }

    }
    else {
      this.fhirValidatorService.showErrorMessage("Unable to open the file.");
    }
  }

  validateFhirResource(fhirResource: any, resourceFormat: string) {
    // Set the stage for the validation. Reset variables to default values.
    if(!fhirResource){
      fhirResource = this.fhirResource()
    }
    if(!resourceFormat){
      resourceFormat = this.resourceFormat
    }

    this.igSelectionFg.markAllAsTouched();
    this.igSelectionFg.updateValueAndValidity();
    if (this.igList()?.length > 1 && this.igSelectionFg.valid) {
      this.setSelectedIg(this.igSelectionFg.controls['selectedIgName'].value, this.igSelectionFg.controls['selectedIgVersion'].value);
    }

    this.isValidResource = true;
    this.hasResponseData = false;
    this.serverErrorList = [];
    this.serverErrorStatus = '';
    this.serverErrorDetected = false;
    this.sharedHttpWarningService.hideWarningComponent();
    this.severityLevelsFormControl.patchValue(this.severityLevels);

    this.validationErrorStr = this.fhirValidatorService.getUiValidationMessages(fhirResource, resourceFormat, this.selectedIG);

    if(this.validationErrorStr){
      //see if we can find any obvious issues with the resource here
      this.isValidResource = false;
      this.validationFinished = true;
      this.onValidation.emit({hasBasicErrors: true, isValid: false, resource: fhirResource});

    }
    else {
      // The UI validation passed successfully, and we execute the backend validation.
      this.executeAPIValidation(fhirResource, resourceFormat, this.selectedIG?.canonicalUrl);
    }
  }

  onPasteFhirResource(event: ClipboardEvent) {
    this.fileName = '';
    if(!this.fhirResource()) {
      this.clearUI();
    }
    let text = event.clipboardData?.getData('text') ?? '';
    if (this.fhirValidatorService.isJson(text)) {
      this.resourceFormat = 'json';
    } else if (this.fhirValidatorService.isXmlString(text)) {
      this.resourceFormat = 'xml';
    }
  }

  getLineNumbersBySeverity(apiResponse: ApiResponse | null, severity: string): number[]{
    if(!apiResponse || apiResponse.issue?.length === 0){
      return [];
    }
    return apiResponse.issue
      .filter(element => element.severity == severity)
      .filter(element => element.extension && element.extension.length > 0)
      .map(element => {
        const location = this.getFhirLocation(element.extension);
        return location ? location.line - 1 : -1;
      })
      .filter(lineNum => lineNum >= 0);
  };


  scrollToElement(location: string ): void {
    const element = document.querySelector(location);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Generic helper to extract a numeric extension value by URL from a FHIR extension array.
  private getExtensionValue(extension: any[] | undefined, url: string): number | undefined {
    return extension?.find((ext: any) => ext.url === url)?.valueInteger;
  }

  // Extracts the line/col location from an issue's extension array (new API format) as a single object.
  getFhirLocation(extension: any[] | undefined): FhirLocation | undefined {
    const line = this.getExtensionValue(extension, OPERATION_OUTCOME_ISSUE_LINE_URL);
    if (line === undefined) {
      return undefined;
    }
    const col = this.getExtensionValue(extension, OPERATION_OUTCOME_ISSUE_COL_URL) ?? 0;
    return { line, col };
  }

  // Returns a comparable numeric value combining line and column so results sort in ascending order.
  getSortableLocationValue(location: FhirLocation | undefined): number {
    if (!location) {
      return 0;
    }
    // Combine line and column into a single sortable number (col as decimal fraction)
    return location.line + (location.col / 100000);
  }

  getLocationDisplay(location: FhirLocation | undefined): string {
    if (!location) {
      return '';
    }
    return location.col ? `(line ${location.line}, col${location.col})` : `(line ${location.line})`;
  }

  // When the user selects a location from the errors and warning results, we want to scroll the page to that location.
  onLocationSelected(validationResultItem: ResponseItem): void {
    const line = validationResultItem.location?.line;

    if (line) {
      let locationId = ('#mark' + line).toLowerCase();
      this.scrollToElement(locationId);
    }
  }



  // Sends fhir resource to be validated, renders response

  private executeAPIValidation(fhirResource: any, resourceFormat: string, ig: string) {
    // Reset values to default state prior to validation.
    this.isLoading = true;
    this.parsedFhirResource = '';
    this.validationFinished = false;
    this.apiResponse.set(null);

    if(this.resourceFormat === "json"){
      fhirResource = JSON.parse(fhirResource);
    }
    else if(this.resourceFormat === "xml"){
      let fhirResourceXML = new DOMParser().parseFromString(fhirResource, 'text/xml');
      fhirResource = fhirResourceXML.documentElement.outerHTML;
    }

    this.fhirValidatorService.validateFhirResource(fhirResource, resourceFormat, ig)
      .subscribe({
        next: (response) => {
          this.validationFinished = true;
          let issue = response.issue;
          if(issue.length === 1 && issue[0].severity === "Information" && issue[0]?.message.toLowerCase() === "ALL OK".toLowerCase()){
            this.isValidResource = true;
            this.onValidation.emit({isValid: true, resource: fhirResource});
          }
          else {
            this.isValidResource = false;
            this.validationErrorStr = "Please see the validation errors below.";
            this.setValidatorResponse(response, fhirResource);
          }

          // Some strings produced by the validator are long and miss spaces. This could break the UI validation report.
          // Therefore, we insert a space after each coma found in the validation response text.
          issue.forEach((element: any) => {
            // Set diagnostics from details.text for display
            element.diagnostics = element.details?.text?.replace(/,(?=[^\s])/g, ", ") || '';
          })

          // sort by line/column number from the extension array so results are shown in ascending order
          issue = issue.sort((a: any, b: any) => {
            const locationA = this.getFhirLocation(a.extension);
            const locationB = this.getFhirLocation(b.extension);
            return this.getSortableLocationValue(locationA) - this.getSortableLocationValue(locationB);
          });


          // mat each item of the response to an object and make sure that the results are in expanded state in the
          // UI validation report.
          this.dataSource.data = issue.map((element: any) => {
            let result: ResponseItem = Object.assign({}, element);
            result.expanded = true;
            result.location = this.getFhirLocation(element.extension);
            result.locationDisplay = this.getLocationDisplay(result.location);
            return result
          });



          this.dataSource.filterPredicate = this.getFilterPredicate();

          // Extract formatted resource from extension array (old API format)
          // or use the original input resource (new API format)
          let formattedResource: string | undefined;

          // Try old API format: extension at root level with formatted resource
          const formattedResourceExt = response?.extension?.find((ext: any) =>
            ext.url === 'urn:local:formattedResourceBody'
          );

          if (formattedResourceExt?.valueString) {
            formattedResource = formattedResourceExt.valueString;
          } else {
            // New API format doesn't include formatted resource, use the original input
            formattedResource = typeof fhirResource === 'string'
              ? fhirResource
              : JSON.stringify(fhirResource, null, 2);
          }

          const apiResponseWithFormatted = {
            ...response,
            formattedResource: formattedResource
          };
          this.apiResponse.set(apiResponseWithFormatted);
        },
        error: (err) => {
          this.isLoading = false;
          this.serverErrorDetected = true;
          this.serverErrorStatus = err.status;
          if(err?.error?.issue){
            this.serverErrorList = err.error.issue;
          }
          this.onApiError.emit(err);
          console.error(err);
        },
        complete: () => {
          this.isLoading = false;
          this.sharedHttpWarningService.hideWarningComponent();
          this.sharedHttpWarningService.hideWarningComponent();
        }
      });

    //TODO make sure to remove this function when the server side timeout is implemented.
    setTimeout(
      () => {
        if(this.isLoading) {
          this.sharedHttpWarningService.setWarningMessage(
            'The validator is downloading and caching packages and data, please wait or try later'
          );
        }
      }, this.SERVER_TIMEOUT_INTERVAL
    );

  }

  toggle() {
    this.allExpanded = !this.allExpanded;
    this.dataSource.data.forEach((item: any) => item.expanded = this.allExpanded);
  }

  onFilterResults() {
    this.dataSource.filter = this.severityLevelsFormControl.value.join(',');
  }

  getFilterPredicate() {
    return function (row: any, filters: string) {
      let matchFilter: boolean = false;
      const filterArray = filters.split(',');
      filterArray.forEach((filter: string) => {
          if(row.severity.toLowerCase().indexOf(filter.toLowerCase())!= -1){
            matchFilter = true;
          }
        }
      )
      return matchFilter;
    };
  }

  onCancelValidation (){
    this.isLoading = false;
    this.sharedHttpWarningService.hideWarningComponent();
  }

  checkExpandCollapseAllStatus() {
    /*
    * When all elements are collapsed we want to change the expansion icon to render "expand all"
    * When all elements are expanded we want to change the expansion icon to "collapse all"
    * This will save extra unnecessary click for the user
    */
    const expandedElementsCount = this.dataSource.data.filter(element => element['expanded']).length;
    if(expandedElementsCount === this.dataSource.data.length){
      this.allExpanded = true;
    }
    else if(expandedElementsCount === 0){
      this.allExpanded = false;
    }
  }

  isFilterEnabled(severity: string) {
    return !!this.dataSource.data.find((element: any) => element.severity.toLowerCase() === severity.toLowerCase());
  }

  getCount(level: any) {
    return this.dataSource.data
      .filter((element: any) => element.severity.toLowerCase() === level.toLowerCase())
      .length;
  }

  onCloseServerErrorMessage() {
    this.serverErrorDetected = false;
    this.serverErrorList = [];
    this.serverErrorStatus = '';
  }

  private setValidatorResponse(apiResponse: any, resource: string) {
    const errorsCount = apiResponse.issue.filter((element: any) => element.severity == 'error')?.length ?? 0;
    const warningsCount = apiResponse.issue.filter((element: any) => element.severity == 'warning')?.length ?? 0;
    const infoCount = apiResponse.issue.filter((element: any) => element.severity == 'information')?.length ?? 0;
    const notesCount = apiResponse.issue.filter((element: any) => element.severity == 'note')?.length ?? 0;

    let validationResult: ValidationResults = {};
    validationResult.errorsCount = errorsCount;
    validationResult.warningsCount = warningsCount;
    validationResult.notesCount = notesCount;
    validationResult.infoCount = infoCount;

    validationResult.isValid = errorsCount <= 0;
    validationResult.resource = resource;
    this.onValidation.emit(validationResult);
  }

  clearValidationErrors(){
    this.validationErrorStr = '';
    this.isValidResource = false;
    this.parsedFhirResource = '';
    this.hasResponseData = false;
    this.validationFinished = false;
    this.isLoading = false;
    this.serverErrorDetected = false;
    this.serverErrorList = [];
    this.serverErrorStatus = '';
    this.sharedHttpWarningService.hideWarningComponent();
    this.apiResponse.set(null);
  }

  getLineItemClass(item: string, i: number) {

    if(this.getLineNumbersBySeverity(this.apiResponse(), 'error').indexOf(i) != -1){
      this.hasResponseData = true;
      return "error-mark";
    }
    else if(this.getLineNumbersBySeverity(this.apiResponse(), 'warning').indexOf(i) != -1){
      this.hasResponseData = true;
      return "warning-mark";
    }
    else if(this.getLineNumbersBySeverity(this.apiResponse(), 'information').indexOf(i) != -1){
      this.hasResponseData = true;
      return "info-mark";
    }
    else if(this.getLineNumbersBySeverity(this.apiResponse(), 'note').indexOf(i) != -1){
      this.hasResponseData = true;
      return "note-mark";
    }

    else return'';
  }


  exportValidationResults() {
    // Add the formatted resource form the validator response to a json file
    // This way the line numbers from the validator report will match the json file numbers
    const jsonResource = this.apiResponse()?.formattedResource || '';
    // Create a pdf report
    const resultsData = this.dataSource.data
      .map(element=> { return {severity: element.severity, diagnostics: element.diagnostics, location: element.locationDisplay, fhirPath: element?.expression?.[0]}})
      .filter(item => this.severityLevelsFormControl.value.indexOf(item.severity) != -1);

    this.onExportValidationResults.emit({jsonResource: jsonResource, resultsData: resultsData});
  }


  setIgVersionControl(selectedIgName: string, igList: ImplementationGuide[]) {
    this.igVersionDropdownList = igList.filter(el=> el.name == selectedIgName).map( el=> el.version);
    let igVersion: string = null;
    if(this.igVersionDropdownList?.length == 1){
      igVersion = this.igVersionDropdownList[0];
    }
    this.igSelectionFg.controls['selectedIgVersion'].patchValue(igVersion);
  }

  setSelectedIg(selectedIgName: string, selectedIgVersion: string) {
    this.selectedIG = this.igList().find(el => el.name == selectedIgName && el.version == selectedIgVersion);
  }
}
