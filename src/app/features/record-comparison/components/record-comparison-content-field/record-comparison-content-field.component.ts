import {Component, input, computed, effect, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from "@angular/material/expansion";
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';

@Component({
    selector: 'record-comparison-content-field',
    templateUrl: './record-comparison-content-field.component.html',
    styleUrls: ['./record-comparison-content-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatIcon, NgClass]
})
export class RecordComparisonContentFieldComponent {
  readonly state = input<string>('');
  readonly title = input<string>('');
  readonly resource = input<string>('');
  readonly fhirPath = input<string>('');
  readonly actual = input<string>('');
  readonly expected = input<string>('');
  readonly difference = input<string>('');
  readonly expanded = input<boolean>(false);

  @ViewChild(MatExpansionPanel) matExpansionPanel: MatExpansionPanel;

  /**
   * Computed signal that checks if the difference HTML contains actual content
   */
  protected readonly differenceHasContents = computed(() => {
    const diff = this.difference();
    if (!diff) return false;

    // Create a temporary element to parse HTML and extract text content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = diff;
    const textContent = tempDiv.textContent?.trim() || '';

    // Check if there's meaningful text content (not just whitespace)
    return textContent.length > 0;
  });

  constructor() {
    // Effect to close panel when expanded input changes to false
    effect(() => {
      if (this.expanded() === false && this.matExpansionPanel?.expanded) {
        this.matExpansionPanel.close();
      }
    });
  }
}
