import {Inject, Injectable} from '@angular/core';
import {CompositionMdiToEdrsDiff} from "../models/composition-mdi-to-edrs.diff";
import {USCoreLocationDiff} from "../models/us-core-location.diff";
import {ObservationTobaccoUseDiff} from "../models/observation-tobacco-use.diff";
import {ObservationDecedentPregnancyDiff} from "../models/observation-decedent-pregnancy.diff";
import {ObservationDeathDateDiff} from "../models/observation-death-date.diff";
import {ObservationCauseOfDeathPart1Diff} from "../models/observation-cause-of-death-part-1.diff";
import {ObservationCauseOfDeathPart2Diff} from "../models/observation-cause-of-death-part-2.diff";
import {ObservationMannerOfDeathDiff} from "../models/observation-manner-of-death.diff";
import {LocationDeathDiff} from "../models/location-death.diff";
import {LocationInjuryDiff} from "../models/location-injury.diff";
import {USCorePatientDiff} from "../models/us-core-patient.diff";
import {USCorePractitionerDiff} from "../models/us-core-practitioner.diff";
import {ObservationAutopsyPerformedDiff} from "../models/observation-autopsy-performed.diff";
import {ObservationHowDeathInjuryOccurredDiff} from "../models/observation-how-death-injury-occurred.diff";
import {BundleHelperService} from "../../fhir-util";
import {Difference} from "../models/difference";
import {FhirHelperService} from "../../fhir-util";
import {FHIRProfileConstants} from "../../../providers/fhir-profile-constants";

@Injectable({
  providedIn: 'root'
})
export class ComparisonService {

  constructor(
    private bundleHelper: BundleHelperService,
    private fhirHelper: FhirHelperService,
    @Inject('fhirProfiles') public fhirProfiles: FHIRProfileConstants
  ) { }



