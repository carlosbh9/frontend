import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlightItem } from '../../../../interfaces/quoter-models.interface';

type FlightDraft = Omit<FlightItem, 'price'> & {
  price: number | string;
};

@Component({
  selector: 'app-flights',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flights-v2.component.html',
  styleUrl: './flights-v2.component.css'
})
export class FlightsV2Component implements OnInit {
  paxs = input.required<number>();
  @Input() flights: FlightItem[] = [];
  @Output() flightsChange = new EventEmitter<FlightItem[]>();
  @Output() totalPricesChange = new EventEmitter<number>();

  routes: { route: string, price: number }[] = [
    { route: 'LIM/CUZ', price: 210 },
    { route: 'CUZ/LIM', price: 210 },
    { route: 'LIM/PEM', price: 300 },
    { route: 'CUZ/PEM', price: 300 },
    { route: 'PEM/CUZ', price: 300 },
    { route: 'JUL/LIM', price: 300 },
    { route: 'CUZ/JUL', price: 300 },
    { route: 'CUZ/AQP', price: 210 },
    { route: 'AQP/LIM', price: 210 },
    { route: 'LIM/IQT', price: 210 },
    { route: 'IQT/LIM', price: 210 },
    { route: 'CUZ/UIO', price: 0 },
    { route: 'UIO/CUZ', price: 0 },
    { route: 'LIM/TRU', price: 210 },
    { route: 'TRU/LIM', price: 210 },
    { route: 'LIM/TYL', price: 210 },
    { route: 'TYL/LIM', price: 210 },
  ];
  selectedRoute: { route: string, price: number } = { route: '', price: 0 };

  originalItem: Record<number, FlightItem> = {};
  newFlight: FlightDraft = this.emptyFlight();

  ngOnInit(): void {}

  emptyFlight(): FlightDraft {
    return {
      date: '',
      route: '',
      price_base: 0,
      price: 0,
      notes: '',
      editFlight: false,
    };
  }

  onSubmitFlight() {
    if (this.selectedRoute.route && this.selectedRoute.price > 0) {
      const flightToAdd: FlightItem = {
        ...this.newFlight,
        route: this.selectedRoute.route,
        price_base: this.selectedRoute.price,
        price: this.selectedRoute.price * this.paxs(),
      };
      this.flights.push(flightToAdd);
      this.emitFlights();
      this.newFlight = this.emptyFlight();
    }
  }

  onEdit(item: FlightItem, index: number) {
    this.originalItem[index] = { ...item };
    item.editFlight = true;
    this.emitFlights();
  }

  onClose(item: FlightItem, index: number) {
    this.flights[index] = { ...this.originalItem[index] };
    item.editFlight = false;
    this.emitFlights();
  }

  onSave(item: FlightItem) {
    item.editFlight = false;
    this.originalItem = {};
    this.emitFlights();
  }

  onDelete(index: number) {
    this.flights.splice(index, 1);
    this.emitFlights();
  }

  private emitFlights() {
    this.flightsChange.emit(this.flights);
    this.totalPricesChange.emit(this.getTotalPrices());
  }

  getTotalPrices(): number {
    return this.flights.reduce((total, flight) => total + (Number(flight.price) || 0), 0);
  }
}
