import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface TariffMenuItem {
  label: string;
  icon: string;
  router: string;
}

@Component({
  selector: 'app-menu-tariff',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-tariff.component.html',
  styleUrl: './menu-tariff.component.css'
})
export class MenuTariffComponent {
  readonly menuItems: TariffMenuItem[] = [
    { label: 'Tariff V2', icon: 'bx bx-layer mr-3 text-lg', router: 'tariff-v2' },
  ];
}
