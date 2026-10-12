import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { LandingComponent } from './components/landing/landing.component';
import { ImportCaseComponent } from './features/import-case';
import { FhirValidatorWrapperComponent } from './features/fhir-validator-wrapper/components/fhir-validator-wrapper/fhir-validator-wrapper.component';
import { SearchRecordsComponent } from './features/record-viewer/components/search-records/search-records.component';
import { ModuleHeaderConfig } from './providers/module-header-config';
import { AppConfiguration } from './providers/app-configuration';
import {
  RecordComparisonContentComponent
} from './features/record-comparison/components/record-comparison-content/record-comparison-content.component';
import { AdminPanelComponent, LoggedInComponent } from './features/user-management';
import {
  MdiToEdrsViewerComponent
} from './features/record-viewer/components/mdi-to-edrs-viewer/mdi-to-edrs-viewer.component';
import { OnboardingComponent } from './features/tests/components/onboarding/onboarding.component';
import {
  ToxToMdiViewerComponent
} from './features/record-viewer/components/tox-to-mdi-viewer/tox-to-mdi-viewer.component';
import { SearchEdrsComponent } from './features/tests/components/search-edrs/search-edrs.component';
import {
  StandaloneTestsComponent
} from './features/workflow-simulator/components/standalone-tests/standalone-tests.component';
import {
  TestingEventRootComponent
} from './features/testing-events/components/testing-event-root/testing-event-root.component';
import {
  EventRegistrationComponent
} from './features/testing-events/components/event-registration/event-registration.component';
import { authGuard } from './guards/auth.guard';
import { bluejayCredentialsGuard } from './guards/bluejay-credentials.guard';
import { SearchEdrsBluejayComponent } from './features/tests/components/search-edrs-bluejay/search-edrs-bluejay.component';
import { DcrViewerComponent } from './features/record-viewer/components/dcr-viewer/dcr-viewer.component';
import {
  DeathCertificateReviewSubmissionComponent
} from './features/tests/components/death-certificate-review-submission/death-certificate-review-submission.component';
import {
  ToxicologyRecordSubmissionComponent
} from './features/tests/components/toxicology-record-submission/toxicology-record-submission.component';
import { ConfigService } from './config/config.service';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    data: { moduleConfig: undefined, componentTitle: undefined }
  },
  { // Record Viewer Module
    path: AppConfiguration.config.modules['recordViewer'].route,
    children: [
      {
        pathMatch: 'full',
        path: '',
        component: SearchRecordsComponent,
        data: { moduleConfig: ModuleHeaderConfig.RecordViewer, componentTitle: 'Search Records' }
      },
      {
        path: 'mdi/:id',
        component: MdiToEdrsViewerComponent,
        data: { moduleConfig: ModuleHeaderConfig.RecordViewer, componentTitle: AppConfiguration.config.workflowTitles['mdiToEdrs'] + ' Viewer' }
      },
      {
        path: 'tox/:id',
        component: ToxToMdiViewerComponent,
        data: { moduleConfig: ModuleHeaderConfig.RecordViewer, componentTitle: AppConfiguration.config.workflowTitles['toxToMdi'] + ' Viewer' }
      },
      {
        path: 'dcr/:id',
        component: DcrViewerComponent,
        data: { moduleConfig: ModuleHeaderConfig.RecordViewer, componentTitle: AppConfiguration.config.workflowTitles['dcr'] + ' Viewer' }
      }
    ],
  },
  { // Record Comparison Module
    path: AppConfiguration.config.modules['recordComparison'].route,
    children: [
      {
        path: ':id',
        component: RecordComparisonContentComponent,
        data: { moduleConfig: ModuleHeaderConfig.RecordComparison, componentTitle: AppConfiguration.config.workflowTitles['mdiToEdrs'] + ' Comparison' }

      },
      {
        path: '',
        component: RecordComparisonContentComponent,
        data: { moduleConfig: ModuleHeaderConfig.RecordComparison, componentTitle: AppConfiguration.config.workflowTitles['mdiToEdrs'] + ' Comparison' }
      },
    ]
  },

  { // FHIR Validator Module
    path: AppConfiguration.config.modules['fhirValidator'].route,
    component: FhirValidatorWrapperComponent,
    data: { moduleConfig: ModuleHeaderConfig.FhirValidator, componentTitle: undefined }

  },
  { // Import Case Module
    path: AppConfiguration.config.modules['recordImport'].route,
    component: ImportCaseComponent,
    data: { moduleConfig: ModuleHeaderConfig.RecordImport, componentTitle: undefined }
  },
  { // Workflow Simulator Module
    path: AppConfiguration.config.modules['workflowSimulator'].route,
    children: [
      {
        path: '',
        component: StandaloneTestsComponent,
        data: { moduleConfig: ModuleHeaderConfig.WorkflowSimulator, componentTitle: undefined }
      },
      {
        path: 'onboarding',
        component: OnboardingComponent,
        data: { moduleConfig: ModuleHeaderConfig.WorkflowSimulator, componentTitle: 'Onboarding' }
      },
      {
        path: 'search-edrs',
        component: SearchEdrsComponent,
        data: { moduleConfig: ModuleHeaderConfig.WorkflowSimulator, componentTitle: 'Search EDRS' }
      },
      {
        path: 'search-edrs-bluejay',
        component: SearchEdrsBluejayComponent,
        canActivate: [bluejayCredentialsGuard],
        data: { moduleConfig: ModuleHeaderConfig.WorkflowSimulator, componentTitle: 'Search EDRS Bluejay' }
      },
      {
        path: 'dcr-submission',
        component: DeathCertificateReviewSubmissionComponent,
        data: { moduleConfig: ModuleHeaderConfig.WorkflowSimulator, componentTitle: 'Cremation Clearance Request Submission' }
      },
      {
        path: 'tox-submission',
        component: ToxicologyRecordSubmissionComponent,
        data: { moduleConfig: ModuleHeaderConfig.WorkflowSimulator, componentTitle: 'Toxicology Record Submission' }
      },
    ]
  },
  // Conditionally include dashboard API routes only when enableDashboardApiServices is true
  {
    path: AppConfiguration.config.modules['testingEvents'].route,
    component: TestingEventRootComponent,
    data: { moduleConfig: ModuleHeaderConfig.TestingEvents, componentTitle: undefined },
    canMatch: [() => inject(ConfigService).config()?.enableDashboardApiServices ?? false]
  },
  {
    path: AppConfiguration.config.modules['eventRegistration'].route,
    component: EventRegistrationComponent,
    data: { moduleConfig: ModuleHeaderConfig.EventRegistration, componentTitle: undefined },
    canMatch: [() => inject(ConfigService).config()?.enableDashboardApiServices ?? false]
  },
  {
    path: AppConfiguration.config.modules['adminPanel'].route,
    component: AdminPanelComponent,
    data: { moduleConfig: ModuleHeaderConfig.AdminPanel, componentTitle: undefined, role: 'admin' },
    canActivate: [authGuard],
    canMatch: [() => inject(ConfigService).config()?.enableDashboardApiServices ?? false]
  },
  {
    path: 'logged-in',
    component: LoggedInComponent,
    data: { moduleConfig: undefined, componentTitle: undefined },
  },
  { // Do not add any paths below this point, this path MUST ALWAYS be the last path!
    path: '**', redirectTo: ''
  }
];
