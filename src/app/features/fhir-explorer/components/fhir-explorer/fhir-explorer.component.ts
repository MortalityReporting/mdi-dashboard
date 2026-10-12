import {Component, OnInit, ElementRef, ChangeDetectionStrategy, signal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UtilsService} from "../../../../service/utils.service";
import {FhirExplorerService} from "../../services/fhir-explorer.service";
import {MatButtonToggleGroup, MatButtonToggle} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';
import {MatTooltip} from '@angular/material/tooltip';
import {MatButton} from '@angular/material/button';
import {CdkCopyToClipboard} from '@angular/cdk/clipboard';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-fhir-explorer',
  templateUrl: './fhir-explorer.component.html',
  styleUrls: ['./fhir-explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatButtonToggleGroup, FormsModule, MatButtonToggle, MatTooltip, MatButton, CdkCopyToClipboard, MatIcon]
})
export class FhirExplorerComponent implements OnInit {

  formattedText = signal<string>('');
  fhirResource = signal<any>(null);
  selectedStructure = signal<string>("narrative");
  isLoadingXMLData = signal<boolean>(false);

  constructor(
    private httpClient: HttpClient,
    private fhirExplorerService: FhirExplorerService,
    private utilsService: UtilsService,
    private elRef: ElementRef
  ) {
  };

  ngOnInit(): void {
    this.fhirExplorerService.fhirResource$.subscribe(resource => {
      this.fhirResource.set(resource);

      if (!this.fhirResource()) {
        this.formattedText.set('');
      } else if (this.selectedStructure() == "narrative") {
        if (this.fhirResource()?.text?.div) {
          this.formattedText.set(this.fhirResource()?.text?.div);
        } else {
          this.selectedStructure.set("json");
          this.formattedText.set(JSON.stringify(resource, null, 2));
        }
      } else if (this.selectedStructure() === "xml") {
        this.isLoadingXMLData.set(true);
        this.fhirExplorerService.translateToXml(this.fhirResource()).subscribe({
          next: response => {
            this.formattedText.set(response);
            this.isLoadingXMLData.set(false);
          },
          error: error => {
            this.isLoadingXMLData.set(false);
            this.formattedText.set(`Server Error Detected: ${error.message}`);
          }
        })
      } else {
        this.formattedText.set(JSON.stringify(resource, null, 2));
      }
      this.elRef.nativeElement.parentElement.parentElement.scrollTo(0, 0);
    })
  }


  isNarrative(): boolean {
    return this.selectedStructure() === 'narrative';
  }

  onToggleClick() {
    if (this.selectedStructure() === "narrative") {
      this.formattedText.set(this.fhirResource()?.text?.div);
    } else {
      this.fhirExplorerService.setSelectedFhirResource(this.fhirResource());
    }
  }

  onCopyToClipboard(formattedText: string) {
    this.utilsService.showSuccessMessage("Content copied to clipboard.")
  }
}
