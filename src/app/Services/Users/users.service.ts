import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../../interfaces/user.interface';
import { firstValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UsersService {
private baseUrl = `${environment.apiUrl}/all-users`
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

updateUser(): void{

}
}
