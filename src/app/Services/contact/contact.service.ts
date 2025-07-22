import { HttpClient,HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private baseUrl = `${environment.apiUrl}/contacts`;

  constructor(private http: HttpClient) { }

  // Método para obtener todos los contactos
  async getAllContacts(filter:string =''): Promise<{ contacts: any[]; totalContacts: number }> {
    try {
      let params = new HttpParams()
        .set('all', 'true')
        .set('filter',filter)

        const res = await firstValueFrom(this.http.get<{ contacts: any[]; totalContacts: number }>(this.baseUrl, { params }));
        console.log(res)
        return res;
    } catch (error) {
      console.log('Error while trying to get all Contacts: ', error);
      throw error;
    }
  }
   // Obtener todos los contactos, con posibilidad de agregar filtros o parámetros
   async getContactsPaginated(page: number, pageSize: number, filterText: string = ''): Promise<{ contacts: any[]; totalContacts: number }> {
    try {
      let params = new HttpParams()
        .set('page', page.toString())
        .set('pageSize', pageSize.toString());

        if (filterText) {
          params = params.set('filter', filterText);
        }
      const res = await firstValueFrom(this.http.get<{ contacts: any[]; totalContacts: number }>(this.baseUrl, { params }));
      return res;
    } catch (error) {
      console.error('Error fetching paginated contacts:', error);
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
      console.log('se actualizao?',contact)
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
