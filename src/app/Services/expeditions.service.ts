import { Injectable } from '@angular/core';
import { environment } from '../../enviroment/environment';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExpeditionsService {
  private baseUrl = `${environment.apiUrl}/expeditions`
  constructor(private http: HttpClient) { }


  // Obtener todas las expediciones
  async getAllExpeditions(): Promise<any[]> {
    try {
      const res = await firstValueFrom(this.http.get<any[]>(this.baseUrl));
      return res;
    } catch (error) {
      console.log('Error while trying to get all Expeditions',error);
      throw error;
    }
  }

  // Agregar una nueva expedición
  async addExpedition(expedition: any): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.post<any>(this.baseUrl, expedition));
      return res;
    } catch (error) {
      console.log('Error while trying to add Expedition', error);
      throw error;
    }
  }

  // Actualizar una expedición existente
  async updateExpedition(id: string, expedition: any): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.put<any>(`${this.baseUrl}/${id}`, expedition));
      return res;
    } catch (error) {
      console.log('Error while trying to update Expedition', error);
      throw error;
    }
  }

  // Eliminar una expedición
  async deleteExpedition(id: string): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`));
      return res;
    } catch (error) {
      console.log('Error while trying to delete Expedition', error);
      throw error;
    }
  }
}
