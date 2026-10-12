import {ChangeDetectorRef, Component, computed, effect, inject, input, Signal} from '@angular/core';

import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {SharedHttpWarningService} from "../../service/shared-http-warning.service";

@Component({
  selector: 'app-warning-message',
  imports: [
    MatIconButton,
    MatIcon,
  ],
  templateUrl: './warning-message.component.html',
  styleUrl: './warning-message.component.scss'
})
export class WarningMessageComponent {
  protected sharedHttpWarningService = inject(SharedHttpWarningService);
  readonly defaultWarningMessage = 'Warning Detected';

  protected readonly isVisible = this.sharedHttpWarningService.warningDetected;

  protected readonly warningMessage: Signal<string> = computed(() =>
    this.sharedHttpWarningService.warningMessage() || this.defaultWarningMessage
  );

  close() {
    this.sharedHttpWarningService.hideWarningComponent();
  }
}
