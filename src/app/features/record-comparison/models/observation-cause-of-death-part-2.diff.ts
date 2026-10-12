import * as Diff from 'diff';
import {DiffType} from './diff-type';
import {ObservationDiff} from './observation.diff';

export class ObservationCauseOfDeathPart2Diff extends ObservationDiff {
    performer: DiffType;
    valueCodeableConcept: DiffType;

    constructor( actual: any, expected: any )
    {
        super( actual, expected );

        this.performer = new DiffType();
        this.valueCodeableConcept = new DiffType();

        this.doDiff();
    }

    override doDiff()
    {
        super.doDiff();

        // If parent detected missing resource, all fields are already marked invalid
        if (this.style === 'invalid') {
            return;
        }

        try {
            this.performer.expected = JSON.stringify( this.expected.performer, null, 4 );
            this.performer.actual = JSON.stringify( this.actual.performer, null, 4 );
            [this.performer.style,this.performer.difference] = DiffType.doDiff( Diff.diffChars( this.performer.expected, this.performer.actual ));
        } catch(e) {}

        try {
            this.valueCodeableConcept.expected = JSON.stringify( this.expected.valueCodeableConcept, null, 4 );
            this.valueCodeableConcept.actual = JSON.stringify( this.actual.valueCodeableConcept, null, 4 );
            [this.valueCodeableConcept.style,this.valueCodeableConcept.difference] = DiffType.doDiff( Diff.diffChars( this.valueCodeableConcept.expected, this.valueCodeableConcept.actual ));
        } catch(e) {}
    }
}
