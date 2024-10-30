import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroment/environment';

@Injectable({
  providedIn: 'root'
})
export class GourmetService {
  private baseUrl = `${environment.apiUrl}/limagourmet`;

  constructor(private http: HttpClient) { }
  
  // Método para obtener todos los productos de Limagourmet
  async getAllLimagourmet(): Promise<any[]> {
    try {
      const res = await firstValueFrom(this.http.get<any[]>(this.baseUrl));
      return res;
    } catch (error) {
      console.log('Error while trying to get all Limagourmet products: ', error);
      throw error;
    }
  }
  
  // Método para obtener un producto de Limagourmet por ID
  async getLimagourmetById(id: string): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/${id}`));
      return res;
    } catch (error) {
      console.log('Error while trying to get Limagourmet product by ID: ', error);
      throw error;
    }
  }
  
  // Método para crear un nuevo producto de Limagourmet
  async createLimagourmet(product: any): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.post<any>(this.baseUrl, product));
      return res;
    } catch (error) {
      console.log('Error while trying to create Limagourmet product: ', error);
      throw error;
    }
  }
  
  // Método para actualizar un producto de Limagourmet existente
  async updateLimagourmet(id: string, product: any): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${id}`, product));
      return res;
    } catch (error) {
      console.log('Error while trying to update Limagourmet product: ', error);
      throw error;
    }
  }
  
  // Método para eliminar un producto de Limagourmet
  async deleteLimagourmet(id: string): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`));
      return res;
    } catch (error) {
      console.log('Error while trying to delete Limagourmet product: ', error);
      throw error;
    }
  }
  
}
