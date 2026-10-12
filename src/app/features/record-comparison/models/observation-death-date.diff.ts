import * as Diff from 'diff';
import {DiffType} from './diff-type';
import {ObservationDiff} from './observation.diff';
import {FhirHelperService} from "../../fhir-util";

export class ObservationDeathDateDiff extends ObservationDiff {
    //effectiveDateTime: DiffType;
    method: DiffType;
    pronouncedDateTime: DiffType;
    status: DiffType;
    typeOfDeathLocation: DiffType;
    valueDateTime: DiffType;

    fhirHelper: FhirHelperService

    constructor(
        actual: any,
        expected: any,
        fhirHelper: FhirHelperService
        )
    {
        super( actual, expected );

        this.fhirHelper = fhirHelper;
        //this.effectiveDateTime = new DiffType();
        this.method = new DiffType();
        this.pronouncedDateTime = new DiffType();
        this.status = new DiffType();
        this.typeOfDeathLocation = new DiffType();
        this.valueDateTime = new DiffType();

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
            let expectedComponent = this.fhirHelper.findObservationComponentByCode(this.expected, "80616-6");
            this.pronouncedDateTime.expected = expectedComponent.valueDateTime;

            let actualComponent = this.fhirHelper.findObservationComponentByCode(this.actual, "80616-6");
            this.pronouncedDateTime.actual = actualComponent.valueDateTime;

            [this.pronouncedDateTime.style,this.pronouncedDateTime.difference] = DiffType.doDiff( Diff.diffChars( this.pronouncedDateTime.expected, this.pronouncedDateTime.actual ));
        } catch(e) {}

        try {
            let expectedComponent = this.fhirHelper.findObservationComponentByCode(this.expected, "58332-8");
            this.typeOfDeathLocation.expected = JSON.stringify( expectedComponent.valueCodeableConcept, null, 4 );

            let actualComponent = this.fhirHelper.findObservationComponentByCode(this.actual, "58332-8");
            this.typeOfDeathLocation.actual = JSON.stringify( actualComponent.valueCodeableConcept, null, 4 );

            [this.typeOfDeathLocation.style,this.typeOfDeathLocation.difference] = DiffType.doDiff( Diff.diffChars( this.typeOfDeathLocation.expected, this.typeOfDeathLocation.actual ));
        } catch(e) {}

        try {
            this.method.expected = JSON.stringify( this.expected.method, null, 4 );
            this.method.actual = JSON.stringify( this.actual.method, null, 4 );
            [this.method.style,this.method.difference] = DiffType.doDiff( Diff.diffChars( this.method.expected, this.method.actual ));
        } catch(e) {}

        try {
            this.status.expected = JSON.stringify( this.expected.status, null, 4 );
            this.status.actual = JSON.stringify( this.actual.status, null, 4 );
            [this.status.style,this.status.difference] = DiffType.doDiff( Diff.diffChars( this.status.expected, this.status.actual ));
        } catch(e) {}

        // try {
        //     this.effectiveDateTime.expected = this.expected.effectiveDateTime ;
        //     this.effectiveDateTime.actual = this.actual.effectiveDateTime;
        //     [this.effectiveDateTime.style,this.effectiveDateTime.difference] = DiffType.doDiff( Diff.diffChars( this.effectiveDateTime.expected, this.effectiveDateTime.actual ));
        // } catch(e) {}

        try {
            this.valueDateTime.expected = JSON.stringify( this.expected.valueDateTime, null, 4 );
            this.valueDateTime.actual = JSON.stringify( this.actual.valueDateTime, null, 4 );
            [this.valueDateTime.style,this.valueDateTime.difference] = DiffType.doDiff( Diff.diffChars( this.valueDateTime.expected, this.valueDateTime.actual ));
        } catch(e) {}
    }
}
