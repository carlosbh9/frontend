import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingPublicService, PublicBookingLinkItem } from '../../Services/booking-public.service';
import { HttpErrorResponse } from '@angular/common/http';
import { BookingModalComponent } from './booking-modal/booking-modal.component';

type BookingLinkStatus = 'Active' | 'Expired' | 'Submitted' | 'Unknown';

interface BookingLinkTableItem {
  token: string;
  clientId: string;
  createdAt: string;
  expiresAt: string;
  status: BookingLinkStatus;
  url: string;
}

interface BookingSummaryItem {
  token: string;
  clientId: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  submitted?: boolean;
  submittedAt?: string | null;
  publicUrl?: string;
}
interface EditBookingFormState {
  token: string;
  clientId: string;
  status: 'active' | 'used' | 'revoked' | 'expired';
  expiresAt: string;
}

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, BookingModalComponent],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.css'
})
export class BookingFormComponent implements OnInit {
  clientReference = '';
  publicLink = '';
  linkCopied = false;
  linkError = '';
  isGeneratingLink = false;
  isLoadingLinks = false;
  linksError = '';
  copiedToken = '';
  generatedLinks: BookingLinkTableItem[] = [];

  all = signal<BookingSummaryItem[]>([]);
  itemsPerPage = signal(10);
  currentPage = signal(1);
  totalBookings = signal(0);
  selectedBooking = signal<any | null>(null);
  isViewModalOpen = signal(false);
  isViewLoading = signal(false);
  viewError = signal<string | null>(null);
  editError = signal<string | null>(null);
  isEditModalOpen = signal(false);
  editForm = signal<EditBookingFormState | null>(null);
  actionToken = signal<string | null>(null);
  isLoading = signal(false);
  error = signal('');
  filterClientId = signal('');
  filterToken = signal('');
  isSavingEdit = signal(false);

  constructor(
    private router: Router,
    private bookingPublicService: BookingPublicService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadSubmissions();
  }

  async generatePublicLink() {
    this.isGeneratingLink = true;
    this.linkError = '';

    try {
      const response = await this.bookingPublicService.createPublicLink(this.clientReference.trim(), 72);
      this.publicLink = this.resolvePublicUrl(
        response.publicUrl,
        response.token,
        response.clientId
      );
      this.linkCopied = false;
      this.currentPage.set(1);
      await this.loadSubmissions();
    } catch {
      this.linkError = 'Could not generate public link. Please try again.';
      this.publicLink = '';
    } finally {
      this.isGeneratingLink = false;
    }
  }

  async copyPublicLink() {
    if (!this.publicLink) return;

    try {
      await navigator.clipboard.writeText(this.publicLink);
      this.linkCopied = true;
    } catch {
      this.linkCopied = false;
    }
  }

  async copyLink(url: string, token: string) {
    try {
      await navigator.clipboard.writeText(url);
      this.copiedToken = token;
    } catch {
      this.copiedToken = '';
    }
  }

