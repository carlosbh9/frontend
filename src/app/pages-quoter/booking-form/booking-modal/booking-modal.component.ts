import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

type Nullable<T> = T | null | undefined;

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-modal.component.html',
  styleUrl: './booking-modal.component.css'
})
export class BookingModalComponent {
  open = input<boolean>(false);
  loading = input<boolean>(false);
  error = input<string | null>(null);

  booking = input<any | null>(null);

  close = output<void>();
  passportView = output<{ passportKey: string }>();
  passportDownload = output<{ passportKey: string; passportFileName?: string }>();

  hasValue(value: Nullable<string>): boolean {
    return !!value && String(value).trim().length > 0;
  }

  display(value: Nullable<string>): string {
    return this.hasValue(value) ? String(value) : '-';
  }

  statusClasses = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'used') return 'bg-emerald-100 text-emerald-700 ring-emerald-200';
    if (s === 'expired') return 'bg-rose-100 text-rose-700 ring-rose-200';
    if (s === 'active') return 'bg-sky-100 text-sky-700 ring-sky-200';
    if (s === 'revoked') return 'bg-amber-100 text-amber-700 ring-amber-200';
    return 'bg-slate-100 text-slate-700 ring-slate-200';
  };

  guests = computed(() => this.booking()?.submission?.guests ?? []);
  dietary = computed(() => this.booking()?.submission?.dietaryGuests ?? []);
  rooms = computed(() => this.booking()?.submission?.rooms ?? []);
  physical = computed(() => this.booking()?.submission?.physicalGuests ?? []);
  restaurants = computed(() => this.booking()?.submission?.ownMadeReservations?.restaurants ?? []);
  internationalFlights = computed(() => this.booking()?.submission?.internationalFlights?.flights ?? []);
  domesticFlights = computed(() => {
    const arr = this.booking()?.submission?.ownMadeReservations?.domesticFlights ?? [];
    if (Array.isArray(arr) && arr.length) return arr;

    const legacy = this.booking()?.submission?.ownMadeReservations?.domesticFlight;
    return legacy ? [legacy] : [];
  });
  yourContactPeople = computed(() => this.booking()?.submission?.yourContact?.contacts ?? []);

  onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) this.close.emit();
  }

  onPassportView(passportKey: string) {
    this.passportView.emit({ passportKey });
  }

  onPassportDownload(passportKey: string, passportFileName?: string) {
    this.passportDownload.emit({ passportKey, passportFileName });
  }
}
