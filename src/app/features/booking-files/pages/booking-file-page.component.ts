import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingFilesApi } from '../data-access/booking-files.api';
import { BookingFile } from '../data-access/booking-files.types';

@Component({
  selector: 'app-booking-file-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './booking-file-page.component.html'
})
export class BookingFilePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(BookingFilesApi);

  readonly bookingFile = signal<BookingFile | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly contact = computed(() => this.bookingFile()?.contact_id as any);
  readonly quoter = computed(() => this.bookingFile()?.quoter_id as any);
  readonly orders = computed(() => this.bookingFile()?.service_order_ids || []);
  readonly itinerary = computed(() => this.bookingFile()?.itinerary_snapshot || {});

  readonly kpis = computed(() => {
    const orders = this.orders();
    return {
      total: orders.length,
      pending: orders.filter((order) => order.status === 'PENDING').length,
      inProgress: orders.filter((order) => order.status === 'IN_PROGRESS').length,
      done: orders.filter((order) => order.status === 'DONE').length
    };
  });

  readonly itineraryCards = computed(() => {
    const itinerary = this.itinerary();
    return [
      { label: 'Services', count: Array.isArray(itinerary.services) ? itinerary.services.length : 0 },
      { label: 'Hotels', count: Array.isArray(itinerary.hotels) ? itinerary.hotels.length : 0 },
      { label: 'Flights', count: Array.isArray(itinerary.flights) ? itinerary.flights.length : 0 },
      { label: 'Operators', count: Array.isArray(itinerary.operators) ? itinerary.operators.length : 0 },
      { label: 'Cruises', count: Array.isArray(itinerary.cruises) ? itinerary.cruises.length : 0 }
    ];
  });

  readonly itineraryLines = computed(() => {
    const itinerary = this.itinerary();
    const lines: Array<{ section: string; title: string; subtitle: string }> = [];

    (itinerary.services || []).forEach((group: any) => {
      (group?.services || []).forEach((service: any) => {
        lines.push({
          section: 'Service',
          title: service?.name_service || 'Unnamed service',
          subtitle: [group?.date, service?.city].filter(Boolean).join(' | ')
        });
      });
    });

    (itinerary.hotels || []).forEach((hotel: any) => {
      lines.push({
        section: 'Hotel',
        title: hotel?.name_hotel || 'Unnamed hotel',
        subtitle: [hotel?.date, hotel?.city, hotel?.accomodatios_category].filter(Boolean).join(' | ')
      });
    });

    (itinerary.flights || []).forEach((flight: any) => {
      lines.push({
        section: 'Flight',
        title: flight?.route || 'Unnamed flight',
        subtitle: [flight?.date, flight?.notes].filter(Boolean).join(' | ')
      });
    });

    (itinerary.operators || []).forEach((operator: any) => {
      lines.push({
        section: 'Operator',
        title: operator?.name_operator || 'Unnamed operator',
        subtitle: [operator?.city, operator?.country].filter(Boolean).join(' | ')
      });
    });

    (itinerary.cruises || []).forEach((cruise: any) => {
      lines.push({
        section: 'Cruise',
        title: cruise?.name || 'Unnamed cruise',
        subtitle: [cruise?.operator].filter(Boolean).join(' | ')
      });
    });

    return lines;
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id') || '';
    const quoterId = this.route.snapshot.paramMap.get('quoterId') || '';

    if (!id && !quoterId) {
      this.error.set('Booking file identifier is missing');
      this.bookingFile.set(null);
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      const bookingFile = id
        ? await this.api.getById(id)
        : await this.api.getByQuoter(quoterId);
      this.bookingFile.set(bookingFile);
    } catch (error: any) {
      this.bookingFile.set(null);
      this.error.set(error?.error?.message || 'Could not load booking file');
    } finally {
      this.loading.set(false);
    }
  }

  openServiceOrders(): void {
    const contactId = this.contact()?._id;
    if (!contactId) return;
    void this.router.navigate(['/dashboard/quoter-main/service-orders/contact', contactId]);
  }

  openQuote(): void {
    const quoterId = this.resolveId(this.quoter());
    if (!quoterId) return;
    void this.router.navigate(['/dashboard/quoter-main/quoter-edit', quoterId]);
  }

  private resolveId(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value._id || '';
  }
}
