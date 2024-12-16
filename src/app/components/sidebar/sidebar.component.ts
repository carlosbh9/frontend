import { Component , Input,Output,EventEmitter, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Services/AuthService/auth.service';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})


export class SidebarComponent implements OnInit{
  authService = inject(AuthService)
  isDropdownOpen: boolean = false;
  isDropdownOpen2: boolean = false;
  role: string ='' 

  user: {id: string, username: string; role: string , name: string} | null = null;
  toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
  }
  toggleDropdown2() {
    this.isDropdownOpen2 = !this.isDropdownOpen2;
}

@Input() isOpen = false;
@Output() closeSidebar = new EventEmitter<void>();

ngOnInit() {
  this.role = this.authService.getRole() || ''; // Obtener datos del usuario
  console.log('el rol',this.role)// Obtener datos del usuario
}

onCloseSidebar() {
  this.closeSidebar.emit();
  this.authService.getRole();

}
}
