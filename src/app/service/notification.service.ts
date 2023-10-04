import { Injectable } from '@angular/core';
import { NotifierService } from 'angular-notifier';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  public notifierService?: NotifierService;

  constructor(notifierService: NotifierService) { 
    this.notifierService = notifierService;
  }

  success(message: string){this.notifierService?.notify("success", message);}
  info(message: string){this.notifierService?.notify("info", message);}
  warning(message: string){this.notifierService?.notify("warning", message);}
  default(message: string){this.notifierService?.notify("default", message);}
}
