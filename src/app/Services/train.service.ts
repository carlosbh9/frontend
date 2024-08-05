import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../enviroment/environment';
import { HttpClient,  } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class TrainService {
  private baseUrl = `${environment.apiUrl}/trains` // Reemplaza con la URL de tu API

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

  // Obtener los servicios de un tren
  async getServicesByTrainId(trainId: string): Promise<any[]> {
    try {
      const response = await firstValueFrom(this.http.get<any[]>(`${this.baseUrl}/${trainId}/services`));
      return response;
    } catch (error) {
      console.error('Error while trying to get services by Train', error);
      throw error;
    }
  }

  // Agregar un servicio a un tren
  async addServiceToTrain(trainId: string, service: any): Promise<any> {
    try {
      const response = await firstValueFrom(this.http.post<any>(`${this.baseUrl}/${trainId}/services`, service));
      return response;
    } catch (error) {
      console.error('Error while trying to add service to Train', error);
      throw error;
    }
  }

  // Actualizar un servicio de un tren
  async updateService(trainId: string, service: any): Promise<any> {
    try {
      const response = await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${trainId}/services/${service.id}`, service));
      return response;
    } catch (error) {
      console.error('Error while trying to update service', error);
      throw error;
    }
  }

  // Eliminar un servicio de un tren
  async deleteService(trainId: string, serviceId: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.baseUrl}/${trainId}/services/${serviceId}`));
    } catch (error) {
      console.error('Error while trying to delete service', error);
      throw error;
    }
  }

  // Obtener un un train por ID
  async getTrainbyId(trainId: string): Promise<any> {
    try {
      return firstValueFrom(this.http.get<any>(`${this.baseUrl}/${trainId}`))
    } catch (error) {
      console.error('Error get Train by Id', error);
      throw error;
    }
  }
}