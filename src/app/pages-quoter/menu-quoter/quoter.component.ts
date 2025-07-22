import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-quoter',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './quoter.component.html',
  styleUrl: './quoter.component.css'
})
export class QuoterComponent {
  activeMenu: number | null = null;

  menuItems = [
   
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
    }
  ];

  toggleMenu(index: number, hasChildren: boolean) {
    if (hasChildren) {
      this.activeMenu = this.activeMenu === index ? null : index;
    }
  }
  closeMenu() {
    this.activeMenu = null;
  }
}
