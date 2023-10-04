import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  @Output() 
  ipAddressEvent: EventEmitter<string> = new EventEmitter();

  ipAddressEmit(ipAddress: string){    
    this.ipAddressEvent.emit(ipAddress);
  }

}
