import * as Diff from 'diff';
import {DiffType} from './diff-type';
import {markFieldInvalid} from './base-diff.helper';

export class ObservationDiff {
    code: DiffType;
    id: DiffType;
    meta: DiffType;
    resourceType: DiffType;
    subject: DiffType;

    style: string;

    actual: any;
    expected: any;

    constructor( actual: any, expected: any )
    {
        this.actual = actual;
        this.expected = expected;

        this.style = null;
        this.code = new DiffType();
        this.id = new DiffType();
        this.meta = new DiffType();
        this.resourceType = new DiffType();
        this.subject = new DiffType();
    }

    /**
     * Helper method to mark all DiffType properties as invalid when a resource is missing
     */
    protected markAllFieldsInvalid(): void {
        this.style = 'invalid';

        // Iterate through all properties and mark DiffType instances as invalid
        Object.keys(this).forEach(key => {
            const value = (this as any)[key];
            if (value instanceof DiffType) {
                markFieldInvalid(this, value, key);
            }
        });
    }

    doDiff()
    {
        // Check if one resource exists but the other doesn't
        if ((this.actual && !this.expected) || (!this.actual && this.expected)) {
            this.markAllFieldsInvalid();
            return;
        }

        try {
            this.code.expected = JSON.stringify( this.expected.code, null, 4 );
            this.code.actual = JSON.stringify( this.actual.code, null, 4 );
            [this.code.style,this.code.difference] = DiffType.doDiff( Diff.diffChars( this.code.expected, this.code.actual ));
        } catch(e) {}

        try {
            this.id.expected = JSON.stringify( this.expected.id, null, 4 );
            this.id.actual = JSON.stringify( this.actual.id, null, 4 );
            [this.id.style,this.id.difference] = DiffType.doDiff( Diff.diffChars( this.id.expected, this.id.actual ));
        } catch(e) {}

        try {
            this.meta.expected = JSON.stringify( this.expected.meta, null, 4 );
            this.meta.actual = JSON.stringify( this.actual.meta, null, 4 );
            [this.meta.style,this.meta.difference] = DiffType.doDiff( Diff.diffChars( this.meta.expected, this.meta.actual ));
        } catch(e) {}

        try {
            this.resourceType.expected = JSON.stringify( this.expected.resourceType, null, 4 );
            this.resourceType.actual = JSON.stringify( this.actual.resourceType, null, 4 );
            [this.resourceType.style,this.resourceType.difference] = DiffType.doDiff( Diff.diffChars( this.resourceType.expected, this.resourceType.actual ));
        } catch(e) {}

        try {
            this.subject.expected = JSON.stringify( this.expected.subject, null, 4 );
            this.subject.actual = JSON.stringify( this.actual.subject, null, 4 );
            [this.subject.style,this.subject.difference] = DiffType.doDiff( Diff.diffChars( this.subject.expected, this.subject.actual ));
        } catch(e) {}
    }
}
