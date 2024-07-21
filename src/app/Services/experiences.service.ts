import { Injectable } from '@angular/core';
import { environment } from '../../enviroment/environment';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExperiencesService {
  private baseUrl = `${environment.apiUrl}/experiences`
  constructor(private http: HttpClient) { }


  // Obtener todas las experiencias
  async getAllExperiences(): Promise<any[]> {
    try {
      const res = await firstValueFrom(this.http.get<any[]>(this.baseUrl));
      return res;
    } catch (error) {
      console.error('Error while trying to get all Experiences', error);
      throw error;
    }
  }

  // Agregar una nueva experiencia
  async addExperience(experience: any): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.post<any>(this.baseUrl, experience));
      return res;
    } catch (error) {
      console.error('Error while trying to add Experience', error);
      throw error;
    }
  }

  // Actualizar una experiencia existente
  async updateExperience(id: string, experience: any): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${id}`, experience));
      return res;
    } catch (error) {
      console.error('Error while trying to update Experience', error);
      throw error;
    }
  }

  // Eliminar una experiencia
  async deleteExperience(id: string): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`));
      return res;
    } catch (error) {
      console.error('Error while trying to delete Experience', error);
      throw error;
    }
  }
}
