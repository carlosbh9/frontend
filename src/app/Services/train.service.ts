import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../enviroment/environment';
import { HttpClient,  } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class TrainService {
  private baseUrl = `${environment.apiUrl}/train` // Reemplaza con la URL de tu API

  constructor(private http: HttpClient) { }

  // Crear un nuevo tren
  async addTrain(train: any): Promise<any> {
    try {
      const response = await firstValueFrom(this.http.post<any>(this.baseUrl, train));
      return response;
    } catch (error) {
      console.error('Error while trying to add Train', error);
      throw error;
    }
  }

  // Obtener todos los trenes
  async getAllTrains(): Promise<any[]> {
    try {
      const response = await firstValueFrom(this.http.get<any[]>(this.baseUrl));
      return response;
    } catch (error) {
      console.error('Error while trying to get all Trains', error);
      throw error;
    }
  }

  // Obtener un tren por ID
  async getTrainById(id: string): Promise<any> {
    try {
      const response = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/${id}`));
      return response;
    } catch (error) {
      console.error('Error while trying to get by Train', error);
      throw error;
    }
  }

  // Actualizar un tren
  async updateTrain(id: string, train: any): Promise<any> {
    try {
      const response = await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${id}`, train));
      return response;
    } catch (error) {
      console.error('Error while trying to update Train', error);
      throw error;
    }
  }

  // Eliminar un tren
  async deleteTrain(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
    } catch (error) {
      console.error('Error while trying to delete train', error);
      throw error;
    }
  }

 
}