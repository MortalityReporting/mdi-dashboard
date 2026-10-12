import * as Diff from 'diff';
import {DiffType} from './diff-type';
import {markAllFieldsInvalid} from './base-diff.helper';

export class USCorePractitionerDiff {
    address: DiffType;
    id: DiffType;
    identifier: DiffType;
    meta: DiffType;
    name: DiffType;
    resourceType: DiffType;
    telecom: DiffType;

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
        this.identifier = new DiffType();
        this.meta = new DiffType();
        this.name = new DiffType();
        this.resourceType = new DiffType();
        this.telecom = new DiffType();

        this.doDiff();
    }

    doDiff()
    {
        // Check if one resource exists but the other doesn't
        if ((this.actual && !this.expected) || (!this.actual && this.expected)) {
            markAllFieldsInvalid(this);
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
            this.identifier.expected = JSON.stringify( this.expected.identifier, null, 4 );
            this.identifier.actual = JSON.stringify( this.actual.identifier, null, 4 );
            [this.identifier.style,this.identifier.difference] = DiffType.doDiff( Diff.diffChars( this.identifier.expected, this.identifier.actual ));
        } catch(e) {}

        try {
            this.meta.expected = JSON.stringify( this.expected.meta, null, 4 );
            this.meta.actual = JSON.stringify( this.actual.meta, null, 4 );
            [this.meta.style,this.meta.difference] = DiffType.doDiff( Diff.diffChars( this.meta.expected, this.meta.actual ));
        } catch(e) {}

        try {
            this.name.expected = JSON.stringify( this.expected.name, null, 4 );
            this.name.actual = JSON.stringify( this.actual.name, null, 4 );
            [this.name.style,this.name.difference] = DiffType.doDiff( Diff.diffChars( this.name.expected, this.name.actual ));
        } catch(e) {}

        try {
            this.resourceType.expected = JSON.stringify( this.expected.resourceType, null, 4 );
            this.resourceType.actual = JSON.stringify( this.actual.resourceType, null, 4 );
            [this.resourceType.style,this.resourceType.difference] = DiffType.doDiff( Diff.diffChars( this.resourceType.expected, this.resourceType.actual ));
        } catch(e) {}

        try {
            this.telecom.expected = JSON.stringify( this.expected.telecom, null, 4 );
            this.telecom.actual = JSON.stringify( this.actual.telecom, null, 4 );
            [this.telecom.style,this.telecom.difference] = DiffType.doDiff( Diff.diffChars( this.telecom.expected, this.telecom.actual ));
        } catch(e) {}
    }
}
