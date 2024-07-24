import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroment/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuidesService {

  private baseUrl = `${environment.apiUrl}/guides`
  constructor(private http: HttpClient) { }

   // Obtener todos los guías
   async getAllGuides(): Promise<any[]> {
    try {
      const res = await firstValueFrom(this.http.get<any[]>(this.baseUrl));
      return res;
    } catch (error) {
      console.error('Error while trying to get all Guides', error);
      throw error;
    }
  }

  // Agregar una nueva guía
  async addGuide(guide: any): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.post<any>(this.baseUrl, guide));
      return res;
    } catch (error) {
      console.error('Error while trying to add Guide', error);
      throw error;
    }
  }

  // Actualizar una guía existente
  async updateGuide(id: string, guide: any): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${id}`, guide));
      return res;
    } catch (error) {
      console.error('Error while trying to update Guide', error);
      throw error;
    }
  }

  // Eliminar una guía
  async deleteGuide(id: string): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`));
      return res;
    } catch (error) {
      console.error('Error while trying to delete Guide', error);
      throw error;
    }
  }
}
