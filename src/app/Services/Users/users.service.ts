import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../../interfaces/user.interface';
import { firstValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UsersService {
private baseUrl = `${environment.apiUrl}/users`
private signupUrl = `${environment.apiUrl}/auth/signup`
constructor(private http: HttpClient) { }


async getAllUsers(): Promise<User[]>{
  try {
    const res =   await firstValueFrom(this.http.get<User[]>(this.baseUrl))
    return res
  } catch (error) {
    console.log('Error while trying to get all Entrances: ', error);
    throw error;
  }
}
// Método para actualizar una entrada existente
async updateUser(id: string, user: any): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${id}`, user));
    return res;
  } catch (error) {
    console.log('Error while trying to update User: ', error);
    throw error;
  }
}
async deleteUser(id: string): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`));
    return res;
  } catch (error) {
    console.log('Error while trying to delete User: ', error);
    throw error;
  }
}

async createUser(user: any): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.post<any>(this.signupUrl, user));
    return res;
  } catch (error) {
    console.log('Error while trying to create User: ', error);
    throw error;
  }
}
}
