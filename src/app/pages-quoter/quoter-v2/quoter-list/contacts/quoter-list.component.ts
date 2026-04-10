import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Form, FormGroup, FormsModule, Validators, ReactiveFormsModule, FormBuilder, FormArray } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContactService } from '../../../../Services/contact/contact.service';
import { QuoterV2Service } from '../../../../Services/quoter-v2.service';
import { PdfexportService } from '../../../../Services/pdfexport/pdfexport.service';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2'
import { ExportExcelService } from '../../../../Services/exportExcel/export-excel.service';
import { Contact, Quoter } from '../../../../interfaces/contact.interface';
import { toast } from 'ngx-sonner';
import { LaunchAccessService } from '../../../../Services/launch-access.service';

import { CdkDragDrop, transferArrayItem, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-quoter-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SweetAlert2Module, ReactiveFormsModule, DragDropModule],
  templateUrl: './quoter-list.component.html',
  styleUrl: './quoter-list.component.css'
})
export class QuoterListComponent implements OnInit {
  quoterV2Service = inject(QuoterV2Service)
  contactService = inject(ContactService)
  pdfExportService = inject(PdfexportService)
  excelService = inject(ExportExcelService)
  launchAccessService = inject(LaunchAccessService)
  fb: FormBuilder = inject(FormBuilder)
  contactFormGroup!: FormGroup;

  itemsPerPage = signal(10);
  currentPage = signal(1);
  totalContacts = signal(0);

  view: 'list' | 'kanban' = 'list';

  isModalAddContact = signal(false);
  isConfirmSaleModalOpen = signal(false);
  isEdit = signal(false);
  confirmSaleLoading = signal(false);
  currentContact: Contact = {
    name: '',
    td_designed: '',
    status: '',
  };
  saleModalContact: Contact | null = null;
  saleModalCotization: Quoter | null = null;
  saleFileCode = '';
  saleNotifyEmails = '';
  saleModalError = '';
  contacts: Contact[] = []
  //array kanban status
  wipContacts: Contact[] = [];
  holdContacts: Contact[] = [];
  soldContacts: Contact[] = [];
  lostContacts: Contact[] = [];


  selectedContact: Contact | null = null;
  filteredContacts: any[] = [];
  paginatedContacts: any[] = [];
  filterText: string = '';
  dropdownOpen: string | null = null;

  statuses = ['WIP', 'HOLD', 'SOLD', 'LOST'];
  launchInProgressQuoterId: string | null = null;
  reviewInProgressQuoterId: string | null = null;
  statusColors: { [key: string]: string } = {
    WIP: 'bg-blue-100', // Azul
    HOLD: 'bg-yellow-100', // Amarillo
    SOLD: 'bg-green-100', // Verde
    LOST: 'bg-red-100', // Rojo
  };


  getStatusClass(status: string): string {
    return this.statusColors[status] || 'bg-gray-100';
  }
  constructor(private router: Router, private route: ActivatedRoute) {
    effect(() => {
      const page = this.currentPage()
      const pageSize = this.itemsPerPage()
      this.fetchContacts(page, pageSize)
      console.log('Contacts fetched 4:', this.filteredContacts);

    }, { allowSignalWrites: true });
    effect(() => {
      this.updatePaginatedContacts();
    });
  }
  ngOnInit(): void {
    this.initFormCotact();
  }

  initFormCotact() {
    this.contactFormGroup = this.fb.group({
      name: ['', Validators.required],
      td_designed: ['', Validators.required],
      email: ['', Validators.email],
      phone: [''],
      source: [''],
      cotizations: this.fb.array<Quoter>([])  // Inicialmente vacío o con algún valor por defecto
    });
  }
  async fetchContacts(page: number, pageSize: number) {
    try {
      const result = await this.contactService.getContactsPaginated(page, pageSize);
      this.contacts = result.contacts
      this.filteredContacts = this.contacts;
      this.metodo();
      console.log('Contacts fetched:', this.filteredContacts);
      //this.updatePaginatedContacts();
      this.totalContacts.set(result.totalContacts)
    } catch (error) {
      console.error('Error fetching contacts', error);
    }
  }

