import { Injectable, inject } from '@angular/core'
import {TestStatusCodes} from "../features/testing-events";
import {Test} from "../features/tests";
import {ConfigService} from "../config/config.service";

@Injectable()
export class UiStringConstants {

  private configService = inject(ConfigService);

  Common = {
    DECEDENT_NAME: `Decedent Name`,
    DATE_TIME_OF_DEATH: `Date/Time of death`,
    MDI_TRACKING_NUMBER: `MDI Tracking Number`,
    DECEDENT_FIRST_NAME: `Decedent First Name`,
    DECEDENT_LAST_NAME: `Decedent Last Name`,
    LEGAL_SEX_AT_DEATH: `Legal Sex at Death`,
    DISTRICT_OF_DEATH: `District of Death`,
  }

  //The workflow simulator shares some steps for the SEARCH_EDRS and SEARCH_EDRS_BLUEJAY Following are the step constants:

  private STEP_1_COMMON = {
    STEP_LABEL: `Select MDI to EDRS Document`,
    DESCRIPTION: `Step 1 - Select or Import an MDI to EDRS Document (Optional) If provided, the Document Bundle is used to populate the Search Parameters. Otherwise, the Search Parameters may be manually specified.`,
    TAB_LABEL_1: `Select MDI to EDRS Document`,
    TAB_LABEL_2: `Import MDI to EDRS FHIR Document Bundle`,
    INPUT_FILE_BTN: `Import MDI to EDRS FHIR Document Bundle`,
    SELECT_FILE_BTN: `Select File`,
    PROCEED_TO_NEXT_STEP_BTN: `Proceed to Configure Endpoint`,
    UPLOAD_JSON_CONTENT_MSG:`The data provided should be a valid FHIR MDI to EDRS Document Bundle. Please validate your resource prior to using it in the workflow simulator or unexpected behavior may occur.`,
    UPLOAD_FILE_CONTENT_MSG:`Click the "Input MDI to EDRS Document Bundle" button below to paste in your complete Document Bundle resource or click "Select File" to select a plain text (JSON) file from your local drive.`
  };

  private get STEP_2_SEARCH_EDRS_BLUEJAY() {
    const config = this.configService.config();
    return {
      STEP_LABEL: `Establish Authorization`,
      DESCRIPTION: `Step 2 - Establish Connection. The BlueJay test server is provided as a default.`,
      VIEW_CAPABILITY_STMT_BTN: `View Server Capability Statement`,
      VIEW_SERVER_$MDI_DOCS_OP_DEFINITION_BTN: `View Server $document Operation Definition`,
      PROCEED_TO_NEXT_STEP_BTN: `Establish Authorization`,
      authenticationOptions: ['None', 'Basic', 'Bearer Token'],
      endpointTypeOptions: ['Registered Endpoint', 'Custom Endpoint'],
      oAuthCredentials: config?.workflowSimulator?.searchEdrsOAuthCredentials
    };
  }

  private STEP2_SEARCH_EDRS = {
    STEP_LABEL: `Configure Endpoint`,
    DESCRIPTION: `Step 2 - Configure the EDRS endpoint. The BlueJay test server is provided as a default.`,
    DISCLAIMER: `Please be aware that for custom endpoint configuration users are responsible for all security considerations. Raven does not store any user information, though some web browsers may attempt to store sensitive data input into form fields.`,
    VIEW_CAPABILITY_STMT_BTN: `View Server Capability Statement`,
    VIEW_SERVER_$MDI_DOCS_OP_DEFINITION_BTN: `View Server $mdi-documents Operation Definition`,
    PROCEED_TO_NEXT_STEP_BTN: `Proceed to search`,
    authenticationOptions: ['None', 'Basic', 'Bearer Token'],
    endpointTypeOptions: ['Registered Endpoint', 'Custom Endpoint']
  };

