import { Directive ,effect,inject, input, TemplateRef, ViewContainerRef} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop'
import { AuthService } from './auth.service';


@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective {
  private templateRef = inject(TemplateRef)
  private viewContainer = inject(ViewContainerRef)

  private authService = inject(AuthService)
  
  roles = input.required<string[]>({alias:'hasRole'})

  constructor() {}

  ngOnInit() {
    const userRole = this.authService.getRole(); // Obtener el rol del usuario actual

    if (userRole && this.roles().includes(userRole)) {
      this.viewContainer.createEmbeddedView(this.templateRef); // Mostrar contenido
    } else {
      this.viewContainer.clear(); // Limpiar contenido
    }
  }

}