  metodo() {
    this.wipContacts = this.filteredContacts.filter(c => c.status === 'WIP');
    this.holdContacts = this.filteredContacts.filter(c => c.status === 'HOLD');
    this.soldContacts = this.filteredContacts.filter(c => c.status === 'SOLD');
    this.lostContacts = this.filteredContacts.filter(c => c.status === 'LOST');
  }

  // Método para filtrar los contactos según el nombre
  async filterContacts() {

    this.currentPage.set(1);
    this.currentPage.set(1);
    this.metodo()
    try {
      const result = await this.contactService.getContactsPaginated(this.currentPage(), this.itemsPerPage(), this.filterText);
      this.contacts = result.contacts;
      this.filteredContacts = result.contacts;
      this.totalContacts.set(result.totalContacts);
      console.log('Contacts fetched 3:', this.filteredContacts);

      this.updatePaginatedContacts();
    } catch (error) {
      console.error('Error fetching filtered contacts:', error);
    }
  }

  // contactForm() {
  //   this.router.navigate([`../contact-form`], { relativeTo: this.route });
  // }

  // Método para eliminar un contacto
  async deleteContact(id: string) {
    try {
      await this.contactService.deleteContact(id);
      Swal.fire('Success', 'Record deleted', 'success')
      this.fetchContacts(this.currentPage(), this.itemsPerPage());
    } catch (error) {
      console.error('Error deleting contact', error);
    }
  }
  editQuoter(id: string) {
    console.log('id', id)
    this.router.navigate([`../quoter-v2-edit`, id], { relativeTo: this.route });
  }

  editQuoterVersion(cotization: Quoter) {
    if (!cotization.quoter_id) return;
    this.router.navigate([`../quoter-v2-edit`, cotization.quoter_id], { relativeTo: this.route });
  }

  async deleteQuoter(id: string, quoterModel: 'v1' | 'v2' = 'v2') {
    try {
      await this.quoterV2Service.deleteQuoter(id);
      Swal.fire('Success', 'Record deleted', 'success')
      this.fetchContacts(this.currentPage(), this.itemsPerPage());
    } catch (error) {
      console.error('Error deleting Quoter', error);
    }
  }

  async updateCotizationStatus(contactId: string, updatedCotization: any): Promise<void> {
    try {
      if (updatedCotization.status === 'SOLD') {
        return;
      }

      const contact = this.contacts.find((c) => c._id === contactId);

      if (updatedCotization?.quoter_id && contact?.soldQuoterId === updatedCotization.quoter_id) {
        await this.quoterV2Service.revertSale(updatedCotization.quoter_id, {
          targetStatus: updatedCotization.status,
          reason: `Quote reverted from SOLD to ${updatedCotization.status}`
        });
        await this.fetchContacts(this.currentPage(), this.itemsPerPage());
        toast.success(`Quote updated to ${updatedCotization.status}`);
        return;
      }

      const updatedCotizations = contact?.cotizations?.map((cotization: Quoter) =>
        cotization.quoter_id === updatedCotization.quoter_id
          ? { ...cotization, status: updatedCotization.status }
          : cotization);
      const soldQuoterId = updatedCotization.status === 'SOLD'
        ? updatedCotization.quoter_id
        : contact?.soldQuoterId;
      const payload: any = { cotizations: updatedCotizations };

      if (updatedCotization.status === 'SOLD') {
        payload.soldQuoterId = soldQuoterId;
      }

      if (updatedCotization.status !== 'SOLD' && contact?.soldQuoterId === updatedCotization.quoter_id) {
        payload.soldQuoterId = null;
      }

      const response = await this.contactService.updateContact(contactId, payload);
      this.contacts = this.contacts.map((item) => item._id === contactId ? response : item);
      this.filteredContacts = this.filteredContacts.map((item) => item._id === contactId ? response : item);
      this.metodo();
      toast.success(`Quote updated to ${updatedCotization.status}`);
    } catch (error) {
      console.error('Error al actualizar la cotización:', error);
      toast.error('Could not update quote status');
    }
  }

