import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu-tariff',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './menu-tariff.component.html',
  styleUrl: './menu-tariff.component.css'
})
export class MenuTariffComponent {
  activeMenu: number | null = null; // Controla qué menú está abierto

  // Datos del Menú
  menuItems = [
    { label: 'Hoteles', icon: 'bx bxs-buildings mr-3 text-lg', hasChildren: false ,router: 'hotel'},
    { label: 'Tarifario General', icon: 'bx bx-user mr-3 text-lg', hasChildren: true, children: [
      {label:'Entrances', router: 'entrance'},
      {label:'Alpaca Expeditions', router: 'expeditions'},
      {label:'Activities', router: 'experiences'},
      {label:'Restaurants', router: 'restaurant'},
      {label:'Guides', router: 'guides'},
      {label:'Opertators', router: 'operators'},
      {label:'Trains', router: 'train'},
      {label:'Kutimuy', router: 'transport'},
      {label:'Lima Gourmet', router: 'lima-gourmet'},
      {label:'Extras', router: 'extra'}
    ] },
  ];

  // Alternar Submenús
  toggleMenu(index: number, hasChildren: boolean) {
    if (hasChildren) {
      this.activeMenu = this.activeMenu === index ? null : index;
    }
  }
  closeMenu() {
    this.activeMenu = null;
  }
}
