import {Component, input} from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-validator-loading-message',
  imports: [MatIcon],
  templateUrl: './validator-loading-message.component.html',
  styleUrl: './validator-loading-message.component.css',
})
export class ValidatorLoadingMessageComponent {
  messageTxt = input<string>('The FHIR validator is loading. Please wait while its implementation guides are prepared'); // default message
}
