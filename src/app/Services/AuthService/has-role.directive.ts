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
    const userRole = this.authService.getRole(); 

    if (userRole && this.roles().includes(userRole)) {
      this.viewContainer.createEmbeddedView(this.templateRef); // Mostrar contenido
    } else {
      this.viewContainer.clear(); // Limpiar contenido
    }
  }
  // ngOnInit() {
  //   // Obtenemos la lista de permisos del usuario
  //   const userPermissions = this.authService.getPermisions(); 
  //   // Ej: ["contacts.create", "contacts.edit", "infoPax.print", ...]

  //   // Verificamos si el usuario posee TODOS los permisos requeridos
  //   // (puedes cambiarlo a "some" si quieres que con uno solo baste)
  //   const hasAllPermissions = this.roles().every(perm =>
  //     userPermissions.includes(perm)
  //   );
  //   if (hasAllPermissions) {
  //     this.viewContainer.createEmbeddedView(this.templateRef);
  //   } else {
  //     this.viewContainer.clear();
  //   }
  // }

  // userPermissions = [
  //   'contacts.create',
  //   'contacts.print',
  //   'infoPax.read',
  //   'infoPax.print',
  //   ...
  // ];
//   <!-- Ejemplo: mostrar el botón solo si el usuario tiene "contacts.create" -->
// <button *hasPermission="['contacts.create']">
//   Crear Contacto
// </button>

// <!-- Otro ejemplo: mostrar una sección si el usuario puede editar e imprimir contactos -->
// <div *hasPermission="['contacts.edit','contacts.print']">
//   <!-- Contenido que requiere ambos permisos -->
// </div>
}
