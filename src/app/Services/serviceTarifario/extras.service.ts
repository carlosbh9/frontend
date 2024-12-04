import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroment/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExtrasService {




  // URL base para el servicio
  private baseUrl = `${environment.apiUrl}/extras`; // Cambia 'entrances' por 'extras'

  constructor(private http: HttpClient) { }

  // Obtener todos los extras
  async getAllExtras(): Promise<any[]> {
    try {
      const res = await firstValueFrom(this.http.get<any[]>(this.baseUrl));
      return res;
    } catch (error) {
      console.log('Error while trying to get all Extras: ', error);
      throw error;
    }
  }

  // Obtener un extra por ID
  async getExtraById(id: string): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/${id}`));
      return res;
    } catch (error) {
      console.log('Error while trying to get Extra by ID: ', error);
      throw error;
    }
  }

  // Crear un nuevo extra
  async createExtra(extra: any): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.post<any>(this.baseUrl, extra));
      return res;
    } catch (error) {
      console.log('Error while trying to create Extra: ', error);
      throw error;
    }
  }

  // Actualizar un extra existente
  async updateExtra(id: string, extra: any): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${id}`, extra));
      return res;
    } catch (error) {
      console.log('Error while trying to update Extra: ', error);
      throw error;
    }
  }

  // Eliminar un extra
  async deleteExtra(id: string): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`));
      return res;
    } catch (error) {
      console.log('Error while trying to delete Extra: ', error);
      throw error;
    }
  }
}
