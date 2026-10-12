import {Component, inject, Inject, output, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormGroupDirective, ValidationErrors, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {ModuleHeaderConfig} from "../../../../../providers/module-header-config";
import {Parameters} from "../../../../record-viewer/services/dcr-document-handler.service";
import { MatCheckboxChange, MatCheckbox } from "@angular/material/checkbox";
import { MatRadioChange, MatRadioGroup, MatRadioButton } from "@angular/material/radio";
import {ETHNICITY, PLACE_OF_DEATH, RACE_CATEGORIES} from "../../../providers/module-constants"
import {DeathCertificateReviewService} from "../../../services/death-certificate-review.service";
import {UtilsService} from "../../../../../service/utils.service";
import {ExternalApiSubmissionService} from "../../../services/external-api-submission.service";
import { MatFormField, MatLabel, MatInput, MatError, MatSuffix, MatHint } from '@angular/material/input';
import { MatDatepickerInput, MatDatepicker, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatTimepickerInput, MatTimepicker, MatTimepickerToggle } from '@angular/material/timepicker';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardHeader, MatCardContent } from '@angular/material/card';
import { ResponseViewerComponent } from '../../response-viewer/response-viewer.component';

@Component({
    selector: 'app-dcr-form-submission',
    templateUrl: './dcr-form-submission.component.html',
    styleUrls: ['./dcr-form-submission.component.scss', '../death-certificate-review-submission.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
        MatDatepickerInput,
        MatDatepicker,
        MatDatepickerToggle,
        MatSuffix,
        MatTimepickerInput,
        MatTimepicker,
        MatTimepickerToggle,
        MatRadioGroup,
        MatRadioButton,
        MatHint,
        MatIcon,
        MatTooltip,
        MatCheckbox,
        MatButton,
        MatCard,
        MatCardHeader,
        MatCardContent,
        ResponseViewerComponent,
    ],
})
export class DcrFormSubmissionComponent {

  submitDcrForm = output<Parameters[]>();
  @ViewChild('formDirective') formDirective: FormGroupDirective;
  errorResponse: any;
  externalApiSubmissionService = inject(ExternalApiSubmissionService);

  readonly ETHNICITY = Object.values(ETHNICITY);
  readonly RACE_CATEGORIES = Object.values(RACE_CATEGORIES);
  readonly PLACE_OF_DEATH = Object.values(PLACE_OF_DEATH);
  requestHeader: any;

  placeOfDeath = new FormGroup({
    placeOfDeathRadio: new FormControl(''),
    description: new FormControl({value: '', disabled: true}),
  });

  race = new FormGroup({
    raceCheck: this.fb.array(this.RACE_CATEGORIES.slice(0, 5).map(() => new FormControl(false))),
    raceRadio: new FormControl(''),
    description: new FormControl({value: '', disabled: true}),
  });

  address = new FormGroup({
    addressLine1: new FormControl('', [Validators.required]),
    addressLine2: new FormControl(''),
    city: new FormControl('', Validators.required),
    state: new FormControl('', Validators.required),
    zip: new FormControl('', Validators.required),
    country: new FormControl('USA', Validators.required),
  });

  optionalAddress = new FormGroup({
    addressLine1: new FormControl(''),
    addressLine2: new FormControl(''),
    city: new FormControl(''),
    state: new FormControl(''),
    zip: new FormControl(''),
    country: new FormControl('USA'),
  });

