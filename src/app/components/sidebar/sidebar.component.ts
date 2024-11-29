import { Component , Input,Output,EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})


export class SidebarComponent {
  isDropdownOpen: boolean = false;
  isDropdownOpen2: boolean = false;

  toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
  }
  toggleDropdown2() {
    this.isDropdownOpen2 = !this.isDropdownOpen2;
}

@Input() isOpen = false;
@Output() closeSidebar = new EventEmitter<void>();


onCloseSidebar() {
  this.closeSidebar.emit();
}
}
