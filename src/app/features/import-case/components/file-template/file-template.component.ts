import {Component, Inject, input, ChangeDetectionStrategy} from '@angular/core';
import {FileTemplate, TemplateContent} from "../../models/file-template";
import {ModuleHeaderConfig} from "../../../../providers/module-header-config";
import {FileTemplateService} from "../../services/file-template.service";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {UpperCasePipe} from "@angular/common";

@Component({
    selector: 'app-file-template',
    templateUrl: './file-template.component.html',
    styleUrls: ['./file-template.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        UpperCasePipe
    ]
})
export class FileTemplateComponent {
  fileTemplate = input.required<FileTemplate>();

  constructor(
    @Inject('importConfig') public config: ModuleHeaderConfig,
    private fileTemplateService: FileTemplateService) {
  }

  downloadFile(fileTemplate: TemplateContent) {
    const url = this.getDownloadUrl(fileTemplate.uri);
    window.open(url, '_blank');
  }

  private getDownloadUrl(uri: string): string {
    // Convert GitHub blob URL to raw download URL
    if (uri.includes('github.com') && uri.includes('/blob/')) {
      return uri.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    return uri;
  }

}
