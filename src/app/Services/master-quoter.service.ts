import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../enviroment/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MasterQuoterService {
  
  private baseUrl = `${environment.apiUrl}/master`
  constructor(private http: HttpClient) { }

  async getAllMasterQuoter(): Promise<any[]> {
    try {
      const res = await firstValueFrom(this.http.get<any[]>(this.baseUrl));
      return res;
    } catch (error) {
      console.log('Error while trying to get all Master Quoters: ', error);
      throw error;
    }
  }

  // Método para obtener un Master Quoter por ID
async getMasterQuoterById(id: string): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/${id}`));
    console.log('el nuevo Master Quoter',res);
    return res;
  } catch (error) {
    console.log('Error while trying to get Master Quoter by ID: ', error);
    throw error;
  }
}

// Método para crear un nuevo Master Quoter
async createMasterQuoter(master: any): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.post<any>(this.baseUrl, master));
    return res;
  } catch (error) {
    console.log('Error while trying to create Master Quoter: ', error);
    throw error;
  }
}

// Método para actualizar un Master Quoter existente
async updateMasterQuoter(id: string, master: any): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${id}`, master));
    return res;
  } catch (error) {
    console.log('Error while trying to update Master quoter: ', error);
    throw error;
  }
}

// Método para eliminar un Master Quoter
async deleteMasterQuoter(id: string): Promise<any> {
  try {
    const res = await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`));
    return res;
  } catch (error) {
    console.log('Error while trying to delete Master Quoter: ', error);
    throw error;
  }
}

}
