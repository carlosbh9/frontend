import { Component } from '@angular/core';
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

  toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
  }
}