  doDiff(userDocument: any, referenceDocument: any): Difference {
    let difference = new Difference();
    try {
      difference.mdiToEdrs = new CompositionMdiToEdrsDiff(
        this.bundleHelper.findResourceByProfileName(userDocument, this.fhirProfiles.MdiToEdrs.Comp_MDItoEDRS ),
        this.bundleHelper.findResourceByProfileName(referenceDocument, this.fhirProfiles.MdiToEdrs.Comp_MDItoEDRS)
      );

      difference.location = new USCoreLocationDiff(
        this.bundleHelper.findResourceByProfileName(userDocument, this.fhirProfiles.USCore.USCoreLocation),
        this.bundleHelper.findResourceByProfileName(referenceDocument, this.fhirProfiles.USCore.USCoreLocation)
      );

      difference.tobaccoUse = new ObservationTobaccoUseDiff(
        this.bundleHelper.findResourceByProfileName(userDocument, this.fhirProfiles.VRDR.Obs_TobaccoUseContributedToDeath),
        this.bundleHelper.findResourceByProfileName(referenceDocument, this.fhirProfiles.VRDR.Obs_TobaccoUseContributedToDeath)
      );

      difference.pregnancy = new ObservationDecedentPregnancyDiff(
        this.bundleHelper.findResourceByProfileName(userDocument, this.fhirProfiles.VRDR.Obs_DecedentPregnancyStatus ),
        this.bundleHelper.findResourceByProfileName(referenceDocument, this.fhirProfiles.VRDR.Obs_DecedentPregnancyStatus )
      );

      difference.deathDate = new ObservationDeathDateDiff(
        this.bundleHelper.findResourceByProfileName(userDocument, this.fhirProfiles.VRDR.Obs_DeathDate ),
        this.bundleHelper.findResourceByProfileName(referenceDocument, this.fhirProfiles.VRDR.Obs_DeathDate ),
        this.fhirHelper
      );

      difference.causeOfDeath1List = [];
      let actualCauseOfDeath1List = this.bundleHelper.findResourcesByProfileName(userDocument, this.fhirProfiles.MdiToEdrs.Obs_CauseOfDeathPart1);
      let expectedCauseOfDeath1List = this.bundleHelper.findResourcesByProfileName(referenceDocument, this.fhirProfiles.MdiToEdrs.Obs_CauseOfDeathPart1);

      difference.causeAndMannerStatus = 'valid';

      if (expectedCauseOfDeath1List != undefined) {
        expectedCauseOfDeath1List.map((item: any, i) => {
          let causeOfDeath1 = undefined;
          if (actualCauseOfDeath1List != undefined && actualCauseOfDeath1List.length > i) {
            causeOfDeath1 = new ObservationCauseOfDeathPart1Diff( actualCauseOfDeath1List[i], expectedCauseOfDeath1List[i], this.fhirHelper );
          } else {
            causeOfDeath1 = new ObservationCauseOfDeathPart1Diff( null, expectedCauseOfDeath1List[i], this.fhirHelper);
          }
          difference.causeOfDeath1List.push( causeOfDeath1 );
          if (causeOfDeath1.valueCodeableConcept.style === 'invalid')
          {
            difference.causeAndMannerStatus = 'invalid';
          }
          if (causeOfDeath1.valueString.style === 'invalid')
          {
            difference.causeAndMannerStatus = 'invalid';
          }
        })
      }

      difference.causeOfDeath2 = new ObservationCauseOfDeathPart2Diff(
        this.bundleHelper.findResourceByProfileName( userDocument, this.fhirProfiles.VRDR.Obs_CauseOfDeathPart2 ),
        this.bundleHelper.findResourceByProfileName( referenceDocument, this.fhirProfiles.VRDR.Obs_CauseOfDeathPart2 ));

      difference.mannerOfDeath = new ObservationMannerOfDeathDiff(
        this.bundleHelper.findResourceByProfileName( userDocument, this.fhirProfiles.VRDR.Obs_MannerOfDeath ),
        this.bundleHelper.findResourceByProfileName( referenceDocument, this.fhirProfiles.VRDR.Obs_MannerOfDeath ));

      difference.locationDeath = new LocationDeathDiff(
        this.bundleHelper.findResourceByProfileName( userDocument, this.fhirProfiles.VRDR.Loc_DeathLocation ),
        this.bundleHelper.findResourceByProfileName( referenceDocument, this.fhirProfiles.VRDR.Loc_DeathLocation));

      difference.locationInjury = new LocationInjuryDiff(
        this.bundleHelper.findResourceByProfileName( userDocument, this.fhirProfiles.VRDR.Loc_InjuryLocation ),
        this.bundleHelper.findResourceByProfileName( referenceDocument, this.fhirProfiles.VRDR.Loc_InjuryLocation ));

      difference.patient = new USCorePatientDiff(
        this.bundleHelper.findResourceByProfileName( userDocument, this.fhirProfiles.USCore.USCorePatient ),
        this.bundleHelper.findResourceByProfileName( referenceDocument, this.fhirProfiles.USCore.USCorePatient ));

      difference.practitioner = new USCorePractitionerDiff(
        this.bundleHelper.findResourceByProfileName(userDocument, this.fhirProfiles.USCore.USCorePractitioner) ||
        this.bundleHelper.findResourceByProfileName(userDocument, this.fhirProfiles.VRCL.Practitioner_VR),
        this.bundleHelper.findResourceByProfileName(referenceDocument, this.fhirProfiles.USCore.USCorePractitioner) ||
        this.bundleHelper.findResourceByProfileName(referenceDocument, this.fhirProfiles.VRCL.Practitioner_VR));

      difference.autopsyPerformed = new ObservationAutopsyPerformedDiff(
        this.bundleHelper.findResourceByProfileName( userDocument, this.fhirProfiles.VRCL.Obs_AutopsyPerformed ),
        this.bundleHelper.findResourceByProfileName( referenceDocument, this.fhirProfiles.VRCL.Obs_AutopsyPerformed ));

      difference.howDeathOccurred = new ObservationHowDeathInjuryOccurredDiff(
        this.bundleHelper.findResourceByProfileName( userDocument, this.fhirProfiles.VRDR.Obs_InjuryIncident ),
        this.bundleHelper.findResourceByProfileName( referenceDocument, this.fhirProfiles.VRDR.Obs_InjuryIncident ));

      difference.caseAdminInfoStatus = (
        difference.mdiToEdrs?.extension?.style !== 'invalid' &&
        difference.practitioner?.name?.style !== 'invalid' &&
        difference.practitioner?.identifier?.style !== 'invalid' &&
        difference.practitioner?.telecom?.style !== 'invalid' &&
        difference.practitioner?.address?.style !== 'invalid'
      ) ? 'valid' : 'invalid';

      difference.demographicsStatus = (
        difference.patient?.name?.style !== 'invalid' &&
        difference.patient?.gender?.style !== 'invalid' &&
        difference.patient?.identifier?.style !== 'invalid' &&
        difference.patient?.birthDate?.style !== 'invalid' &&
        difference.patient?.ethnicity?.style !== 'invalid' &&
        difference.patient?.race?.style !== 'invalid' &&
        difference.patient?.address?.style !== 'invalid'
      ) ? 'valid' : 'invalid';

      difference.circumstancesStatus = (
        difference.locationDeath?.name?.style !== 'invalid' &&
        difference.locationInjury?.name?.style !== 'invalid' &&
        difference.tobaccoUse?.valueCodeableConcept?.style !== 'invalid' &&
        difference.pregnancy?.valueCodeableConcept?.style !== 'invalid'
      ) ? 'valid' : 'invalid';

      difference.jurisdictionStatus = (
        difference.deathDate?.pronouncedDateTime?.style !== 'invalid' &&
        difference.deathDate?.valueDateTime?.style !== 'invalid' &&
        difference.deathDate?.method?.style !== 'invalid'
      ) ? 'valid' : 'invalid';

      difference.examAndAutopsyStatus = (
        difference.autopsyPerformed?.valueCodeableConcept?.style !== 'invalid' &&
        difference.autopsyPerformed?.componentValueCodeableConcept?.style !== 'invalid'
      ) ? 'valid' : 'invalid';

      difference.causeAndMannerStatus = (
        difference.causeAndMannerStatus === 'valid' &&
        difference.howDeathOccurred?.placeOfInjury?.style !== 'invalid' &&
        difference.howDeathOccurred?.howDeathInjuryOccurred?.style !== 'invalid' &&
        difference.howDeathOccurred?.effectiveDateTime?.style !== 'invalid' &&
        difference.howDeathOccurred?.injuryOccurredAtWork?.style !== 'invalid' &&
        difference.howDeathOccurred?.transportationRole?.style !== 'invalid'
      ) ? 'valid' : 'invalid';

      if (difference.causeOfDeath2?.valueCodeableConcept?.style === 'invalid' )
      {
        difference.causeAndMannerStatus = 'invalid';
      }

      if (difference.mannerOfDeath?.valueCodeableConcept?.style === 'invalid' )
      {
        difference.causeAndMannerStatus = 'invalid';
      }

    } catch(e) {
      console.error(e);
    }
    return difference;
  }



}
