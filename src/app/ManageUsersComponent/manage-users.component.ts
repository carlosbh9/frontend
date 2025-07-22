import { Component, inject, OnInit, signal } from '@angular/core';
import { User,Role, PermissionNode,PERMISSION_TREE  } from '../interfaces/user.interface';
import { UsersService } from '../Services/Users/users.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule,ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { ModalsComponent } from '../components/modals/modals.component';
import { RolesService } from '../Services/Users/roles.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FormsModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css'
})
export class ManageUsersComponent implements OnInit{
usersService = inject(UsersService)
roleService = inject(RolesService)

fb = inject(FormBuilder)
users = signal<User[]>([])
roles = signal<Role[]>([])

openModalRole = signal(false)
isEditMode = signal(false)

userForm!:  FormGroup;
userFormRole!: FormGroup;
permissionTree: PermissionNode[] = [];
selectedUser!: User;
selectedRole!: Role ;
isEditing = false;

ngOnInit(): void {
  this.getusers();
  this.getRoles();
  this.initForm();
  this.initFormRole()
}
  // Inicializa el formulario reactivo
  private initForm() {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      name: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required],
    });
  }

  private initFormRole(){
    this.userFormRole= this.fb.group({
      nameRole:[''],
      name:[''],
      permissions: this.fb.array([])
    })
  }

async getusers() {
  try {
    const result = await this.usersService.getAllUsers();
    this.users.set(result)
    console.log(this.users())


  } catch (error) {
    console.log('Error al cargar los User', error);
  }
}

async getRoles() {
  try {
    const result = await this.roleService.getAllRoles();
    this.roles.set(result)
    console.log(this.roles())
  } catch (error) {
    console.log('Error al cargar los Roless', error);
  }
}

onSubmit() {
  if (this.userForm.valid) {
    if (this.isEditing) {
      this.updateUser();
    } else {
      this.saveUser();
    }
  }
}

// Guarda un nuevo usuario
async saveUser() {
  try {
    const newUser: User = this.userForm.value;
    // Llama al servicio para guardar el usuario
     await this.usersService.createUser(newUser);
    // Actualiza la lista agregando el nuevo usuario
    this.getusers()
    this.userForm.reset();
  } catch (error) {
    console.error('Error al guardar el usuario', error);
  }
}
async updateUser() {
  try {
    if (!this.selectedUser) return;
    const updatedData: User = { ...this.selectedUser, ...this.userForm.value };
   await this.usersService.updateUser(updatedData._id,updatedData);
    this.getusers()
    this.cancelEdit(); // Reinicia el formulario y el estado de edición
  } catch (error) {
    console.error('Error al actualizar el usuario', error);
  }
}

async deleteUser(id: string) {
  try {
      await this.usersService.deleteUser(id);
      toast.success('Record deleted');
      this.getusers();
    } catch (error) {
      console.error('Error deleting User', error);
      toast.error('Unable to delete record');
    }
}


async deleteRole(id: string) {
  try {
      await this.roleService.deleteRole(id);
      toast.success('Record deleted');
      this.getRoles();
    } catch (error) {
      console.error('Error deleting Role', error);
      toast.error('Unable to delete record');
    }
}

confirmDelete(id: string) {
  toast('Are you sure you want to delete this record?', {
    action: {
      label: 'Confirm',
      onClick: async () => {
      await this.deleteUser(id);
      }
    },
    cancel: {
      label:'Cancel',
      onClick: () => {
      },
    },
    position: 'bottom-center',
  });
}

