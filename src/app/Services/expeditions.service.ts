import { Injectable } from '@angular/core';
import { environment } from '../../enviroment/environment';
import { firstValueFrom,catchError, throwError } from 'rxjs';
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
      const response = await firstValueFrom(
        this.http.patch<any>(`${this.baseUrl}/${id}`, expedition).pipe(
          catchError(error => {
            console.error('Error while trying to update expedition:', error);
            return throwError(() => error);  // Lanza nuevamente el error
          })
        )
      );
      return response;
    } catch (error) {
      console.error('Error caught in updateExpedition method:', error);
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