  isStatusOptionDisabled(contact: Contact, cotization: Quoter, status: string): boolean {
    if (status !== 'SOLD') return false;
    return cotization.status !== 'SOLD';
  }

  openConfirmSaleModal(contact: Contact, cotization: Quoter): void {
    if (!cotization?.quoter_id) return;

    this.saleModalContact = contact;
    this.saleModalCotization = cotization;
    this.saleFileCode = '';
    this.saleNotifyEmails = '';
    this.saleModalError = '';
    this.confirmSaleLoading.set(false);
    this.isConfirmSaleModalOpen.set(true);
  }

  closeConfirmSaleModal(): void {
    if (this.confirmSaleLoading()) {
      return;
    }

    this.isConfirmSaleModalOpen.set(false);
    this.saleModalContact = null;
    this.saleModalCotization = null;
    this.saleFileCode = '';
    this.saleNotifyEmails = '';
    this.saleModalError = '';
  }

  private parseNotifyEmails(rawValue: string): string[] {
    return String(rawValue || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
  }

  async submitConfirmSale(): Promise<void> {
    const quoterId = this.saleModalCotization?.quoter_id;
    if (!quoterId) return;

    const fileCode = String(this.saleFileCode || '').trim().toUpperCase();
    if (!fileCode) {
      this.saleModalError = 'File code is required';
      return;
    }

    if (!/^[A-Z0-9-]+$/.test(fileCode)) {
      this.saleModalError = 'Use only letters, numbers, and hyphen';
      return;
    }

    const notifyEmails = this.parseNotifyEmails(this.saleNotifyEmails);
    const invalidEmail = notifyEmails.find((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    if (invalidEmail) {
      this.saleModalError = `Invalid email: ${invalidEmail}`;
      return;
    }

    this.saleModalError = '';
    this.confirmSaleLoading.set(true);

    try {
      const response = await this.quoterV2Service.confirmSale(quoterId, { fileCode, notifyEmails });
      await this.fetchContacts(this.currentPage(), this.itemsPerPage());
      const notification = response?.notification;
      if (notification?.sent) {
        toast.success(`Sale confirmed and notification sent to ${notification.recipients.length} recipient(s)`);
      } else {
        toast.success('Sale confirmed successfully');
      }
      this.closeConfirmSaleModal();

      const bookingFileId = response?.bookingFile?._id;
      if (bookingFileId) {
        void this.router.navigate(['/dashboard/quoter-main/booking-files', bookingFileId]);
        return;
      }

      this.openBookingFileByQuoter(quoterId);
    } catch (error: any) {
      const backendMessage =
        error?.error?.error ||
        error?.error?.message ||
        error?.message ||
        'Error confirming sale';

      console.error('Error confirming sale', {
        backendMessage,
        status: error?.status,
        response: error?.error,
        raw: error
      });
      this.saleModalError = backendMessage;
    } finally {
      this.confirmSaleLoading.set(false);
    }
  }

  openBookingFileByQuoter(quoterId?: string): void {
    if (!quoterId) return;
    void this.router.navigate(['/dashboard/quoter-main/booking-files/by-quoter', quoterId]);
  }

  toggleDropdown(contactId: string) {
    this.dropdownOpen = this.dropdownOpen === contactId ? null : contactId;

  }

  async generatePDF(id: string) {
    const quoter = await this.quoterV2Service.getQuoterById(id)
    const dataURL = await this.pdfExportService.convertImageToDataURL('/images/image.png');

    const docDefinition = this.pdfExportService.generatePdf(quoter, dataURL);
    this.pdfExportService.exportPdf(docDefinition);

  }
  async generateExcel(id: string) {
    const quoter = await this.quoterV2Service.getQuoterById(id)
    this.excelService.downloadQuotationAsExcel(quoter, `${quoter.guest}`);

  }

  async generatePDFVersion(cotization: Quoter) {
    if (!cotization.quoter_id) return;
    await this.generatePDF(cotization.quoter_id);
  }

  async generateExcelVersion(cotization: Quoter) {
    if (!cotization.quoter_id) return;
    await this.generateExcel(cotization.quoter_id);
  }

  private escapeHtml(value: unknown): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private buildReviewHtml(result: any): string {
    const findings = Array.isArray(result?.findings) ? result.findings : [];
    const summary = result?.summary || {};
    const aiReview = result?.review_context?.ai_review || {};

    if (!findings.length) {
      return `
        <div class="text-left">
          <p><strong>Assessment:</strong> ${this.escapeHtml(summary.overall_assessment || 'No major issues found.')}</p>
          <p><strong>Risk level:</strong> ${this.escapeHtml(summary.risk_level || 'low')}</p>
          <p><strong>Agent review:</strong> ${aiReview.used ? `completed (${this.escapeHtml(aiReview.model || 'model')})` : `not completed${aiReview.error ? `: ${this.escapeHtml(aiReview.error)}` : ''}`}</p>
          <p style="margin-top:12px;">No inconsistencies were detected in this review.</p>
        </div>
      `;
    }

    const itemsHtml = findings.map((finding: any) => {
      const evidence = Array.isArray(finding?.evidence) ? finding.evidence : [];
      const evidenceHtml = evidence.length
        ? `<ul style="margin:8px 0 0 18px; padding:0;">${evidence.map((item: string) => `<li>${this.escapeHtml(item)}</li>`).join('')}</ul>`
        : '<p style="margin:8px 0 0 0;">No direct evidence provided.</p>';

      return `
        <div style="text-align:left; border:1px solid #e5e7eb; border-radius:12px; padding:12px; margin-top:12px;">
          <p style="margin:0 0 6px 0;"><strong>${this.escapeHtml(finding?.title || 'Finding')}</strong></p>
          <p style="margin:0;"><strong>Type:</strong> ${this.escapeHtml(finding?.type || 'general')}</p>
          <p style="margin:4px 0 0 0;"><strong>Severity:</strong> ${this.escapeHtml(finding?.severity || 'medium')} | <strong>Confidence:</strong> ${this.escapeHtml(finding?.confidence || 'medium')} | <strong>Source:</strong> ${this.escapeHtml(finding?.source || 'heuristic')}</p>
          <p style="margin:8px 0 0 0;">${this.escapeHtml(finding?.description || '')}</p>
          ${evidenceHtml}
          <p style="margin:8px 0 0 0;"><strong>Suggestion:</strong> ${this.escapeHtml(finding?.suggestion || 'Review this area manually.')}</p>
        </div>
      `;
    }).join('');

    return `
      <div class="text-left">
        <p><strong>Assessment:</strong> ${this.escapeHtml(summary.overall_assessment || 'Quote reviewed')}</p>
        <p><strong>Risk level:</strong> ${this.escapeHtml(summary.risk_level || 'medium')}</p>
        <p><strong>Findings:</strong> ${findings.length}</p>
        <p><strong>Agent review:</strong> ${aiReview.used ? `completed (${this.escapeHtml(aiReview.model || 'model')})` : `not completed${aiReview.error ? `: ${this.escapeHtml(aiReview.error)}` : ''}`}</p>
        ${itemsHtml}
      </div>
    `;
  }

  async reviewQuoterVersion(cotization: Quoter): Promise<void> {
    const quoterId = String(cotization?.quoter_id || '').trim();
    if (!quoterId || this.reviewInProgressQuoterId === quoterId) {
      return;
    }

    try {
      this.reviewInProgressQuoterId = quoterId;
      const result = await this.quoterV2Service.reviewQuoter(quoterId);

      await Swal.fire({
        title: result?.summary?.overall_assessment || 'Quote review',
        html: this.buildReviewHtml(result),
        width: 900,
        confirmButtonText: 'Close',
      });
    } catch (error: any) {
      console.error('Error reviewing quoter', error);
      toast.error(error?.error?.error || error?.error?.message || error?.message || 'Could not review this quoter');
    } finally {
      this.reviewInProgressQuoterId = null;
    }
  }

  async openInItineraryBuilder(cotization: Quoter): Promise<void> {
    const quoterId = String(cotization?.quoter_id || '').trim();
    if (!quoterId || this.launchInProgressQuoterId === quoterId) {
      return;
    }

    try {
      this.launchInProgressQuoterId = quoterId;
      //await this.launchAccessService.openItineraryBuilder(quoterId);
    } catch (error) {
      console.error('Error opening itinerary builder with quoter:', error);
      toast.error('Could not open Itinerary Builder for this quoter');
    } finally {
      this.launchInProgressQuoterId = null;
    }
  }
  openModal(contact: Contact) {
    this.isEdit.set(true);
    this.contactFormGroup.patchValue(contact);
    const cotizationsArray = this.contactFormGroup.get('cotizations') as FormArray;
    cotizationsArray.clear();
    contact.cotizations?.forEach(q => {
      this.cotizations.push(this.fb.group({
        name_version: [q.name_version, Validators.required],
        status: [q.status, Validators.required],
        quoter_id: [q.quoter_id]
      }));
    });
    this.selectedContact = contact;
    //this.isModalOpen.set(true);
    this.isModalAddContact.set(true);

  }
  openmodaladdcontact() {
    this.isEdit.set(false);
    this.isModalAddContact.set(true);
  }

  saveContact() {
    if (this.isEdit()) {
      this.updateContact()
      console.log(this.isEdit())
    } else {
      this.createContact()
    }
    this.closeModal();
    this.fetchContacts(this.currentPage(), this.itemsPerPage());
  }
  get cotizations(): FormArray {
    return this.contactFormGroup.get('cotizations') as FormArray;
  }
  closeModal() {

    this.isModalAddContact.set(false);
    this.contactFormGroup.reset();
    this.cotizations.clear();

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

  async createContact() {
    try {
      await this.contactService.createContact(this.contactFormGroup.value);
      this.isModalAddContact.set(false);
      this.closeModal();

      toast.success('Contact created successfully');
    } catch (error) {
      toast.error(`Error creating contact: ${error}`);
    }

  }

  async updateContact() {

    try {
      const updatedContact = { ...this.selectedContact, ...this.contactFormGroup.value };

      await this.contactService.updateContact(updatedContact._id, updatedContact);
      this.closeModal();
      toast.success('Contact updated successfully');
    } catch (error) {
      toast.error(`Error updating contact: ${error}`);
    }
  }
  updatePaginatedContacts() {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    this.paginatedContacts = this.filteredContacts.slice(startIndex, endIndex);
  }


  // inProgress: Contact[] = [{ _id: 'dwad', td_designed: 'dd', name: 'wdawdawd' },
  //  { _id: 'aaaa', td_designed: 'aaaa', name: 'aaaaaa' }
  //]

  inProgress: Contact[] = this.filteredContacts

  lost: Contact[] = []

  won: Contact[] = []

  async drop(event: CdkDragDrop<Contact[]>) {
    if (event.previousContainer === event.container) {
      /* Reordenar dentro de la MISMA columna */
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      /* Pasar la tarjeta a OTRA columna */
      transferArrayItem(
        event.previousContainer.data, // array origen
        event.container.data,         // array destino
        event.previousIndex,
        event.currentIndex
      );

      /* 2. Actualiza el campo status y lo envía a la API */
      const moved = event.container.data[event.currentIndex] as Contact;
      const newStatus = this.statusById(event.container.id);
      moved.status = newStatus;

      try {
        if (typeof moved._id === 'string') {
          await this.contactService.updateContact(moved._id, { status: newStatus });
        } else {
          throw new Error('Contact _id is missing or not a string');
        }
      } catch (err) {
        console.error('Error updating status', err);
        // TODO: revertir cambio si falla
      }
    }
  }

  trackById(index: number, item: Contact) {
    return item._id;
  }
  private statusById(id: string): 'WIP' | 'HOLD' | 'SOLD' | 'LOST' {
    switch (id) {
      case 'wipList':
        return 'WIP';
      case 'holdList':
        return 'HOLD';
      case 'soldList':
        return 'SOLD';
      case 'lostList':
        return 'LOST';
      default:
        throw new Error(`Unknown status for id: ${id}`);
    }
  }
}




