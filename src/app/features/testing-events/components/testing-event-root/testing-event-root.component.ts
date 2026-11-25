import {Component, Inject, OnDestroy, OnInit, signal, ChangeDetectionStrategy, inject} from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";
import {
  combineLatest,
  mergeMap,
  Observable,
  ReplaySubject,
  share,
  skipWhile,
  switchMap
} from "rxjs";
import {UserProfileManagerService} from "../../../user-management";
import {ModuleHeaderConfig} from "../../../../providers/module-header-config";
import {EventModule} from "../../models/event-module";
import {EventManagerService} from "../../services/event-manager.service";
import {Registration} from "../../models/registration";
import {UserProfile} from "../../../user-management/models/user-profile";
import {RegistrationDisplayItem} from "../../models/registration-display";
import {UtilsService} from "../../../../service/utils.service";
import { Router, RouterLink } from "@angular/router";
import {UpdateAction} from "../../models/update-action";
import {AppConfiguration} from "../../../../providers/app-configuration";
import {MatDialog} from "@angular/material/dialog";
import { MatDivider } from '@angular/material/list';
import { RegisteredModuleComponent } from '../registered-module/registered-module.component';
import { TestContainerComponent } from '../test-container/test-container.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import {ConfigService} from "../../../../config/config.service";

@Component({
    selector: 'testing-event-root',
    templateUrl: './testing-event-root.component.html',
    styleUrls: ['../testing-event.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatDivider, RegisteredModuleComponent, TestContainerComponent, MatButton, MatIcon, RouterLink, AsyncPipe]
})
export class TestingEventRootComponent implements OnInit, OnDestroy {
  // Registrations/QuestionnaireResponses
  registrations = signal<Registration[]>([]);

  protected configService = inject(ConfigService);

  currentRegistration: Registration = undefined;
  currentIndex: number = -2;
  currentItem: RegistrationDisplayItem;
  appConfiguration: any = AppConfiguration.config;

  // Event Modules/Questionnaires
  eventList: EventModule[];

  // User's ID for subject reference.
  userFhirId: string;

  // Component Controllers
  refreshTrigger$ = new ReplaySubject(1);
  events$: Observable<EventModule[]>;
  user$: Observable<UserProfile>;
  showRoot: boolean = true;

  constructor(@Inject('workflowSimulatorConfig')
              public headerConfig: ModuleHeaderConfig,
              public auth: AuthService,
              protected eventManager: EventManagerService,
              private userProfileManager: UserProfileManagerService,
              private utilsService: UtilsService,
              private router: Router,
              protected dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    // Subscribe to the currently selected registration. (Not set initially, updated on user selection.)
    this.eventManager.currentRegistration$.subscribe({
      next: (value: Registration) => {
        this.currentRegistration = value;
      }
    });

    // Get all events and user observables.
    this.events$ = this.eventManager.getAllEvents();
    this.user$ = this.userProfileManager.currentUser$;

    // Get all registrations for the current user after Events$ and Users$ return data.
    let registrations$ = this.refreshTrigger$.pipe(
      switchMap(() => this.fetchData()),
      share()
    );

    // Initial call to "refresh".
    this.refreshTrigger$.next(1);

    registrations$.subscribe({
        next: (registrations: Registration[]) => {
          this.registrations.set(registrations);
        }
      });


    // TODO: Session Storage needs to be refactored to align with observable
    // const currentIndex = sessionStorage.getItem('index');
    // if(currentIndex){
    //   const index = parseInt(currentIndex);
    //   console.log(index)
    //   this.selectEvent(index);
    // }
  }

  fetchData(): Observable<any> {
    return combineLatest([this.events$, this.user$]).pipe(
      skipWhile(combinedResults => combinedResults.some(result => result === undefined)),
      mergeMap(combinedResults => {
          const events = combinedResults[0];
          const user = combinedResults[1];
          this.eventList = events as EventModule[];
          this.userFhirId = user.fhirId;
          return this.eventManager.getAllRegistrations(user.fhirId, events);
        }
      ));
  }

  selectEvent(index: number) {
    // TODO: Refactor to not use the booleans to handle dynamic loading.
    this.currentIndex = index;
    if (index < 0) {
      // If no item is selected, return current registration to undefined.
      this.eventManager.setCurrentRegistration(undefined);
      this.eventManager.setCurrentEvent(undefined);
    } else {
      // If item is selected, set current registration as it.
      const registration: Registration = this.registrations()[index];
      this.eventManager.setCurrentRegistration(registration);
      const matchedEvent: EventModule = this.eventManager.matchRegistrationToEvent(registration, this.eventList)
      this.eventManager.setCurrentEvent(matchedEvent);
    }
  }

  getTitle(registration: Registration): string {
    const matchedEvent: EventModule = this.eventManager.matchRegistrationToEvent(registration, this.eventList);
    return matchedEvent.title;
  }


  ngOnDestroy(): void {
    // sessionStorage.setItem('index', String(this.currentIndex));
  }

  loadTestContainer(registrationDisplayItem: RegistrationDisplayItem) {
    this.showRoot = false;
    this.currentItem = registrationDisplayItem;
  }

  exitTest() {
    this.showRoot = true;
    this.currentItem = undefined;
  }

  updateStatus(data: UpdateAction) {
    if (this.currentItem.testStatus == data.status && data.attachment === undefined){
      // If there is no change in the status without a potentially updated attachment, we don't need to do an update.
      console.error("Update cancelled, status is equivalent.")
      return;
    }
    this.eventManager.updateTestStatus(this.currentRegistration, this.currentItem.linkId, data).subscribe({
      next: () => {
        this.refreshTrigger$.next(1);
      },
      error: err => {
        console.error(err);
        this.utilsService.showErrorMessage("Server error updating the test event status");
      }
    })
  }

  onRegisterForEvent() {
    this.router.navigate(['event-registration'])
  }
}