  openLink(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  getStatusClasses(status: string): string {
    if (status === 'used') return 'bg-emerald-100 text-emerald-800';
    if (status === 'expired') return 'bg-rose-100 text-rose-800';
    if (status === 'active') return 'bg-sky-100 text-sky-800';
    return 'bg-slate-100 text-slate-700';
  }

  // private async loadGeneratedLinks() {
  //   this.isLoadingLinks = true;
  //   this.linksError = '';

  //   try {
  //     const links = await this.bookingPublicService.getPublicLinks();
  //     this.generatedLinks = links
  //       .map((item) => this.mapToTableItem(item))
  //       .sort((a, b) => this.getTimeMs(b.createdAt) - this.getTimeMs(a.createdAt));
  //   } catch {
  //     this.generatedLinks = [];
  //     this.linksError = 'Could not load generated links.';
  //   } finally {
  //     this.isLoadingLinks = false;
  //   }
  // }

  async loadSubmissions(): Promise<void> {
      this.isLoading.set(true);
      this.error.set('');

      try {
        const result = await this.bookingPublicService.getPublicLinksPaginated(
          this.currentPage(),
          this.itemsPerPage(),
          this.filterClientId(),
          this.filterToken()
        );

        const mapped: BookingSummaryItem[] = (result.items || [])
          .map((item) => ({
            token: item.token,
            clientId: item.clientId || '-',
            status: item.status || 'unknown',
            createdAt: item.createdAt || new Date().toISOString(),
            expiresAt: item.expiresAt || '',
            submitted: !!item.submitted,
            submittedAt: item.submittedAt ?? null,
            publicUrl: item.publicUrl || ''
          }))
          .sort((a, b) => this.getTimeMs(b.createdAt) - this.getTimeMs(a.createdAt));

        this.totalBookings.set(result.total || 0);
        this.all.set(mapped);
      } catch {
        this.totalBookings.set(0);
        this.all.set([]);
        this.error.set('Could not load booking submissions.');
      } finally {
        this.isLoading.set(false);
      }
    }

  private mapToTableItem(item: PublicBookingLinkItem): BookingLinkTableItem {
    return {
      token: item.token,
      clientId: item.clientId || '-',
      createdAt: item.createdAt || '',
      expiresAt: item.expiresAt || '',
      status: this.resolveLinkStatus(item),
      url: this.resolvePublicUrl(item.publicUrl, item.token, item.clientId || '')
    };
  }

  private resolvePublicUrl(rawUrl: string | undefined, token: string, clientId: string): string {
    if (rawUrl && this.isValidPublicBookingUrl(rawUrl)) {
      return rawUrl;
    }
    return this.buildPublicUrl(token, clientId);
  }

  private isValidPublicBookingUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.pathname.includes('/booking-form-public/');
    } catch {
      return false;
    }
  }

  private resolveLinkStatus(item: PublicBookingLinkItem): BookingLinkStatus {
    const rawStatus = (item.status || '').toLowerCase();
    const isSubmittedByStatus = rawStatus.includes('submitted') || rawStatus.includes('used');
    const isExpiredByStatus = rawStatus.includes('expired');
    if (item.submitted || !!item.submittedAt || isSubmittedByStatus) return 'Submitted';
    if (isExpiredByStatus) return 'Expired';

    const expiresTime = this.getTimeMs(item.expiresAt || '');
    if (expiresTime > 0 && expiresTime < Date.now()) return 'Expired';
    if (expiresTime > 0 || !item.expiresAt) return 'Active';
    return 'Unknown';
  }

  private buildPublicUrl(token: string, clientId: string): string {
    const queryParams: Record<string, string> = {};
    if (clientId) {
      queryParams['clientId'] = clientId;
    }

    const tree = this.router.createUrlTree(['/booking-form-public', token], { queryParams });
    return `${window.location.origin}${this.router.serializeUrl(tree)}`;
  }

  private getTimeMs(dateString: string): number {
    if (!dateString) return 0;
    const parsedDate = Date.parse(dateString);
    return Number.isNaN(parsedDate) ? 0 : parsedDate;
  }



    async openViewModal(item: BookingSummaryItem): Promise<void> {
      this.isViewModalOpen.set(true);
      this.isViewLoading.set(true);
      this.viewError.set(null);
      this.selectedBooking.set(null);

      const token = (item?.token || '').trim();

      if (!token) {
        this.viewError.set('This row has no token. Check publicUrl/token extraction in backend list.');
        this.isViewLoading.set(false);
        return;
      }

      try {
        const detail = await this.bookingPublicService.getPublicLinkDetail(item.token);

        if (!detail?.submission) {
          this.viewError.set('This booking has no submission yet.');
          return;
        }

        this.selectedBooking.set({
          token: detail.token || item.token,
          clientId: detail.clientId || item.clientId,
          status: detail.status || item.status,
          createdAt: detail.createdAt || item.createdAt,
          expiresAt: detail.expiresAt || item.expiresAt,
          submittedAt: detail.submittedAt ?? item.submittedAt ?? null,
          publicUrl: detail.publicUrl || item.publicUrl,
          submission: detail.submission
        });
      } catch (e: any) {
        const err = e as HttpErrorResponse;

        if (err?.status === 401) this.viewError.set('Unauthorized (401). Check auth header/interceptor.');
        else if (err?.status === 403) this.viewError.set('Forbidden (403). Permission/auth issue.');
        else if (err?.status === 404) this.viewError.set('Not found (404). The detail endpoint/token hash may not match.');
        else if (err?.status === 410) this.viewError.set('Gone (410). Link expired/used (depending on backend).');
        else this.viewError.set(`Could not load submission detail. (${err?.status || 'unknown error'})`);
      } finally {
        this.isViewLoading.set(false);
      }
    }
  async onDelete(item: BookingSummaryItem): Promise<void> {
      const token = (item?.token || '').trim();
      if (!token || this.isRowBusy(token)) return;

      const confirmed = window.confirm(
        `Delete booking link for client "${item.clientId}"? This action cannot be undone.`
      );
      if (!confirmed) return;

      this.actionToken.set(token);
      try {
        await this.bookingPublicService.deletePublicLink(token);
        if (this.all().length === 1 && this.currentPage() > 1) {
          this.currentPage.set(this.currentPage() - 1);
        }
        await this.loadSubmissions();
      } catch {
        window.alert('Could not delete booking link.');
      } finally {
        this.actionToken.set(null);
      }
    }


  openEditModal(item: BookingSummaryItem): void {
    const token = (item?.token || '').trim();
    if (!token || this.isRowBusy(token)) return;

    const normalizedStatus = this.normalizeStatus(item.status);

    this.editForm.set({
      token,
      clientId: item.clientId === '-' ? '' : item.clientId,
      status: normalizedStatus,
      expiresAt: item.expiresAt || ''
    });

    this.editError.set(null);
    this.isEditModalOpen.set(true);
  }

  async saveEdit(): Promise<void> {
    const form = this.editForm();
    if (!form || this.isSavingEdit()) return;

    const token = form.token.trim();
    const clientId = form.clientId.trim();
    const status = form.status;
    const expiresAt = form.expiresAt.trim();

    if (!token) {
      this.editError.set('Token is required.');
      return;
    }

    if (!['active', 'used', 'revoked', 'expired'].includes(status)) {
      this.editError.set('Invalid status value.');
      return;
    }

    if (expiresAt && Number.isNaN(Date.parse(expiresAt))) {
      this.editError.set('Invalid expiresAt date. Example: 2026-12-31T23:59:59.000Z');
      return;
    }

    this.isSavingEdit.set(true);
    this.actionToken.set(token);
    this.editError.set(null);

    try {
      const payload: any = { clientId, status };
      if (expiresAt) payload.expiresAt = expiresAt;

      await this.bookingPublicService.updatePublicLink(token, payload);
      this.closeEditModal();
      await this.loadSubmissions();
    } catch {
      this.editError.set('Could not update booking link.');
    } finally {
      this.isSavingEdit.set(false);
      this.actionToken.set(null);
    }
  }

  closeEditModal(): void {
    if (this.isSavingEdit()) return;
    this.isEditModalOpen.set(false);
    this.editError.set(null);
    this.editForm.set(null);
  }


    updateEditField<K extends keyof EditBookingFormState>(field: K, value: EditBookingFormState[K]): void {
    const current = this.editForm();
    if (!current) return;
    this.editForm.set({ ...current, [field]: value });
  }
   isRowBusy(token: string): boolean {
    return this.actionToken() === token;
  }

   private normalizeStatus(raw: string): 'active' | 'used' | 'revoked' | 'expired' {
    const value = String(raw || '').toLowerCase().trim();
    if (value === 'active' || value === 'used' || value === 'revoked' || value === 'expired') {
      return value;
    }
    return 'active';
  }

  onFilterClientId(v: string) {
    this.filterClientId.set(v);
    this.currentPage.set(1);
    void this.loadSubmissions();
  }

  onFilterToken(v: string) {
    this.filterToken.set(v);
    this.currentPage.set(1);
    void this.loadSubmissions();
  }

  clearFilters(): void {
    this.filterClientId.set('');
    this.filterToken.set('');
    this.currentPage.set(1);
    void this.loadSubmissions();
  }

  get totalPages(): number {
    return Math.ceil(this.totalBookings() / this.itemsPerPage());
  }

  getPagesNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage()) {
      return;
    }
    this.currentPage.set(page);
    void this.loadSubmissions();
  }

  closeViewModal(): void {
    this.isViewModalOpen.set(false);
    this.isViewLoading.set(false);
    this.viewError.set(null);
    this.selectedBooking.set(null);
  }

  onPassportView(passportKey: string): void {
    void passportKey;
  }

  onPassportDownload(passportKey: string, passportFileName?: string): void {
    void passportKey;
    void passportFileName;
  }
}
