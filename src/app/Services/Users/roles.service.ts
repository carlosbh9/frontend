import { inject, Injectable } from '@angular/core';
import { Role } from '../../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../enviroments/environment';
@Injectable({
  providedIn: 'root'
})
export class RolesService {
http = inject(HttpClient)

private baseUrl = `${environment.apiUrl}/roles`

  constructor() { }

  
async getAllRoles(): Promise<Role[]>{
  try {
    const res =   await firstValueFrom(this.http.get<Role[]>(this.baseUrl))
    return res
  } catch (error) {
    console.log('Error while trying to get all Entrances: ', error);
    throw error;
  }
}
// Método para actualizar una entrada existente
async updateRole(id: string, role: any): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${id}`, role));
    return res;
  } catch (error) {
    console.log('Error while trying to update Role: ', error);
    throw error;
  }
}
async deleteRole(id: string): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`));
    return res;
  } catch (error) {
    console.log('Error while trying to delete Role: ', error);
    throw error;
  }
}

async createRole(role: any): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.post<any>(this.baseUrl, role));
    return res;
  } catch (error) {
    console.log('Error while trying to create Role: ', error);
    throw error;
  }
}
}
