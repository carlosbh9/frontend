import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../enviroment/environment';
import { HttpClient,  } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OperatorsService {
  private baseUrl = `${environment.apiUrl}/operators`

  constructor(private http: HttpClient) { }

   // Obtener todos los operadores
   async getAllOperators(): Promise<any[]> {
    try {
      const res = await firstValueFrom(this.http.get<any[]>(this.baseUrl));
      return res;
    } catch (error) {
      console.error('Error while trying to get all Operators', error);
      throw error;
    }
  }

  // Agregar un nuevo operador
  async addOperator(operator: any): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.post<any>(this.baseUrl, operator));
      return res;
    } catch (error) {
      console.error('Error while trying to add Operator', error);
      throw error;
    }
  }

  // Actualizar un operador existente
  async updateOperator(id: string, operator: any): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${id}`, operator));
      return res;
    } catch (error) {
      console.error('Error while trying to update Operator', error);
      throw error;
    }
  }

  // Eliminar un operador
  async deleteOperator(id: string): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`));
      return res;
    } catch (error) {
      console.error('Error while trying to delete Operator', error);
      throw error;
    }
  }

  // Obtener todos los servicios de un operador
  async getServicesByOperator(operatorId: string): Promise<any[]> {
    try {
          return firstValueFrom(this.http.get<any[]>(`${this.baseUrl}/${operatorId}/services`));
    } catch (error) {
      console.error('Error while trying to delete service', error);
      throw error;
    }
  }

  // Agregar un nuevo servicio a un operador
  async addServiceToOperator(operatorId: string, service: any): Promise<any> {
    try {
          return firstValueFrom(this.http.post<any>(`${this.baseUrl}/${operatorId}/services`, service));
    } catch (error) {
      console.error('Error while trying to add Operator', error);
      throw error;
    }
  }

  // Actualizar un servicio existente de un operador
  async updateService(operatorId: string, serviceId: string, service: any): Promise<any> {
    try {
          return await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${operatorId}/services/${serviceId}`, service));
    } catch (error) {
      console.error('Error while trying to update service by operator', error);
      throw error;
    }
  }

  // Eliminar un servicio de un operador
  async deleteService(operatorId: string, serviceId: string): Promise<any> {
    try {
          return firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${operatorId}/services/${serviceId}`));
    } catch (error) {
      console.error('Error while trying to delete service by operator', error);
      throw error;
    }
  }

  // Obtener un un operador por ID
  async getOperatorbyId(operatorId: string): Promise<any> {
    try {
      return firstValueFrom(this.http.get<any>(`${this.baseUrl}/${operatorId}`))
    } catch (error) {
      console.error('Error get operator by Id', error);
      throw error;
    }
  }

}