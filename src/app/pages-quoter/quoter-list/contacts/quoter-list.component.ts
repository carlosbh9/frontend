import { Component,effect,inject ,OnInit,signal} from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContactService } from '../../../Services/contact/contact.service';
import { QuoterService } from '../../../Services/quoter.service';
import { PdfexportService } from '../../../Services/pdfexport/pdfexport.service';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2'
import { ExportExcelService } from '../../../Services/exportExcel/export-excel.service';
import { Contact } from '../../../interfaces/contact.interface';
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

  itemsPerPage = signal(10);
  currentPage = signal(1);
  totalContacts = signal(0);

  isModalOpen = signal(false);
  currentContact: Contact  = {
    name: '',
    td_designed:'',
  };
  contacts: any[] = []
  filteredContacts: any[] = [];
  paginatedContacts: any[] = [];
  filterText: string = '';
  dropdownOpen: string | null = null;

  statuses = ['WIP', 'HOLD', 'SOLD', 'LOST'];
  statusColors: { [key: string]: string } = {
    WIP: 'bg-blue-100', // Azul
    HOLD: 'bg-yellow-100', // Amarillo
    SOLD: 'bg-green-100', // Verde
    LOST: 'bg-red-100', // Rojo
  };

  getStatusClass(status: string): string {
    return this.statusColors[status] || 'bg-gray-100';
  }
  constructor(private router: Router,private route: ActivatedRoute) {
  effect(() => {
    const page = this.currentPage()
    const pageSize = this.itemsPerPage()
    this.fetchContacts(page,pageSize)
  },{allowSignalWrites: true});
  effect(() => {
    this.updatePaginatedContacts();
  });
  }
   ngOnInit(): void {
   
  }

  async fetchContacts(page: number, pageSize: number) {
    try {
      const result = await this.contactService.getContactsPaginated(page, pageSize);
      this.contacts = result.contacts
      this.filteredContacts = this.contacts; 
      //this.updatePaginatedContacts();
      this.totalContacts.set(result.totalContacts)
    } catch (error) {
      console.error('Error fetching contacts', error);
    }
  }
 
  // Método para filtrar los contactos según el nombre
  async filterContacts() {

    this.currentPage.set(1); 
    this.currentPage.set(1); 

    try {
      const result = await this.contactService.getContactsPaginated(this.currentPage(), this.itemsPerPage(), this.filterText);
      this.contacts = result.contacts;
      this.filteredContacts = result.contacts;
      this.totalContacts.set(result.totalContacts);
      this.updatePaginatedContacts();
    } catch (error) {
      console.error('Error fetching filtered contacts:', error);
    }
  }

  contactForm() {
    this.router.navigate([`../contact-form`], { relativeTo: this.route });
  }

  // Método para eliminar un contacto
  async deleteContact(id: string) {
    try {
      await this.contactService.deleteContact(id); 
      Swal.fire('Success','Record deleted','success')
      this.fetchContacts(this.currentPage(),this.itemsPerPage()); 
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
      await this.quoterService.deleteQuoter(id); 
      Swal.fire('Success','Record deleted','success')
      this.fetchContacts(this.currentPage(),this.itemsPerPage()); 
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
  openModal(contact: Contact) {
    this.currentContact = { ...contact };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
   // this.currentContact = {null};
  }

  get totalPages(): number {
    return Math.ceil(this.totalContacts() / this.itemsPerPage());
  }

  getPagesNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onPageChange(page: number) {
    if (page !== this.currentPage()) {
      this.currentPage.set(page);
    }
    
  }

  updatePaginatedContacts() {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    this.paginatedContacts = this.filteredContacts.slice(startIndex, endIndex);
  }
}