confirmDeleteRole(id: string) {
  toast('Are you sure you want to delete this record?', {
    action: {
      label: 'Confirm',
      onClick: async () => {
      await this.deleteRole(id);
      }
    },
    cancel: {
      label:'Cancel',
      onClick: () => {
      },
    },
    position: 'bottom-center',
  });
}
  editUser(user: User) {
    this.userForm.patchValue({
      username: user.username,
      name: user.name,
      password: user.password, // Puedes decidir si deseas cargar la contraseña o dejarla vacía
      role: user.role,
    });
    this.selectedUser = user;
    this.isEditing = true;
  }

   // Cancela la edición y reinicia el formulario
   cancelEdit() {
    this.userForm.reset();
    this.isEditing = false;
    this.selectedUser = {} as User;
  }

  closeModal(){
    this.openModalRole.set(false)
  }
  openCreateModal() {
    this.isEditMode.set(false);
    this.selectedRole = {
      _id: '',        // Inicializa con un valor por defecto
      nameRole: '',   // Inicializa con un valor por defecto
      name: '',       // Inicializa con un valor por defecto
      permissions: [] // Inicializa como un array vacío
  };

    // Limpia el formulario
    this.userFormRole.reset({
      nameRole: '',
      name: ''
    });

    // Desmarca todos los permisos
    this.uncheckAllPermissions(this.permissionTree);

    this.openModalRole.set(true);
  }
  openEditModal(role: Role): void {
    this.isEditMode.set(true);
    this.selectedRole = role;

    // 1. Resetea el formulario con el nombre actual
    this.userFormRole.patchValue({ name: role.name, nameRole: role.nameRole });

    // 2. Clona la estructura del árbol de permisos (para no mutar la original entre ediciones)
    this.permissionTree = JSON.parse(JSON.stringify(PERMISSION_TREE));

    // 3. Marca los permisos que ya tiene el role
    this.markSelectedPermissions(role.permissions, this.permissionTree);
    console.log('el rol:' ,role)
    // Abre el modal
    this.openModalRole.set(true);
  }

  private uncheckAllPermissions(nodes: PermissionNode[]) {
    for (const node of nodes) {
      node.checked = false;
      if (node.children) {
        this.uncheckAllPermissions(node.children);
      }
    }
  }
   // Marca como checked los permisos que el role ya tiene
   private markSelectedPermissions(permissions: string[], tree: PermissionNode[]): void {
    for (const node of tree) {
      // Si el nodo actual tiene value y está en la lista, marcar
      // if (node.value && permissions.includes(node.value)) {
      //   node.checked = true;
      // }
      node.checked = node.value ? permissions.includes(node.value) : false;

      // Si hay hijos, hacemos recursión
      if (node.children) {
        this.markSelectedPermissions(permissions, node.children);
      }
    }
  }

  // Recoge todos los permisos marcados
  private getCheckedPermissions(tree: PermissionNode[]): string[] {
    let selected: string[] = [];
    for (const node of tree) {
      if (node.checked && node.value) {
        selected.push(node.value);
      }
      if (node.children) {
        selected = [...selected, ...this.getCheckedPermissions(node.children)];
      }
    }
    return selected;
  }

  // Al guardar, actualizamos el role seleccionado con el nombre y la lista de permisos
  async onSave() {
    const { nameRole, name } = this.userFormRole.value;
    //const updatedPermissions = this.getCheckedPermissions(this.permissionTree);
    const selectedPermissions = this.getCheckedPermissions(this.permissionTree);

    if (this.isEditMode() && this.selectedRole) {
      // Actualiza el rol existente
      this.selectedRole.nameRole = nameRole;
      this.selectedRole.name = name;
      this.selectedRole.permissions = selectedPermissions;
      if (this.selectedRole._id) { // Verifica que _id no sea undefined
        await this.roleService.updateRole(this.selectedRole._id, this.selectedRole);
    } else {
        console.error('Role ID is undefined. Cannot update role.');
    }
      // Aquí podrías llamar a un servicio para actualizar en tu backend
    } else {
      // Crea un nuevo rol
      const newRole: Role = {

        nameRole,
        name,
        permissions: selectedPermissions
      };
      await this.roleService.createRole(newRole);
    }
    this.getRoles()
    this.closeModal();

  }

  // Manejo de expandir/contraer nodos
  toggleExpand(node: PermissionNode): void {
    node.expanded = !node.expanded;
  }

  // Si marcas/desmarcas un nodo "padre", puedes querer
  // propagar ese estado a sus hijos
  onParentChange(node: PermissionNode): void {
    if (node.children) {
      this.setChildrenCheck(node.children, node.checked || false);
    }
  }

  // Cuando cambias un hijo, podrías opcionalmente
  // actualizar el estado del padre (si todos los hijos se marcan/desmarcan).
  onChildChange(parent: PermissionNode): void {
    if (!parent.children) return;
    // Ejemplo: si todos los hijos están checked, marcar el padre
    const allChecked = parent.children.every(c => c.checked);
    const noneChecked = parent.children.every(c => !c.checked);

    // Decide la lógica que más te convenga
    if (allChecked) {
      parent.checked = true;
    } else if (noneChecked) {
      parent.checked = false;
    } else {
      // Si hay mezcla, podrías usar un "estado intermedio" si quisieras (indeterminate)
      parent.checked = false; // o lo que prefieras
    }
  }

  private setChildrenCheck(children: PermissionNode[], checked: boolean): void {
    for (const child of children) {
      child.checked = checked;
      if (child.children) {
        this.setChildrenCheck(child.children, checked);
      }
    }
  }
}
