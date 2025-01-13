import { CommonModule } from '@angular/common';
import { Component,Output,EventEmitter, inject, OnInit} from '@angular/core';
import { AuthService } from '../../Services/AuthService/auth.service';
import { UserPayload } from '../../interfaces/user.interface';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{
   authService = inject(AuthService)
  @Output() toggleSidebar = new EventEmitter<void>();
  user: UserPayload | null = null;

  ngOnInit() {
    this.user = this.authService.getUserData(); // Obtener datos del usuario
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  isOpen = false; // Controla si el dropdown está abierto o cerrado

  toggleDropdown() {
    this.isOpen = !this.isOpen; // Alterna el estado del dropdown
  }

  closeDropdown() {
    this.isOpen = false; // Cierra el dropdown
  }

  logout(){
    this.authService.logout()
  }
}
