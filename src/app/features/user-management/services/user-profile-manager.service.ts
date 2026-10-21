import {Injectable} from '@angular/core';
import {Bundle, FhirClientService, FhirResource} from "../../fhir-util";
import {BehaviorSubject, catchError, filter, map, Observable, of, single, switchMap, throwError} from "rxjs";
import {UserProfile} from "../models/user-profile";

@Injectable({
  providedIn: 'root'
})
export class UserProfileManagerService {
  private currentUser = new BehaviorSubject<UserProfile>(undefined);
  currentUser$ = this.currentUser.asObservable();

  constructor(
    private fhirClient: FhirClientService) {
  }

  setCurrentUser(user: any): void {
    this.getOrCreateUserProfile(user)
      .pipe(
        filter((profile): profile is UserProfile => profile !== null),
        catchError(error => {
          console.error("Error retrieving the user profile resource", error);
          return throwError(() => error);
        })
      )
      .subscribe(profile => this.currentUser.next(profile));
  }

  private getOrCreateUserProfile(user: any): Observable<UserProfile | null> {
    return this.getUserProfile(user.email).pipe(
      switchMap(profile => {
          return profile ? of(profile) : this.createUserProfile(user.name, user.email)
        }
      )
    );
  }

  getAllUsers(): Observable<UserProfile[]> {
    return this.fhirClient.search("Practitioner", "?_profile=http://raven-user", true).pipe(
      map((results: FhirResource[] | Bundle) => {
        let users: UserProfile[] = [];
        (results as FhirResource[])?.map(
          (entry: any) => users.push(UserProfile.constructFromFHIR(entry))
        );
        return users;
      }));
  }

  getUserProfile(email: string): Observable<UserProfile | null> {
    return this.fhirClient.search("Practitioner", `?telecom=${email}`, true).pipe(
      map((results: FhirResource[] | Bundle) => {
        const first = this.firstResource(results);
        return first ? UserProfile.constructFromFHIR(first) : null;
      })
    );
  }

  private firstResource(results: FhirResource[] | Bundle | null | undefined): FhirResource | undefined {
    if (!results) {
      console.error("No user resource found in the Bundle.");
      throw new Error("No user resource found in the Bundle.");
    }
    if (Array.isArray(results)) {
      return results[0];
    }
    return results.entry?.[0]?.resource;
  }

  createUserProfile(name: string, email: string) {
    let userProfile = UserProfile.constructFromStrings(name, email);
    const fhirResource = userProfile.toFhirJSON();
    let request$ = this.fhirClient.create("Practitioner", fhirResource).pipe(
      map((result: FhirResource) => {
        // OperationOutcome is an application-level failure even when the HTTP request succeeded.
        if (!result || result.resourceType === "OperationOutcome") {
          console.error("FHIR server returned an OperationOutcome while creating a user profile.", result)
          throw new Error("FHIR server returned an OperationOutcome while creating a user profile.");
        }
        return UserProfile.constructFromFHIR(result);
      }))

    return request$;
  }

  checkIfUserEmailExists(email): Observable<boolean> {
    return this.fhirClient.search("Practitioner", `?telecom=${email}`, true).pipe(
      map((results: FhirResource[] | Bundle) => {
        return (results as FhirResource[])?.length !== 0
      }),
      single()
    );
  }

  getUserProfileImage(id: string) {
    return this.fhirClient.search("DocumentReference", `?subject=Practitioner/${id}`, true).pipe(
      map((results: FhirResource[] | Bundle) => {
        return (results as FhirResource[])?.length === 0 ? null :
          results[0]
      })
    )
  }
}
