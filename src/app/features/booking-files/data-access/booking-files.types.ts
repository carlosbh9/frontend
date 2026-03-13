import { ServiceOrder } from '../../service-orders/data-access/service-orders.types';

export interface BookingFileParty {
  _id: string;
  name?: string;
  guest?: string;
  email?: string;
  phone?: string;
  status?: string;
  soldAt?: string | null;
  booking_file_id?: string | null;
}

export interface BookingFilePaxSummary {
  number_paxs: number[];
  children_ages: number[];
}

export interface BookingFileSnapshot {
  services?: any[];
  hotels?: any[];
  flights?: any[];
  operators?: any[];
  cruises?: any[];
  total_prices?: any;
}

export interface BookingFile {
  _id: string;
  fileCode: string;
  quoter_id: string | BookingFileParty;
  contact_id: string | BookingFileParty;
  guest: string;
  travel_date_start?: string;
  travel_date_end?: string;
  destinations: string[];
  pax_summary: BookingFilePaxSummary;
  sales_snapshot: any;
  itinerary_snapshot: BookingFileSnapshot;
  operation_status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  reservation_status: 'PENDING' | 'PARTIAL' | 'CONFIRMED' | 'CANCELLED';
  payment_status: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED' | 'NOT_REQUIRED';
  service_order_ids: ServiceOrder[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
