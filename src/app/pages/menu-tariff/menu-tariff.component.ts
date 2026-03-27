import { Component } from '@angular/core';
import { NavigationShellComponent } from '../../components/navigation-shell/navigation-shell.component';

@Component({
  selector: 'app-menu-tariff',
  standalone: true,
  imports: [NavigationShellComponent],
  templateUrl: './menu-tariff.component.html',
  styleUrl: './menu-tariff.component.css'
})
export class MenuTariffComponent {
  readonly title = 'Tarifas';
  readonly description =
    'Administra la estructura tarifaria actual desde un espacio limpio, con la navegación principal concentrada en el sidebar.';
}
