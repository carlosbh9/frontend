import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface QuoterSubMenuItem {
  label: string;
  router: string;
}

interface QuoterMenuItem {
  label: string;
  icon: string;
  hasChildren: boolean;
  router?: string;
  children?: QuoterSubMenuItem[];
}

@Component({
  selector: 'app-quoter',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './quoter.component.html',
  styleUrl: './quoter.component.css'
})
export class QuoterComponent {
  activeMenu: number | null = null;

  menuItems: QuoterMenuItem[] = [

    {
      label: 'Quoter',
      icon: 'bx bx-cart-add',
      hasChildren: true,
      children: [
        { label: 'Ingresar', router: 'quoter-form' },
        { label: 'Consultar Contacts', router: 'quoter-list' }
      ]
    },
    {
      label: 'Master Quoter',
      icon: 'bx bx-store-alt',
      hasChildren: true,
      children: [
        { label: 'Master Quoter of List', router: 'master-quoter-list' },
        { label: 'Add Master Quoter', router: 'master-quoter' }
      ]
    },
    {
      label: 'Booking form',
      icon: 'bx bx-store-alt',
      hasChildren: true,
      children: [
        { label: 'Booking Form', router: 'booking-form' },
        { label: 'Booking Files', router: 'booking-files' }
      ]
    },
    {
      label: 'Post Sale',
      icon: 'bx bx-briefcase-alt-2',
      hasChildren: true,
      children: [
        { label: 'Service Orders', router: 'service-orders' },
        { label: 'Booking Files', router: 'booking-files' }
      ]
    }
  ];

  toggleMenu(index: number, hasChildren: boolean) {
    if (hasChildren) {
      this.activeMenu = this.activeMenu === index ? null : index;
    }
    else{
      this.activeMenu = null;
    }
  }
  closeMenu() {
    this.activeMenu = null;
  }
}