  private STEP3_COMMON = {
    STEP_LABEL: `Search EDRS`,
    DESCRIPTION: `Step 3 - Set EDRS search parameters. Parameters may be automatically populated if a case was selected in Step #1. The parameter list is variable, defined by the FHIR Server's operation definition for EDRS searching. Search results are shown below. If any results were found, users may select a case and load a summary of the data.`,
    SEARCH_PARAMS_RESOURCE_PREVIEW: `Search Parameters Resource Preview`,
    RECORD_SUMMARY_INITIAL_DESCRIPTION: `Select a case from the results list to view summary here.`,
    RECORD_SUMMARY_TAB_LABEL: `Record Summary`,
    VIEW_FHIR_AS_MDI_DOCUMENT_TAB_LABEL: `View as FHIR MDI Document Bundle`
  }




  WorkflowSimulator = {
    // Landing page
    FEATURE_DESCRIPTION: `Select a testing workflow from the list below. You will walk through a series of steps to guide in testing of that workflow using the Raven platform, with demonstration of relevant FHIR Resources and API interactions.1`,
    EDRS_SEARCH_DESCRIPTION: `Description. (need to talk through wording with Myung, may be able to pull from test docs somewhat)`,

    searchEdrs: {
      // Step 1
      step1: this.STEP_1_COMMON,

      // Step 2
      step2: this.STEP2_SEARCH_EDRS,
      // Step 3
      step3: this.STEP3_COMMON
    },

    searchEdrsBlueJay: {
      // Step 1
      step1: this.STEP_1_COMMON,

      // Step 2
      step2: this.STEP_2_SEARCH_EDRS_BLUEJAY,
      // Step 3
      step3: this.STEP3_COMMON
    }
  }

  WORKFLOW_STANDALONE_TESTS : Test []= [
    {
      name: 'onboarding',
      display: 'Onboarding',
      description: "Onboarding module description",
      status: TestStatusCodes.notStarted,
      route: 'onboarding'
    },
    {
      name: 'search-edrs',
      display: 'Search EDRS',
      description: 'The "Search EDRS" workflow demonstrates searching for records in an Electronic Death Registration System (EDRS) ' +
        'using the MDI FHIR IG and associated API documentation.' +
        '\n\nTesters assume the role of Medical Examiners/Coroners (ME/Cs), executing a search against any compatible ' +
        'system implementing the MDI Documents FHIR Operation. Supported parameters include primary case identification ' +
        'fields and select decedent demographics information. As part of the demonstration, search parameters and all ' +
        'relevant HTTP requests/responses are provided in both human readable form as well as FHIR Resources.',
      status: TestStatusCodes.notStarted,
      route: 'search-edrs'
    },
    {
      name: 'search-edrs-bluejay',
      display: 'Search EDRS - BlueJay with OAuth 2.0',
      description: 'The "Search EDRS - BlueJay" workflow demonstrates searching for records in BlueJay, a stand-in for ' +
        'Electronic Death Registration Systems (EDRS), using the MDI FHIR IG and associated APIs. ' +
        '\n\nThis test is identical to the standard "Search EDRS" workflow while also demonstrating the use of ' +
        'OAuth 2.0 for client authorization.' ,
      status: TestStatusCodes.notStarted,
      route: 'search-edrs-bluejay'
    },
    {
      name: 'dcrSubmission',
      display: 'Cremation Clearance Request Submission',
      description: "Cremation Clearance, also known as \"cremation authorization,\" is often required by many states and jurisdictions. This is done to ensure that physical evidence is not needed for any further inquiries into the death. Our CCR workflow simulator provides an example of a form-based CCR request process, demonstrating how a funeral home submits a request to a case management system.",
      status: TestStatusCodes.notStarted,
      route: 'dcr-submission'
    },
    {
      name: 'toxRecordSubmission',
      display: 'Toxicology Record Submission',
      description: "The Toxicology Record Submission workflow simulation demonstrates the transfer of a toxicology report from a Laboratory Information Management System (LIMS) to a Coroner & Medical Examiner's Case Management System (CMS). In this simulation, the user provides the CMS toxicology receiving API endpoint URL, user credentials, and any required headers.",
      status: TestStatusCodes.notStarted,
      route: 'tox-submission'
    }
  ];

}

