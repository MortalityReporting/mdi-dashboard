import * as Diff from 'diff';
import {DiffType} from './diff-type';
import {ObservationDiff} from './observation.diff';

export class ObservationAutopsyPerformedDiff extends ObservationDiff {
    componentValueCodeableConcept: DiffType;
    status: DiffType;
    valueCodeableConcept: DiffType;

    constructor( actual: any, expected: any )
    {
        super( actual, expected );

        this.style = null;
        this.componentValueCodeableConcept = new DiffType();
        this.status = new DiffType();
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
            this.componentValueCodeableConcept.expected = JSON.stringify( this.expected.component[0].valueCodeableConcept, null, 4 );
            this.componentValueCodeableConcept.actual = JSON.stringify( this.actual.component[0].valueCodeableConcept, null, 4 );
            [this.componentValueCodeableConcept.style,this.componentValueCodeableConcept.difference] = DiffType.doDiff( Diff.diffChars( this.componentValueCodeableConcept.expected, this.componentValueCodeableConcept.actual ));
        } catch(e) {}

        try {
            this.status.expected = JSON.stringify( this.expected.status, null, 4 );
            this.status.actual = JSON.stringify( this.actual.status, null, 4 );
            [this.status.style,this.status.difference] = DiffType.doDiff( Diff.diffChars( this.status.expected, this.status.actual ));
        } catch(e) {}

        try {
            this.valueCodeableConcept.expected = JSON.stringify( this.expected.valueCodeableConcept, null, 4 );
            this.valueCodeableConcept.actual = JSON.stringify( this.actual.valueCodeableConcept, null, 4 );
            [this.valueCodeableConcept.style,this.valueCodeableConcept.difference] = DiffType.doDiff( Diff.diffChars( this.valueCodeableConcept.expected, this.valueCodeableConcept.actual ));
        } catch(e) {}
    }
}
