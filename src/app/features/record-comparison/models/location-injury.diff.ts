import {LocationDiff} from './location.diff';

export class LocationInjuryDiff extends LocationDiff {

    constructor( actual: any, expected: any )
    {
        super( actual, expected );

        this.style = null;

        this.doDiff();
    }

    override doDiff()
    {
        super.doDiff();
   }
}
