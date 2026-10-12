import * as Diff from 'diff';
import {DiffType} from './diff-type';
import {ObservationDiff} from './observation.diff';

export class ObservationHowDeathInjuryOccurredDiff extends ObservationDiff {
  placeOfInjury: DiffType;
  effectiveDateTime: DiffType;
  transportationRole: DiffType;
  injuryOccurredAtWork: DiffType;
  howDeathInjuryOccurred: DiffType;

  constructor(actual: any, expected: any) {
    super(actual, expected);

    this.style = null;
    this.placeOfInjury = new DiffType();
    this.effectiveDateTime = new DiffType();
    this.transportationRole = new DiffType();
    this.injuryOccurredAtWork = new DiffType();
    this.howDeathInjuryOccurred = new DiffType();

    this.doDiff();
  }

  override doDiff() {
    super.doDiff();

    // If parent detected missing resource, all fields are already marked invalid
    if (this.style === 'invalid') {
      return;
    }

    // TODO: Move codes to provider in MDI library.
    this.effectiveDateTime.expected = JSON.stringify(this.expected?.effectiveDateTime, null, 4);
    if (!this.effectiveDateTime.expected) {
      this.effectiveDateTime.expected = JSON.stringify(this.expected?._effectiveDateTime?.extension?.[0], null, 4);
    }
    this.howDeathInjuryOccurred.expected = JSON.stringify(this.expected?.valueCodeableConcept, null, 4);
    let expectedPlaceOfInjuryCode = this.expected?.component?.filter((item: any) => item?.code?.coding?.[0]?.code === "69450-5");
    this.placeOfInjury.expected = JSON.stringify(expectedPlaceOfInjuryCode?.[0]?.valueCodeableConcept, null, 4);
    let expectedInjuryOccurredAtWork = this.expected?.component?.filter((item: any) => item?.code?.coding?.[0]?.code === "69444-8");
    this.injuryOccurredAtWork.expected = JSON.stringify(expectedInjuryOccurredAtWork?.[0]?.valueCodeableConcept, null, 4);
    let expectedTransportationRole = this.expected.component.filter((item: any) => item?.code?.coding?.[0]?.code === "69451-3");
    this.transportationRole.expected = JSON.stringify(expectedTransportationRole?.[0]?.valueCodeableConcept, null, 4);

    this.effectiveDateTime.actual = JSON.stringify(this.actual?.effectiveDateTime, null, 4);
    if (!this.effectiveDateTime.actual) {
      this.effectiveDateTime.actual = JSON.stringify(this.actual?._effectiveDateTime?.extension[0], null, 4);
    }
    this.howDeathInjuryOccurred.actual = JSON.stringify(this.actual?.valueCodeableConcept, null, 4);
    let actualPlaceOfInjuryCode = this.actual.component.filter((item: any) => item?.code?.coding?.[0]?.code === "69450-5");
    this.placeOfInjury.actual = JSON.stringify(actualPlaceOfInjuryCode?.[0]?.valueCodeableConcept, null, 4);
    let actualInjuryOccurredAtWork = this.actual.component.filter((item: any) => item.code.coding[0].code === "69444-8");
    this.injuryOccurredAtWork.actual = JSON.stringify(actualInjuryOccurredAtWork?.[0]?.valueCodeableConcept, null, 4);
    let actualTransportationRole = this.actual.component.filter((item: any) => item?.code?.coding?.[0]?.code === "69451-3");
    this.transportationRole.actual = JSON.stringify(actualTransportationRole?.[0]?.valueCodeableConcept, null, 4);

    [this.effectiveDateTime.style, this.effectiveDateTime.difference] = DiffType.doDiff(Diff.diffChars(this.effectiveDateTime.expected || "", this.effectiveDateTime.actual || ""));
    [this.howDeathInjuryOccurred.style, this.howDeathInjuryOccurred.difference] = DiffType.doDiff(Diff.diffChars(this.howDeathInjuryOccurred.expected || "", this.howDeathInjuryOccurred.actual || ""));
    [this.placeOfInjury.style, this.placeOfInjury.difference] = DiffType.doDiff(Diff.diffChars(this.placeOfInjury.expected || "", this.placeOfInjury.actual || ""));
    [this.injuryOccurredAtWork.style, this.injuryOccurredAtWork.difference] = DiffType.doDiff(Diff.diffChars(this.injuryOccurredAtWork?.expected || "", this.injuryOccurredAtWork?.actual || ""));
    [this.transportationRole.style, this.transportationRole.difference] = DiffType.doDiff(Diff.diffChars(this.transportationRole?.expected || "", this.transportationRole?.actual || ""));
  }
}
