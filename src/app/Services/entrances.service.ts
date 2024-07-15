import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../enviroment/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntrancesService {

private baseUrl = `${environment.apiUrl}/entrances`

//  private baseUrl = 'http://localhost:3000/api/entrances';
  constructor(private http: HttpClient) { }

//  private baseUrl = environment.apiUrl;

async getAllEntrances(): Promise<any[]> {
  try {
    const res = await firstValueFrom(this.http.get<any[]>(this.baseUrl));
    return res;
  } catch (error) {
    console.log('Error while trying to get all Entrances: ', error);
    throw error;
  }
}


// Método para obtener una entrada por ID
async getEntranceById(id: string): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/${id}`));
    return res;
  } catch (error) {
    console.log('Error while trying to get Entrance by ID: ', error);
    throw error;
  }
}

// Método para crear una nueva entrada
async createEntrance(entrance: any): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.post<any>(this.baseUrl, entrance));
    return res;
  } catch (error) {
    console.log('Error while trying to create Entrance: ', error);
    throw error;
  }
}

// Método para actualizar una entrada existente
async updateEntrance(id: string, entrance: any): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.put<any>(`${this.baseUrl}/${id}`, entrance));
    return res;
  } catch (error) {
    console.log('Error while trying to update Entrance: ', error);
    throw error;
  }
}

// Método para eliminar una entrada
async deleteEntrance(id: string): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`));
    return res;
  } catch (error) {
    console.log('Error while trying to delete Entrance: ', error);
    throw error;
  }
}

}
