import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Status } from '../enums/status.enum';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.css']
})
export class ActionsComponent {
  addServerDialogVisible: boolean = false;

  showAddServerDialog() { this.addServerDialogVisible = true; }

  Status = Status;

  @Output()
  public filterStatusEvent: EventEmitter<Status> = new EventEmitter();
  @Output()
  public formSubmitEvent: EventEmitter<NgForm> = new EventEmitter();
  @Input()
  public loading: boolean = false;
  
  filterStatusEmit(s: string) {
    switch(s){
      case "ALL": this.filterStatusEvent.emit(Status.ALL);break;
      case "SERVER_UP": this.filterStatusEvent.emit(Status.SERVER_UP);break;
      case "SERVER_DOWN": this.filterStatusEvent.emit(Status.SERVER_DOWN);break;
    }  
  }

  formSubmitEmit(form: NgForm){
    this.formSubmitEvent.emit(form);
  
  }
}
