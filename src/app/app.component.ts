import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';


import { SpinnerComponent } from "./components/spinner/spinner.component";
import {  NgxSonnerToaster } from 'ngx-sonner';




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,SpinnerComponent,NgxSonnerToaster],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers:[]
})


export class AppComponent implements OnInit{
 
  constructor() {}
  title = 'frontend';
  isSidebarOpen = false;

  ngOnInit() {

}
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
   
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

}

