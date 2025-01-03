import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../enviroment/environment';

import { AuthService } from './Services/AuthService/auth.service';
import { SpinnerComponent } from "./components/spinner/spinner.component";
//CommonModule, RouterOutlet, RouterLinkActive
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})


export class AppComponent {
 
  title = 'frontend';
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }
}
