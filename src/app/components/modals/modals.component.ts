import { Component, EventEmitter, output, Output, signal } from '@angular/core';
import { Submenu2Component } from './submenu2/submenu2.component';
import { Submenu1Component } from './submenu1/submenu1.component';
import { Submenu3Component } from './submenu3/submenu3.component';

@Component({
  selector: 'app-modals',
  standalone: true,
  imports: [Submenu1Component,Submenu2Component,Submenu3Component],
  templateUrl: './modals.component.html',
  styleUrl: './modals.component.css'
})
export class ModalsComponent {
  selectedTab = signal('submenu3');

  @Output() modalClosed = new EventEmitter<void>();
  modalClosed2 = output<Boolean>()
  selectTab(tab: string) {
    this.selectedTab.set(tab);
  }

  // Método para cerrar el modal
  closeModal() {
    this.modalClosed.emit();
    this.modalClosed2.emit(true)
  }
}
