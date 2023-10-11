import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Status } from '../enums/status.enum';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsComponent {

  Status=Status;
  addServerForm: FormGroup;

  constructor(private fb: FormBuilder){
    this.addServerForm = this.fb.group({
      ipAddress: ['', [Validators.required, Validators.pattern('^\d[1,3]\\.\d[1,3]\\.\d[1,3]\\.\d[1,3]$')]],
      name: ['', [Validators.required, Validators.min(3)]],
      memory: ['', [Validators.required, Validators.min(3)]],
      type: ['', [Validators.required, Validators.min(3)]],
      status: [Status.SERVER_DOWN]
    });
  }


  @Output()
  public filterStatusEvent: EventEmitter<Status> = new EventEmitter();
  @Output()
  public formSubmitEvent: EventEmitter<FormGroup> = new EventEmitter();
  @Output()
  public printEvent: EventEmitter<boolean> = new EventEmitter();  
  @Input()
  public loading: boolean = false;
  @Input()
  public currentFilterStatus: Status = Status.ALL;
  @Input()
  public queryOrForm?: 'QUERY'|'FORM';

  filterStatusEmit(s: string) {
    switch(s){
      case "ALL": this.filterStatusEvent.emit(Status.ALL);break;
      case "SERVER_UP": this.filterStatusEvent.emit(Status.SERVER_UP);break;
      case "SERVER_DOWN": this.filterStatusEvent.emit(Status.SERVER_DOWN);break;
    }  
  }

  formSubmitEmit(){
    this.formSubmitEvent.emit(this.addServerForm);
  }

  printEmit(){
    this.printEvent.emit()
  }

  addServerQueryOrForm(value: 'QUERY'|'FORM'){
    this.queryOrForm = value;
  }
}
