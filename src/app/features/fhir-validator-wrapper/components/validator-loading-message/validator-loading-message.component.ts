import {Component, input} from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-validator-loading-message',
  imports: [MatIcon],
  templateUrl: './validator-loading-message.component.html',
  styleUrl: './validator-loading-message.component.css',
})
export class ValidatorLoadingMessageComponent {
  messageTxt = input<string>('The FHIR Validator is temporarily unavailable while loading implementation guides'); // default message
}
