import {Component, Inject, Input, OnDestroy, OnInit, signal, computed, ChangeDetectionStrategy} from '@angular/core';
import {SearchEdrsService} from "../../../services/search-edrs.service";
import {DecedentSimpleInfo} from "../../../../../model/decedent-simple-info";
import {ModuleHeaderConfig} from "../../../../../model/model-header-config";
import {UiStringConstants} from "../../../../../providers/ui-string-constants";
import { Clipboard, CdkCopyToClipboard } from '@angular/cdk/clipboard';
import {AccessTokenService} from "../../../services/access-token.service";
import { MatStepper, MatStepperPrevious } from "@angular/material/stepper";
import { DecedentBasicInfoComponent } from '../../search-edrs/decedent-basic-info/decedent-basic-info.component';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatError } from '@angular/material/input';

@Component({
    selector: 'app-establish-connection',
    templateUrl: './establish-connection.component.html',
    styleUrl: './establish-connection.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DecedentBasicInfoComponent, MatCard, MatCardContent, MatTabGroup, MatTab, MatTooltip, MatIcon, MatButton, MatIconButton, CdkCopyToClipboard, MatStepperPrevious, MatError]
})
export class EstablishConnectionComponent implements OnInit, OnDestroy {

  uiConstantsStep2: any;
  @Input('parentStepper') parentStepper: MatStepper;

  protected readonly curlExample = computed(() => {
    const creds = this.uiConstantsStep2?.oAuthCredentials;
    if (!creds) return { display: '', value: '' };

    // Build the data object conditionally
    const dataObj: any = {
      client_id: creds.clientId,
      client_secret: creds.clientSecret
    };

    // Only add audience if it exists and is not empty
    if (creds.audience) {
      dataObj.audience = creds.audience;
    }

    dataObj.grant_type = creds.grantType;

    const dataString = JSON.stringify(dataObj);

    const display = `curl \t--request POST\n\t--url ${creds.accessTokenUrl}\n\t--header 'content-type: application/json'\n\t--data '${dataString}'`;

    const value = `curl --request POST   --url ${creds.accessTokenUrl}   --header 'content-type: application/json'   --data '${dataString}'`;

    return { display, value };
  });

  constructor(
    @Inject('workflowSimulatorConfig') public moduleConfig: ModuleHeaderConfig,
    private searchEdrsService: SearchEdrsService,
    private clipboard: Clipboard,
    uiStringConstants: UiStringConstants,
    private accessTokenService: AccessTokenService
  ) {
    this.uiConstantsStep2 = uiStringConstants.WorkflowSimulator.searchEdrsBlueJay.step2;
  }

  decedentInfo: DecedentSimpleInfo;
  bearerToken = signal<string>('');

  ngOnInit(): void {
    this.searchEdrsService.decedentData$.subscribe({
      next: value => {
        this.decedentInfo = value;
      }
    });
  }

  protected readonly JSON = JSON;
  errorMessage: string;

  onCopyToClipboard(value: string) {
    this.clipboard.copy(value.trim())
  }

  onRequestAuth0Token(){
    this.errorMessage = '';
    this.accessTokenService.getAccessToken().subscribe({
      next: value => {this.bearerToken.set(value);}
    })
  }

  ngOnDestroy(): void {
    this.accessTokenService.setAccessTokenValue(null);
  }

  onProceed(){
    if(this.bearerToken()){
      this.parentStepper.next();
    }
    else{
      this.errorMessage = 'Request authorization token to proceed.';
    }
  }
}
