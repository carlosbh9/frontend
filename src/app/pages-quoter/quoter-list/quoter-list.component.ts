import { Component,inject ,OnInit} from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContactService } from '../../Services/contact/contact.service';
import { QuoterService } from '../../Services/quoter.service';
import { PdfexportService } from '../../Services/pdfexport/pdfexport.service';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2'
import { ExportExcelService } from '../../Services/exportExcel/export-excel.service';
@Component({
  selector: 'app-quoter-list',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule,SweetAlert2Module],
  templateUrl: './quoter-list.component.html',
  styleUrl: './quoter-list.component.css'
})
export class QuoterListComponent implements OnInit{
  quoterService = inject(QuoterService)
  contactService = inject(ContactService)
  pdfExportService = inject(PdfexportService)
  excelService = inject(ExportExcelService)

  contacts: any[] = []
  filteredContacts: any[] = [];
  filterText: string = '';
  dropdownOpen: string | null = null;

  statuses = ['WIP', 'HOLD', 'SOLD', 'LOST'];
  statusColors: { [key: string]: string } = {
    WIP: 'text-blue-500 bg-blue-100', // Azul
    HOLD: 'text-yellow-500 bg-yellow-100', // Amarillo
    SOLD: 'text-green-500 bg-green-100', // Verde
    LOST: 'text-red-500 bg-red-100', // Rojo
  };

  getStatusClass(status: string): string {
    return this.statusColors[status] || 'bg-gray-100';
  }
  constructor(private router: Router,private route: ActivatedRoute) {
  //  this.selectedQuoter = this.emptyQuoter; // Mueve la inicialización aquí
  }
  ngOnInit(): void {
    this.fetchContacts();
  }

  // Método para obtener todos los contactos
  async fetchContacts() {
    try {
      this.contacts = await this.contactService.getAllContacts();
      this.filteredContacts = this.contacts; // Inicializa los contactos filtrados con todos los contactos
      console.log(this.contacts); // Muestra en consola los contactos obtenidos
    } catch (error) {
      console.error('Error fetching contacts', error);
    }
  }

  // Método para filtrar los contactos según el nombre
  filterContacts() {
    this.filteredContacts = this.contacts.filter(contact =>
      contact.name.toLowerCase().includes(this.filterText.toLowerCase()) // Filtra por nombre
    );
  }

  // Método para navegar al formulario de creación de contacto
  contactForm() {
    this.router.navigate([`../contact-form`], { relativeTo: this.route });
  }

  // Método para eliminar un contacto
  async deleteContact(id: string) {
    try {
      await this.contactService.deleteContact(id); // Elimina el contacto usando el servicio
      Swal.fire('Success','Record deleted','success')
      this.fetchContacts(); // Vuelve a cargar la lista de contactos
    } catch (error) {
      console.error('Error deleting contact', error);
    }
  }
  editQuoter(id: string){
    console.log('id',id)
    this.router.navigate([`../quoter-edit`,id],{ relativeTo: this.route });
  }

  async deleteQuoter(id: string){
    try {
      await this.quoterService.deleteQuoter(id); // Elimina el contacto usando el servicio
      Swal.fire('Success','Record deleted','success')
      this.fetchContacts(); // Vuelve a cargar la lista de contactos
    } catch (error) {
      console.error('Error deleting Quoter', error);
    }
  }

  async updateCotizationStatus(contactId: string, updatedCotization: any): Promise<void> {
    try {
      const contact = this.contacts.find((c) => c._id === contactId);
  
      const updatedCotizations = contact.cotizations.map((cotization: any) =>
        cotization.quoter_id === updatedCotization.quoter_id
          ? { ...cotization, status: updatedCotization.status } 
          : cotization );
      const response = await this.contactService.updateContact(contactId, { cotizations: updatedCotizations });
      console.log('Cotización actualizada:', response);
    } catch (error) {
      console.error('Error al actualizar la cotización:', error);
    }
  }

  toggleDropdown(contactId: string) {
    this.dropdownOpen = this.dropdownOpen === contactId ? null : contactId;

  }
 
  async generatePDF(id:string) {
    const quoter = await this.quoterService.getQuoterById(id)
    const dataURL = await this.pdfExportService.convertImageToDataURL('/images/image.png');

    const docDefinition = this.pdfExportService.generatePdf(quoter,dataURL);
    this.pdfExportService.exportPdf(docDefinition);

  }   
  async generateExcel(id:string) {
    const quoter = await this.quoterService.getQuoterById(id)
    this.excelService.downloadQuotationAsExcel(quoter, `${quoter.guest}`);

  }   

}

