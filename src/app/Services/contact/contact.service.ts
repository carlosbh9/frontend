import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../enviroment/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private baseUrl = `${environment.apiUrl}/contacts`;

  constructor(private http: HttpClient) { }
  
  // Método para obtener todos los contactos
  async getAllContacts(): Promise<any[]> {
    try {
      const res = await firstValueFrom(this.http.get<any[]>(this.baseUrl));
      return res;
    } catch (error) {
      console.log('Error while trying to get all Contacts: ', error);
      throw error;
    }
  }
  
  // Método para obtener un contacto por ID
  async getContactById(id: string): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/${id}`));
      return res;
    } catch (error) {
      console.log('Error while trying to get Contact by ID: ', error);
      throw error;
    }
  }
  
  // Método para crear un nuevo contacto
  async createContact(contact: any): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.post<any>(this.baseUrl, contact));
      return res;
    } catch (error) {
      console.log('Error while trying to create Contact: ', error);
      throw error;
    }
  }
  
  // Método para actualizar un contacto existente
  async updateContact(id: string, contact: any): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${id}`, contact));
      return res;
    } catch (error) {
      console.log('Error while trying to update Contact: ', error);
      throw error;
    }
  }
  
  // Método para eliminar un contacto
  async deleteContact(id: string): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`));
      return res;
    } catch (error) {
      console.log('Error while trying to delete Contact: ', error);
      throw error;
    }
  }

  async getAllContactsWithCotizations() {
    try {
      const res = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/idquoter`));
      return res;
    } catch (error) {
      console.log('Error while trying to get all Contacts and QuoterId: ', error);
      throw error;
    }
    
  }
}