  dcrForm = new FormGroup({
    submitter: new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
    }),
    funeralHome: new FormGroup({
      name: new FormControl('', Validators.required),
      address: this.address,
      phone: new FormControl('', Validators.required),
      fax: new FormControl(''),
    }),
    deathInvestigation: new FormGroup({
      dateOfDeath: new FormControl('', [Validators.required, this.yearValidator]),
      timeOfDeath: new FormControl(''),
      placeOfDeath: this.placeOfDeath,
      address: this.optionalAddress,
      placeOfDeathFacilityName: new FormControl('',[Validators.required]),
    }),
    decedentInfo: new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      middleName: new FormControl(''),
      race: this.race,
      ethnicity: new FormControl(''),
      decedentDateOfBirth: new FormControl('', [Validators.required, this.yearValidator]),
    })
  });


  constructor(
    @Inject('workflowSimulatorConfig') public config: ModuleHeaderConfig,
    private deathCertificateReviewService: DeathCertificateReviewService,
    private fb: FormBuilder,
    private utilService: UtilsService
  ) {
  }


  onSubmit() {
    this.constructValidatorsAndValidate();
    if(!this.dcrForm.controls.deathInvestigation.controls.placeOfDeathFacilityName.value){
      this.dcrForm.controls.deathInvestigation.controls.placeOfDeathFacilityName.patchValue('N/A')
    }
    const data = this.constructParametersResource();

    this.errorResponse = null;
    this.externalApiSubmissionService.setRequestHeader(null);
    if (this.dcrForm.invalid) {
      this.utilService.showErrorMessage("Invalid form detected. Please fill all required fields");
    } else {
      this.deathCertificateReviewService.generateDcrFhirBundle(data).subscribe({
        next: result => {
          this.utilService.showSuccessMessage("FHIR Bundle Generated Successfully!");
          this.requestHeader = this.externalApiSubmissionService.requestHeader();
        },
        error: err => {
          this.errorResponse = err;
          this.requestHeader = this.externalApiSubmissionService.requestHeader();
          this.utilService.showErrorMessage("Error Generating FHIR Bundle!");
          this.deathCertificateReviewService.setFhirBundle(null);
        }
      })
    }

  }

  onRaceCategoryCheckboxChange(event: MatCheckboxChange) {
    this.race.controls.raceRadio.reset();
    this.race.controls.description.reset();
    this.race.controls.description.disable();
  }

  onRaceCategoryRadioChange(event: MatRadioChange) {
    this.race.controls['raceCheck'].reset();
    if (event.value.display != 'Other') {
      this.race.controls.description.reset();
      this.race.controls.description.disable();
    } else {
      this.race.controls.description.enable();
    }
  }

  onRacePlaceOfDeathRadioChange(event: MatRadioChange) {
    if (event.value?.display != 'Other') {
      this.placeOfDeath.controls.description.reset();
      this.placeOfDeath.controls.description.disable();
    } else {
      this.placeOfDeath.controls.description.enable();
    }
  }

  private raceValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value?.raceCheck?.find(check => !!check) || value?.raceRadio) {
      return null;
    }
    return {raceSelectionRequired: true}; //Return error object if invalid
  }

  private raceDescriptionRequiredValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value?.raceRadio?.display !== 'Other' || value?.description) {
      return null;
    }
    return {raceDescriptionRequired: true}; //Return error object if invalid
  }

  private placeOfDeathRequiredValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!!value?.placeOfDeathRadio) {
      return null;
    }
    return {placeOfDeathRequired: true}; //Return error object if invalid
  }


  private placeOfDeathDescriptionRequiredValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value?.placeOfDeathRadio?.display !== 'Other' || value?.description) {
      return null;
    }
    return {placeOfDeathDescriptionRequired: true}; //Return error object if invalid
  }

  private yearValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null; // Let required validator handle empty values
    }

    let year: number;
    if (value instanceof Date) {
      year = value.getFullYear();
    } else if (typeof value === 'string') {
      const date = new Date(value);
      year = date.getFullYear();
    } else {
      return null;
    }

    if (year < 1000 || year > 9999) {
      return { invalidYear: true };
    }

    return null;
  }

  private constructValidatorsAndValidate() {
    this.dcrForm.controls.decedentInfo.controls.ethnicity.updateValueAndValidity();

    this.dcrForm.controls.decedentInfo.controls.race.setValidators([this.raceValidator, this.raceDescriptionRequiredValidator]);
    this.dcrForm.controls.decedentInfo.controls.race.updateValueAndValidity();

    this.dcrForm.controls.deathInvestigation.controls.placeOfDeath.setValidators([this.placeOfDeathRequiredValidator, this.placeOfDeathDescriptionRequiredValidator]);
    this.dcrForm.controls.deathInvestigation.controls.placeOfDeath.updateValueAndValidity();

  }

  private constructParametersResource(): Parameters[] {
    let parameters: Parameters[] = [];

    const name: Parameters = {name: 'type', valueString: 'ccr'};
    parameters.push(name);

    //Submitter Section
    if(this.dcrForm.controls.submitter.controls.firstName.value){
      const submitterFirstName = {
        name: 'submitterFirstName',
        valueString: this.dcrForm.controls.submitter.controls.firstName.value
      };
      parameters.push(submitterFirstName);
    }

    if(this.dcrForm.controls.submitter.controls.lastName.value){
      const submitterLastName = {
        name: 'submitterLastName',
        valueString: this.dcrForm.controls.submitter.controls.lastName.value
      };
      parameters.push(submitterLastName);
    }

    if(this.dcrForm.controls.submitter.controls.email.value){
      const submitterEmail = {name: 'submitterEmail', valueString: this.dcrForm.controls.submitter.controls.email.value};
      parameters.push(submitterEmail);
    }

    //Funeral Home Section
    if(this.dcrForm.controls.funeralHome.controls.name.value){
      const funeralHomeName = {
        name: 'funeralHomeName',
        valueString: this.dcrForm.controls.funeralHome.controls.name.value
      };
      parameters.push(funeralHomeName);
    }

    if(this.dcrForm.controls.funeralHome.controls.address.controls.addressLine1.value){
      const funeralHomeAddrLine1 = {
        name: 'funeralHomeAddrLine1',
        valueString: this.dcrForm.controls.funeralHome.controls.address.controls.addressLine1.value
      };
      parameters.push(funeralHomeAddrLine1);
    }

    if(this.dcrForm.controls.funeralHome.controls.address.controls.addressLine2.value){
      const funeralHomeAddrLine2 = {
        name: 'funeralHomeAddrLine2',
        valueString: this.dcrForm.controls.funeralHome.controls.address.controls.addressLine2.value
      };
      parameters.push(funeralHomeAddrLine2);
    }

    if(this.dcrForm.controls.funeralHome.controls.address.controls.city.value){
      const funeralHomeAddrCity = {
        name: 'funeralHomeAddrCity',
        valueString: this.dcrForm.controls.funeralHome.controls.address.controls.city.value
      };
      parameters.push(funeralHomeAddrCity);
    }

    if(this.dcrForm.controls.funeralHome.controls.address.controls.state.value){
      const funeralHomeAddrState = {
        name: 'funeralHomeAddrState',
        valueString: this.dcrForm.controls.funeralHome.controls.address.controls.state.value
      };
      parameters.push(funeralHomeAddrState);
    }

    if(this.dcrForm.controls.funeralHome.controls.address.controls.zip.value){
      const funeralHomeAddrZip = {
        name: 'funeralHomeAddrZip',
        valueString: this.dcrForm.controls.funeralHome.controls.address.controls.zip.value
      };
      parameters.push(funeralHomeAddrZip);
    }

    if(this.dcrForm.controls.funeralHome.controls.address.controls.country.value){
      const funeralHomeAddrCountry = {
        name: 'funeralHomeAddrCountry',
        valueString: this.dcrForm.controls.funeralHome.controls.address.controls.country.value
      };
      parameters.push(funeralHomeAddrCountry);
    }

    if(this.dcrForm.controls.funeralHome.controls.phone.value){
      const funeralHomeAddrPhone = {
        name: 'funeralHomeAddrPhone',
        valueString: this.dcrForm.controls.funeralHome.controls.phone.value
      };
      parameters.push(funeralHomeAddrPhone);
    }

    if(this.dcrForm.controls.funeralHome.controls.fax.value){
      const funeralHomeAddrFax = {
        name: 'funeralHomeAddrFax',
        valueString: this.dcrForm.controls.funeralHome.controls.fax.value
      };
      parameters.push(funeralHomeAddrFax);
    }



    //Death Investigation Section
    const dateOfDeathStr = this.getDateStr(this.dcrForm.controls.deathInvestigation.controls.dateOfDeath.value)

    const timeOfDeathStr = this.getTimeStr(this.dcrForm.controls.deathInvestigation.controls.timeOfDeath.value);
    if(dateOfDeathStr){
      if (timeOfDeathStr) {
        parameters.push({name: 'dateOfDeath', valueDateTime: `${dateOfDeathStr}T${timeOfDeathStr}`});
      } else {
        parameters.push({name: 'dateOfDeath', valueDateTime: dateOfDeathStr});
      }
    }

    if(this.dcrForm.controls.deathInvestigation.controls.placeOfDeathFacilityName.value){
      const placeOfDeathFacilityName = {
        name: 'placeOfDeathFacilityName',
        valueString: this.dcrForm.controls.deathInvestigation.controls.placeOfDeathFacilityName.value
      };
      parameters.push(placeOfDeathFacilityName);
    }

    let placeOfDeathObj = this.dcrForm.controls.deathInvestigation.controls.placeOfDeath.value;
    if (placeOfDeathObj.placeOfDeathRadio?.['display'] != "Other") {
      const placeOfDeath = {name: 'placeOfDeath', valueCode: placeOfDeathObj.placeOfDeathRadio?.['code']};
      parameters.push(placeOfDeath);

    } else {
      const placeOfDeath = {name: 'placeOfDeath', valueCode: placeOfDeathObj.placeOfDeathRadio?.['code']};
      parameters.push(placeOfDeath);

      const placeOfDeathOther = {name: 'placeOfDeathOther', valueString: placeOfDeathObj.description};
      parameters.push(placeOfDeathOther);
    }

    if(this.dcrForm.controls.deathInvestigation.controls.address.controls.addressLine1.value){
      const placeOfDeathAddrLine1 = {
        name: 'placeOfDeathAddrLine1',
        valueString: this.dcrForm.controls.deathInvestigation.controls.address.controls.addressLine1.value
      };
      parameters.push(placeOfDeathAddrLine1);
    }

    if(this.dcrForm.controls.deathInvestigation.controls.address.controls.addressLine2.value){
      const placeOfDeathAddrLine2 = {
        name: 'placeOfDeathAddrLine2',
        valueString: this.dcrForm.controls.deathInvestigation.controls.address.controls.addressLine2.value
      };
      parameters.push(placeOfDeathAddrLine2);
    }

    if(this.dcrForm.controls.deathInvestigation.controls.address.controls.city.value){
      const placeOfDeathAddrCity = {
        name: 'placeOfDeathAddrCity',
        valueString: this.dcrForm.controls.deathInvestigation.controls.address.controls.city.value
      };
      parameters.push(placeOfDeathAddrCity);
    }

    if(this.dcrForm.controls.deathInvestigation.controls.address.controls.state.value){
      const placeOfDeathAddrState = {
        name: 'placeOfDeathAddrState',
        valueString: this.dcrForm.controls.deathInvestigation.controls.address.controls.state.value
      };
      parameters.push(placeOfDeathAddrState);
    }

    if(this.dcrForm.controls.deathInvestigation.controls.address.controls.zip.value){
      const placeOfDeathAddrZip = {
        name: 'placeOfDeathAddrZip',
        valueString: this.dcrForm.controls.deathInvestigation.controls.address.controls.zip.value
      };
      parameters.push(placeOfDeathAddrZip);
    }

    if(this.dcrForm.controls.deathInvestigation.controls.address.controls.country.value){
      const placeOfDeathAddrZip = {
        name: 'placeOfDeathAddrCountry',
        valueString: this.dcrForm.controls.deathInvestigation.controls.address.controls.country.value
      };
      parameters.push(placeOfDeathAddrZip);
    }



    //Decedent Info Section
    if(this.dcrForm.controls.decedentInfo.controls.firstName.value){
      const decedentFirstName = {
        name: 'decedentFirstName',
        valueString: this.dcrForm.controls.decedentInfo.controls.firstName.value
      };
      parameters.push(decedentFirstName);
    }

    if(this.dcrForm.controls.decedentInfo.controls.middleName.value){
      const decedentMiddleName = {
        name: 'decedentMiddleName',
        valueString: this.dcrForm.controls.decedentInfo.controls.middleName.value
      };
      parameters.push(decedentMiddleName);
    }

    if(this.dcrForm.controls.decedentInfo.controls.lastName.value){
      const decedentLastName = {
        name: 'decedentLastName',
        valueString: this.dcrForm.controls.decedentInfo.controls.lastName.value
      };
      parameters.push(decedentLastName);
    }

    if(this.dcrForm.controls.decedentInfo.controls.decedentDateOfBirth.value){
      const decedentDateOfBirth = {
        name: 'decedentDateOfBirth',
        valueString: this.getDateStr(this.dcrForm.controls.decedentInfo.controls.decedentDateOfBirth.value)
      };
      parameters.push(decedentDateOfBirth);
    }

    const decedentRaceCheck = this.dcrForm.controls.decedentInfo.controls.race.controls.raceCheck.value;

    if (decedentRaceCheck.find(value => !!value)) {
      const selectedRace = this.dcrForm.controls.decedentInfo.controls.race.controls.raceCheck.controls
        ?.map((control, index) => control.value ? this.RACE_CATEGORIES.slice(0, 5)[index].code : null)
        .filter(value => value !== null);

      selectedRace.forEach(race => {
        const raceParam = {name: 'decedentRace', valueString: race};
        parameters.push(raceParam);
      });
    } else {
      if (this.dcrForm.controls.decedentInfo.controls.race.controls.raceRadio.value?.['display'] == 'Other') {
        const decedentRace = {
          name: 'decedentRace',
          valueString: this.dcrForm.controls.decedentInfo.controls.race.controls.description.value
        };
        parameters.push(decedentRace);
      } else {
        const decedentRace = {
          name: 'decedentRace',
          valueCode: this.dcrForm.controls.decedentInfo.controls.race.controls.raceRadio.value?.['code']
        };
        parameters.push(decedentRace);
      }
    }


    if(this.dcrForm.controls.decedentInfo.controls.ethnicity.value?.['display']){
      const decedentEthnicity = {
        name: 'decedentEthnicity',
        valueCode: this.dcrForm.controls.decedentInfo.controls.ethnicity.value?.['code']
      };
      parameters.push(decedentEthnicity);
    }
    return parameters;
  }

  private getDateStr(dateString: string) {
    if (!dateString) {
      return '';
    }
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error parsing date string:', error);
      return null;
    }
  }

  private getTimeStr(timeStr: string) {
    if (!timeStr) {
      return '';
    }
    try {
      const date = new Date(timeStr);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('Error parsing date string:', error);
      return null;
    }
  }

  onFormClear() {
    this.dcrForm.reset();
    this.formDirective.resetForm();
    this.placeOfDeath.setErrors(null);
    this.dcrForm.controls.decedentInfo.controls.ethnicity.setErrors(null);
    this.dcrForm.controls.decedentInfo.controls.race.setErrors(null);
    this.errorResponse = null;
  }
}
