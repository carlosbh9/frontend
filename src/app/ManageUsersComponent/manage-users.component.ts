import { Component, inject, OnInit, signal } from '@angular/core';
import { User } from '../interfaces/user.interface';
import { UsersService } from '../Services/Users/users.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css'
})
export class ManageUsersComponent implements OnInit{
usersService = inject(UsersService)
fb = inject(FormBuilder)
users = signal<User[]>([])
userForm!:  FormGroup;
selectedUser: User | null = null;
isEditing = false;

ngOnInit(): void {
  this.getusers() 
  this.initForm();
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

async getusers() {
  try {
    const result = await this.usersService.getAllUsers();
    this.users.set(result)
    console.log(this.users())
 
  
  } catch (error) {
    console.log('Error al cargar los Master Quoters', error);
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
    // const savedUser = await this.usersService.saveUser(newUser);
    // Actualiza la lista agregando el nuevo usuario
    // this.users.set([...this.users(), savedUser]);
    this.userForm.reset();
  } catch (error) {
    console.error('Error al guardar el usuario', error);
  }
}
async updateUser() {
  try {
    if (!this.selectedUser) return;
    const updatedData: User = { ...this.selectedUser, ...this.userForm.value };
    // Llama al servicio para actualizar el usuario
   // const updatedUser = await this.usersService.updateUser(updatedData);
    // Actualiza la lista de usuarios
    // const updatedUsers = this.users().map(user =>
    //   user._id === updatedUser.id ? updatedUser : user
    // );
    // this.users.set(updatedUsers);
    this.cancelEdit(); // Reinicia el formulario y el estado de edición
  } catch (error) {
    console.error('Error al actualizar el usuario', error);
  }
}
  editUser(user: User) {
    this.userForm.patchValue({
      username: user.username,
      name: user.name,
      password: '', // Puedes decidir si deseas cargar la contraseña o dejarla vacía
      role: user.role,
    });
    this.selectedUser = user;
    this.isEditing = true;
  }

   // Cancela la edición y reinicia el formulario
   cancelEdit() {
    this.userForm.reset();
    this.isEditing = false;
    this.selectedUser = null;
  }
}
