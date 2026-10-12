import { Provider, inject, provideAppInitializer, EnvironmentProviders } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ConfigService } from '../../config/config.service';
import { ModuleHeaderConfig } from '../../providers/module-header-config';

/**
 * Initializes SVG icons for the Record Viewer module.
 */
function initializeRecordViewerIcons(): void {
  const matIconRegistry = inject(MatIconRegistry);
  const domSanitizer = inject(DomSanitizer);
  const path = "assets/files/svg";

  matIconRegistry.addSvgIcon("labs", domSanitizer
    .bypassSecurityTrustResourceUrl(`${path}/labs.svg`));
  matIconRegistry.addSvgIcon("lab_panel", domSanitizer
    .bypassSecurityTrustResourceUrl(`${path}/lab_panel.svg`));
  matIconRegistry.addSvgIcon("clinical_notes", domSanitizer
    .bypassSecurityTrustResourceUrl(`${path}/clinical_notes.svg`));
}

/**
 * Provides configuration and services for the Record Viewer module.
 * Replaces the RecordViewerModule.forRoot() pattern with a modern provider function.
 */
export function provideRecordViewer(config: ModuleHeaderConfig, appConfig: any, fhirProfiles: any): (Provider | EnvironmentProviders)[] {
  return [
    ConfigService,
    {
      provide: 'config',
      useValue: config
    },
    {
      provide: 'appConfig',
      useValue: appConfig
    },
    {
      provide: 'fhirProfiles',
      useValue: fhirProfiles
    },
    provideNativeDateAdapter(),
    provideAppInitializer(initializeRecordViewerIcons)
  ];
}
