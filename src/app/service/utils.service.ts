import { Injectable } from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(private _snackBar: MatSnackBar) { }

  showErrorMessage(messageStr: string = 'Server Error.'){
    this._snackBar.open(messageStr, 'X' ,{
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-offset', 'app-notification-error'],
      duration: 5000
    });
  }

  showWarningMessage(messageStr: string){
    this._snackBar.open(messageStr, 'X' ,{
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-offset', 'app-notification-warn'],
      duration: 5000
    });
  }

  showSuccessMessage(messageStr: string){
    this._snackBar.open(messageStr, 'X' ,{
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-offset', 'app-notification-success'],
      duration: 3000
    });
  }

  closeNotification(){
    this._snackBar.dismiss();
  }

  isJsonString(str: string): boolean {
    try {
      JSON.parse(str.trim());
    } catch (e) {
      console.error('JSON parse error:', e); // Add this
      return false;
    }
    return true;
  }

  isXmlString(str: string): boolean {
    try {
      const parser = new DOMParser();
      const theDom = parser.parseFromString(str?.trim(), 'application/xml');
      return !(theDom.getElementsByTagName('parsererror').length > 0);
    }
    catch (e) {
      return false;
    }
  }

}
