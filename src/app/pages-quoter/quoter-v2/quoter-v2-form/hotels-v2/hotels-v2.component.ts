import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { TariffV2Service } from '../../../../Services/tariff-v2.service';
import { OccupancyRate, RoomRate, TariffItemV2 } from '../../../../interfaces/tariff-v2.interface';

type RateType = 'confidential' | 'rack';
type PriceSource = 'tariff' | 'manual';

@Component({
  selector: 'app-hotels-v2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotels-v2.component.html',
  styleUrl: './hotels-v2.component.css',
})
export class HotelsV2Component implements OnInit {
  private readonly tariffV2Service = inject(TariffV2Service);

  @Output() hotelsChange = new EventEmitter<any[]>();
  @Output() totalPricesChange = new EventEmitter<number[]>();

  @Input() hotels: any[] = [];
  number_paxs = input<number[]>([]);
  children_ages = input<number[]>([]);

  hotelCatalog: TariffItemV2[] = [];
  filteredHotels: TariffItemV2[] = [];
  availableCities: string[] = [];
  roomOptions: RoomRate[] = [];
  occupancyOptions: OccupancyRate[] = [];

  searchTerm = '';
  cityFilter = '';
  selectedHotelId = '';
  selectedHotel: TariffItemV2 | null = null;
  selectedRoomName = '';
  selectedOccupancy = '';
  selectedRateType: RateType = 'confidential';
  priceSource: PriceSource = 'tariff';
  manualPrice: number | null = null;
  showResults = false;

  newHotel: any = {
    day: '',
    date: '',
    city: '',
    notes: '',
  };

  editingIndex: number | null = null;
  editingSnapshot: any = null;

  ngOnInit(): void {
    this.loadHotelCatalog();
  }

  private toDayNumber(value: any): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private sortHotelsAscending(hotels: any[]) {
    return [...hotels].sort((left, right) => this.toDayNumber(left.day) - this.toDayNumber(right.day));
  }

  private emitHotels() {
    const sortedHotels = this.sortHotelsAscending(this.hotels);
    this.hotelsChange.emit(sortedHotels);
    this.totalPricesChange.emit([this.getTotalHotelsPrice(sortedHotels)]);
  }

  getTotalHotelsPrice(hotels: any[] = this.hotels): number {
    return hotels.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  }

  private getSelectedRoomRate(): OccupancyRate | null {
    return this.occupancyOptions.find((item) => item.occupancy === this.selectedOccupancy) || null;
  }

  getSelectedTariffPrice(): number {
    const roomRate = this.getSelectedRoomRate();
    if (!roomRate) return 0;
    return Number(roomRate[this.selectedRateType]) || 0;
  }

  getPreviewFinalPrice(): number {
    if (this.priceSource === 'manual') {
      return Number(this.manualPrice) || 0;
    }
    return this.getSelectedTariffPrice();
  }

  getHotelRestrictions(): string[] {
    return [
      'Hotels do not calculate automatically by pax in V2.',
      'The final hotel price comes from the selected tariff rate or from a manual negotiated override.',
      'Confirm room, occupancy and supplier rate before saving.',
    ];
  }

  getAddHotelIssues(): string[] {
    const issues: string[] = [];

    if (!this.selectedHotelId || !this.selectedHotel) issues.push('Select a hotel from tariff-v2.');
    if (!this.newHotel.date) issues.push('Select the hotel date.');
    if (!this.toDayNumber(this.newHotel.day)) issues.push('Day must be greater than 0.');
    if (!this.selectedRoomName) issues.push('Choose a room.');
    if (!this.selectedOccupancy) issues.push('Choose an occupancy type.');

    if (this.priceSource === 'manual' && !(Number(this.manualPrice) > 0)) {
      issues.push('Enter a manual final price greater than 0.');
    }

    if (this.priceSource === 'tariff' && !(this.getSelectedTariffPrice() > 0)) {
      issues.push('The selected room does not have a usable tariff price.');
    }

    return issues;
  }

