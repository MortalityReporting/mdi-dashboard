import {Component, Inject, ChangeDetectionStrategy, computed} from '@angular/core';
import {Router} from "@angular/router";
import {Test} from "../../../tests";
import {ModuleHeaderConfig} from "../../../../providers/module-header-config";
import {UiStringConstants} from "../../../../providers/ui-string-constants";
import {AppConfiguration} from "../../../../providers/app-configuration";
import {ConfigService} from "../../../../config/config.service";
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/list';

@Component({
    selector: 'app-standalone-tests',
    templateUrl: './standalone-tests.component.html',
    styleUrls: ['./standalone-tests.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButton, MatDivider]
})
export class StandaloneTestsComponent {

  appConfiguration: any = AppConfiguration.config;

  protected readonly standaloneTests = computed(() => {
    const allTests = this.uiStringConstants.WORKFLOW_STANDALONE_TESTS;
    const config = this.configService.config();
    const hasSearchEdrsCredentials = !!config?.workflowSimulator?.searchEdrsOAuthCredentials;

    return allTests.filter(test => this.isTestAvailable(test, config, hasSearchEdrsCredentials));
  });

  private isTestAvailable(test: Test, config: any, hasSearchEdrsCredentials: boolean): boolean {
    // Tests require the service to be enabled
    if (test.name === 'onboarding' && !config.enableDashboardApiServices) {
      return false;
    }

    // Search EDRS test requires credentials
    if (test.name === 'search-edrs-bluejay' && !hasSearchEdrsCredentials) {
      return false;
    }
    return true;
  }

  constructor(
    @Inject('workflowSimulatorConfig') public config: ModuleHeaderConfig,
    private router: Router,
    private uiStringConstants: UiStringConstants,
    private configService: ConfigService,
  ) {}

  onStartTest(test: Test) {
    this.router.navigate([`/workflow-simulator/${test.route}`]);
  }
}
