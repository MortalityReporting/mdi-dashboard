import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedHttpWarningService {
  // Signals for warning state
  private warningDetectedSignal = signal<boolean>(false);
  private warningMessageSignal = signal<string>('');

  private readonly DEFAULT_WARNING_MESSAGE = 'Warning Detected';

  // Expose read-only signals
  readonly warningDetected = this.warningDetectedSignal.asReadonly();
  readonly warningMessage = this.warningMessageSignal.asReadonly();

  /**
   * Sets warning message
   * @param message - Warning message to display
   */
  setWarningMessage(message: string | null) {
    if (message) {
      this.warningDetectedSignal.set(true);
      this.warningMessageSignal.set(message);
    } else {
      this.warningMessageSignal.set('');
      this.warningDetectedSignal.set(false);
    }
  }

  hideWarningComponent() {
    this.setWarningMessage(null);
  }
}