  async loadHotelCatalog() {
    try {
      const response = await this.tariffV2Service.listItems({
        page: 1,
        limit: 100,
        active: true,
        type: 'HOTEL',
        category: 'ACCOMMODATION',
        sortBy: 'name',
        sortDir: 'asc',
      });

      this.hotelCatalog = response.items || [];
      this.filteredHotels = this.hotelCatalog;
      this.availableCities = [...new Set(this.hotelCatalog.map((item) => item.city).filter(Boolean) as string[])].sort();
    } catch (error) {
      console.error(error);
      toast.error('Error loading tariff-v2 hotels');
    }
  }

  applyFilters() {
    const search = this.searchTerm.toLowerCase().trim();
    this.filteredHotels = this.hotelCatalog.filter((item) => {
      if (this.cityFilter && item.city !== this.cityFilter) return false;
      if (!search) return true;
      const haystack = [item.name, item.city, item.provider, item.subtype].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(search);
    });
  }

  onSearchFocus() {
    this.applyFilters();
    this.showResults = true;
  }

  onSearchBlur() {
    setTimeout(() => {
      this.showResults = false;
    }, 200);
  }

  selectHotel(item: TariffItemV2) {
    this.selectedHotelId = item._id || '';
    this.selectedHotel = item;
    this.searchTerm = item.name;
    this.newHotel.city = item.city || this.newHotel.city || '';
    this.roomOptions = item.pricing.rooms || [];
    this.selectedRoomName = this.roomOptions[0]?.roomName || '';
    this.onRoomChange();
    this.showResults = false;
  }

  onRoomChange() {
    const room = this.roomOptions.find((item) => item.roomName === this.selectedRoomName);
    this.occupancyOptions = room?.occupancyRates || [];
    this.selectedOccupancy = this.occupancyOptions[0]?.occupancy || '';
  }

  clearSelection() {
    this.selectedHotelId = '';
    this.selectedHotel = null;
    this.searchTerm = '';
    this.selectedRoomName = '';
    this.selectedOccupancy = '';
    this.selectedRateType = 'confidential';
    this.priceSource = 'tariff';
    this.manualPrice = null;
    this.roomOptions = [];
    this.occupancyOptions = [];
    this.applyFilters();
  }

  addHotel() {
    const issues = this.getAddHotelIssues();
    if (issues.length) {
      toast.warning(issues[0]);
      return;
    }

    const dayNumber = this.toDayNumber(this.newHotel.day);
    const tariffPrice = this.getSelectedTariffPrice();
    const finalPrice = this.getPreviewFinalPrice();
    const selectedHotel = this.selectedHotel;

    if (!selectedHotel) {
      toast.warning('Select a hotel from tariff-v2.');
      return;
    }

    this.hotels.push({
      day: dayNumber,
      date: this.newHotel.date,
      city: this.newHotel.city || selectedHotel.city || '',
      name_hotel: selectedHotel.name,
      price_base: tariffPrice,
      price: finalPrice,
      accomodatios_category: `${this.selectedRoomName || 'Room'} - ${this.selectedOccupancy || 'Rate'}`,
      notes: this.newHotel.notes || '',
      tariff_item_id: this.selectedHotelId,
      placement: 'services',
      room_name: this.selectedRoomName,
      occupancy: this.selectedOccupancy,
      room_rate_type: this.selectedRateType,
      price_source: this.priceSource,
    });

    this.hotels = this.sortHotelsAscending(this.hotels);
    this.emitHotels();
    this.newHotel = {
      day: '',
      date: this.newHotel.date,
      city: '',
      notes: '',
    };
    this.clearSelection();
    toast.success('Hotel added');
  }

  onDelete(index: number) {
    this.hotels.splice(index, 1);
    this.hotels = this.sortHotelsAscending(this.hotels);
    this.emitHotels();
  }

  onEdit(index: number) {
    this.editingIndex = index;
    this.editingSnapshot = { ...this.hotels[index] };
  }

  onCancelEdit(index: number) {
    if (this.editingSnapshot) {
      this.hotels[index] = { ...this.editingSnapshot };
    }
    this.editingIndex = null;
    this.editingSnapshot = null;
  }

  onSaveEdit(index: number) {
    this.hotels[index].day = this.toDayNumber(this.hotels[index].day);
    this.hotels = this.sortHotelsAscending(this.hotels);
    this.editingIndex = null;
    this.editingSnapshot = null;
    this.emitHotels();
    toast.success('Hotel updated');
  }
}
