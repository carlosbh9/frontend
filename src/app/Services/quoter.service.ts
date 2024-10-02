import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../enviroment/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuoterService {

  private baseUrl = `${environment.apiUrl}/quoter`

  constructor(private http: HttpClient) { }

async getAllQuoter(): Promise<any[]> {
  try {
    const res = await firstValueFrom(this.http.get<any[]>(this.baseUrl));
    return res;
  } catch (error) {
    console.log('Error while trying to get all Quoters: ', error);
    throw error;
  }
}

// Método para obtener una cotizacion por ID
async getQuoterById(id: string): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/${id}`));
    console.log('el nuevo coti',res);
    return res;
  } catch (error) {
    console.log('Error while trying to get Quoter by ID: ', error);
    throw error;
  }
}

// Método para crear una nueva cotizacion
async createQuoter(quoter: any): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.post<any>(this.baseUrl, quoter));
    return res;
  } catch (error) {
    console.log('Error while trying to create Quoter: ', error);
    throw error;
  }
}

// Método para actualizar una cotizacion existente
async updateQuoter(id: string, quoter: any): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${id}`, quoter));
    return res;
  } catch (error) {
    console.log('Error while trying to update quoter: ', error);
    throw error;
  }
}

// Método para eliminar una cotizacion
async deleteQuoter(id: string): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`));
    return res;
  } catch (error) {
    console.log('Error while trying to delete Quoter: ', error);
    throw error;
  }
}

 //agregar un item a una cotizacion
 async addItemQuoter(quoterId: string, item: any): Promise<any> {
  try {
    return await firstValueFrom(this.http.post<any>(`${this.baseUrl}/${quoterId}/quoterItems`, item));
  } catch (error) {
    console.error('Error adding item to Quoter:', error);
    throw error;
  }
}

}
