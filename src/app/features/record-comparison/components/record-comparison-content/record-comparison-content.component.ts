import {Component, Inject, OnInit, ViewChild, ChangeDetectionStrategy, signal} from '@angular/core';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from "@angular/material/expansion";
import { USCorePatientDiff } from '../../models/us-core-patient.diff';
import { CompositionMdiToEdrsDiff } from '../../models/composition-mdi-to-edrs.diff';
import { USCoreLocationDiff } from '../../models/us-core-location.diff';
import { USCorePractitionerDiff } from '../../models/us-core-practitioner.diff';
import { ObservationDecedentPregnancyDiff } from '../../models/observation-decedent-pregnancy.diff';
import { ObservationDeathDateDiff } from '../../models/observation-death-date.diff';
import { ObservationMannerOfDeathDiff } from '../../models/observation-manner-of-death.diff';
import { RecordComparisonDialogComponent } from '../record-comparison-dialog/record-comparison-dialog.component';
import { ActivatedRoute } from "@angular/router";
import {UserDocumentService} from "../../services/user-document.service";
import {MdiToEDRSDocumentWrapper} from "../../models/mdiToEdrsDocumentWrapper";
import {ReferenceDocumentService} from "../../services/reference-document.service";
import {ComparisonService} from "../../services/comparison.service";
import {Difference} from "../../models/difference";
import {MatDialog} from "@angular/material/dialog";
import {ModuleHeaderConfig} from "../../../../providers/module-header-config";
import { Fields} from "../../providers/field.config";
import { MatButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatCard, MatCardSubtitle, MatCardContent } from '@angular/material/card';
import { MatDivider } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { RecordComparisonContentFieldComponent } from '../record-comparison-content-field/record-comparison-content-field.component';

@Component({
    selector: 'record-comparison-content',
    templateUrl: './record-comparison-content.component.html',
    styleUrls: ['./record-comparison-content.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatButton, MatFormField, MatSelect, MatOption, MatCard, MatCardSubtitle, MatCardContent, MatDivider, MatIcon, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, RecordComparisonContentFieldComponent]
})
export class RecordComparisonContentComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;

  /**
   * UI State Variables
   * */
  isLoading = false;
  isAccordionExpanded = false;
  idStateList = [
    { expanded: true,     id: 'caseAdminInfo' },
    { expanded: false,    id: 'demographics' },
    { expanded: false,    id: 'jurisdiction' },
    { expanded: false,    id: 'causeAndManner' },
    { expanded: false,    id: 'medicalHistory' },
    { expanded: false,    id: 'narratives' },
    { expanded: false,    id: 'circumstances' },
    { expanded: false,    id: 'examAndAutopsy' },
  ]
  stateList = {
    isLoading: false,
    comparisonLoaded: false
  }

  /**
   * Reference Case List
   * */
  testCases: any;
  selectedTestCase: any = undefined;

  /**
   * MDI to EDRS Documents with Wrappers to be compared.
   * */
  userDocumentWrapper = signal<MdiToEDRSDocumentWrapper | undefined>(undefined); // A
  referenceDocumentWrapper = signal<MdiToEDRSDocumentWrapper | undefined>(undefined); // B
  difference: Difference = undefined; // Difference between A and B

  /**
   * Comparison Field Configuration
   * */
  fields: Fields = new Fields();


  patient: USCorePatientDiff = new USCorePatientDiff( undefined, undefined );
  mdiToEdrs: CompositionMdiToEdrsDiff = new CompositionMdiToEdrsDiff( undefined, undefined );
  location: USCoreLocationDiff = new USCoreLocationDiff( undefined, undefined );
  pregnancy: ObservationDecedentPregnancyDiff = new ObservationDecedentPregnancyDiff( undefined, undefined );
  deathDate: ObservationDeathDateDiff;
  mannerOfDeath: ObservationMannerOfDeathDiff;
  practitioner: USCorePractitionerDiff;


  constructor(
    @Inject('comparisonConfig') public config: ModuleHeaderConfig,
    private userDocumentService: UserDocumentService,
    private referenceDocumentService: ReferenceDocumentService,
    private comparisonService: ComparisonService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // If an "id" parameter is passed in the URL, load that case immediately.
    const compositionId = this.route.snapshot.params['id'];
    if (compositionId) {
      this.isLoading = true;
      this.userDocumentService.getUserDocumentBundle(compositionId).subscribe({
        next: (userDocumentWrapper: MdiToEDRSDocumentWrapper) => {
          this.userDocumentWrapper.set(userDocumentWrapper);
          this.isLoading = false;
        }
      });
    }

    // Get Reference Document List
    this.referenceDocumentService.getReferenceDocuments().subscribe(
      {next: value => {
          this.testCases = value;
          this.testCases.splice(0,0, {"display": "Select a reference record..."})
          this.selectedTestCase = this.testCases[0];
      }}
    );
  }

  runComparison() {
    this.difference = this.comparisonService.doDiff(this.userDocumentWrapper()?.documentBundle, this.referenceDocumentWrapper()?.documentBundle);
    this.stateList.comparisonLoaded = true;
  }

  onReferenceDocumentChanged(event: any ) {
    if (event.isUserInput === true && event.source.value.bundle) {
      this.referenceDocumentWrapper.set(this.userDocumentService.createDocumentWrapper(event.source.value.bundle));
      //this.referenceDocument = event.source.value.bundle;
      this.stateList.comparisonLoaded = false;
    }
  }

  onInputBundleClick() {
    const dialogRef = this.dialog.open(RecordComparisonDialogComponent, {
      data: null
    }).afterClosed().subscribe(data => {
      if (data) {
        this.userDocumentWrapper.set(null);
        setTimeout(() => { //we need to add a visual delay to indicate to the used that the dat was updated
          const parsedBundle = JSON.parse( data ); // TODO: Add error handling.
          this.userDocumentWrapper.set(this.userDocumentService.createDocumentWrapper(parsedBundle))
        }, 500)
      }
    });
  }

  clearCase() {
    this.userDocumentWrapper.set(undefined);
    this.difference = this.comparisonService.doDiff(undefined, undefined);
  }

  isExpanded(elementId: string) {
    return this.idStateList.find(element => element.id == elementId)?.expanded;
  }

  onToggleState(id: any ) {
    this.idStateList = this.idStateList.map(element => element.id == id ? {id: element.id, expanded: !element.expanded}: element);
  }

  onSetState(resourceId, state){
    this.idStateList = this.idStateList.map(element => element.id == resourceId ? {id: element.id, expanded: state} : element);
  }

  onOpenAll() {
    this.idStateList.forEach(element => element.expanded = true);
    this.accordion.openAll()
  }

  onCloseAll() {
    this.idStateList.forEach(element => element.expanded = false);
    this.accordion.closeAll()
  }
}
