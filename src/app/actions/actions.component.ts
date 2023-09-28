import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.css']
})
export class ActionsComponent {
  addServerDialogVisible: boolean = false;

  showAddServerDialog(){ this.addServerDialogVisible = true;}
}
