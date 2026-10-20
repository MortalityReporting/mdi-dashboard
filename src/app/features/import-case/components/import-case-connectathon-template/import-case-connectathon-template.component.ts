import {Component, Inject, signal, ChangeDetectionStrategy} from '@angular/core';
import {ImportCaseService} from "../../services/import-case.service";
import {UtilsService} from "../../../../service/utils.service";

import {openModal} from "../../../../components/widgets/modal/modal.component";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatDialog} from "@angular/material/dialog";
import {ModuleHeaderConfig} from "../../../../providers/module-header-config";
import {MatButtonModule} from "@angular/material/button";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MappingsComponent} from "../mappings/mappings.component";
import {JsonPipe, NgClass} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatTabsModule} from "@angular/material/tabs";
import {MatTooltip} from "@angular/material/tooltip";


@Component({
  selector: 'app-import-case-connectathon-template',
  templateUrl: './import-case-connectathon-template.component.html',
  styleUrls: ['./import-case-connectathon-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MappingsComponent,
    MatIconModule,
    MatTabsModule,
    JsonPipe,
    NgClass,
    MatTooltip
  ]
})
export class ImportCaseConnectathonTemplateComponent {
  isLoading = signal<boolean>(false);
  selectedCase: any;
  file: File = null;
  MAX_FILE_SIZE = 100000; // Max allowed file size is 100KB
  displayedColumns: string[] = ['name', 'status', 'state'];
  dataSource = new MatTableDataSource<any>();
  isExportSuccessful = signal<boolean>(false);
  errorsGenerated = signal<boolean>(false);
  fileSelectionAttempted = signal<boolean>(false);
  error: any;

  constructor(
    @Inject('importConfig') public config: ModuleHeaderConfig,
    private importCaseService: ImportCaseService,
    private utilsService: UtilsService,
    private dialog: MatDialog,
  ) {
  }

  onFileSelected(event: any) {
    this.utilsService.closeNotification();
    this.fileSelectionAttempted.set(false);

    this.file = event.target.files[0];

    if (!this.file) {
      this.utilsService.showErrorMessage("Unable to open the file.");
      return;
    }
    if (this.file.size > this.MAX_FILE_SIZE) {
      console.error("File too big")
      this.utilsService.showErrorMessage("This file exceeds " + this.MAX_FILE_SIZE / 1000 + "kb and cannot be processed");
      return;
    }
    this.selectedCase = null;
    this.isExportSuccessful.set(false);
    this.errorsGenerated.set(false);
  }

  clearUI() {
    // TODO reset the UI to it's initial state.
  }

  onSubmit() {
    if (!this.file) {
      this.fileSelectionAttempted.set(true);
      return;
    }

    this.isExportSuccessful.set(false);
    this.errorsGenerated.set(false);
    this.isLoading.set(true);
    this.error = null;
    this.importCaseService.uploadFile(this.file).subscribe({
      next: value => {
        this.isLoading.set(false);
        this.dataSource = new MatTableDataSource(value);
        if (value?.length > 0) {
          this.selectedCase = value[0];
        } else {
          this.selectedCase = null;
        }
        this.isExportSuccessful.set(true);
      },
      error: err => {
        console.error(err);
        this.error = err;
        this.isLoading.set(false);
        this.utilsService.showErrorMessage("Error uploading file " + this.file?.name);
        this.errorsGenerated.set(true);
      }
    });
  }

  scrollToTop(el: HTMLDivElement) {
    el.scrollTop = 0;
  }

  onExpandFhirBundle() {
    openModal(
      this.dialog,
      {
        title: "MDI FHIR Bundle",
        content: this.selectedCase?.fhirBundle,
        contentType: 'json',
        primaryColor: this.config.backgroundColor
      })
      .subscribe();
  }
}
