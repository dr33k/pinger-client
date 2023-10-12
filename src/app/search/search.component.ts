import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  public pingServerForm: FormGroup;

  @Output() 
  ipAddressEvent: EventEmitter<string> = new EventEmitter();

  constructor(private fb: FormBuilder){
    this.pingServerForm = fb.group({
      ipAddress: ['', [Validators.required, Validators.pattern('^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$')]],
    })
  }

  ipAddressEmit(ipAddress: string){    
    this.ipAddressEvent.emit(ipAddress);
  }

}
