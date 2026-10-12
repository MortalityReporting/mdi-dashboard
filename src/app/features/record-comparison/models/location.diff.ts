import * as Diff from 'diff';
import {DiffType} from './diff-type';
import {markFieldInvalid} from './base-diff.helper';

export class LocationDiff {
    address: DiffType;
    id: DiffType;
    meta: DiffType;
    name: DiffType;
    resourceType: DiffType;
    type: DiffType;

    style: string;

    actual: any;
    expected: any;

    constructor( actual: any, expected: any )
    {
        this.actual = actual;
        this.expected = expected;

        this.style = null;
        this.address = new DiffType();
        this.id = new DiffType();
        this.meta = new DiffType();
        this.name = new DiffType();
        this.resourceType = new DiffType();
        this.type = new DiffType();

        // Don't call doDiff() here - let child classes call it after they initialize their properties
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
            this.address.expected = JSON.stringify( this.expected.address, null, 4 );
            this.address.actual = JSON.stringify( this.actual.address, null, 4 );
            [this.address.style,this.address.difference] = DiffType.doDiff( Diff.diffChars( this.address.expected, this.address.actual ));
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
            this.name.expected = this.expected.name;
            this.name.actual = this.actual.name;
            [this.name.style,this.name.difference] = DiffType.doDiff( Diff.diffChars( this.name.expected, this.name.actual ));
        } catch(e) {}

        try {
            this.resourceType.expected = JSON.stringify( this.expected.resourceType, null, 4 );
            this.resourceType.actual = JSON.stringify( this.actual.resourceType, null, 4 );
            [this.resourceType.style,this.resourceType.difference] = DiffType.doDiff( Diff.diffChars( this.resourceType.expected, this.resourceType.actual ));
        } catch(e) {}

        try {
            this.type.expected = JSON.stringify( this.expected.type, null, 4 );
            this.type.actual = JSON.stringify( this.actual.type, null, 4 );
            [this.type.style,this.type.difference] = DiffType.doDiff( Diff.diffChars( this.type.expected, this.type.actual ));
        } catch(e) {}
    }
}
