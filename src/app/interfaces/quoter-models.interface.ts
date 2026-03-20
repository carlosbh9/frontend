export interface TravelDate {
  start: string;
  end: string;
}

export interface ServiceItem {
  _id?: string;
  city: string;
  name_service: string;
  type?: string;
  price_base: number;
  price: number;
  notes: string;
  day?: number;
  service_id?: string;
  service_type?: string;
  type_service?: string;
  operator_service_id?: string;
  train_service_id?: string;
  editService?: boolean;
  selected?: boolean;
}

export interface ServiceDay {
  _id?: string;
  day: number;
  date: string;
  number_paxs: number;
  children_ages: number[];
  isFixedLast?: boolean;
  services: ServiceItem[];
}

export interface HotelItem {
  day: number;
  date: string;
  city: string;
  name_hotel: string;
  price_base: number;
  price: number;
  accomodatios_category: string;
  notes: string;
}

export interface FlightItem {
  date: string;
  route: string;
  price_conf: number;
  price: number;
  notes: string;
}

export interface OperatorItem {
  country: string;
  name_operator: string;
  price: number;
  notes: string;
}

export interface CruiseItem {
  name: string;
  operator: string;
  price_conf: number;
  price: number;
  notes: string;
}

export interface TotalPrices {
  total_cost: number;
  external_utility: number;
  cost_external_taxes: number;
  total_cost_external: number;
  total_hoteles: number;
  total_services: number;
  total_ext_operator: number;
  total_ext_cruises: number;
  total_flights: number;
  subtotal: number;
  cost_transfers: number;
  final_cost: number;
  price_pp: number;
  porcentajeTD: number;
}

export interface Quoter {
  _id?: string;
  contact_id?: string;
  name_version: string;
  guest: string;
  destinations: string[];
  children_ages: number[];
  FileCode: string;
  travelDate: TravelDate;
  accomodations: string;
  totalNights: number | string;
  number_paxs: number;
  travel_agent: string;
  exchange_rate: string;
  services: ServiceDay[];
  hotels: HotelItem[];
  flights: FlightItem[];
  operators: OperatorItem[];
  cruises: CruiseItem[];
  total_prices: TotalPrices;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalculatedServicesPayload {
  alerts?: string[];
  day?: number;
  date: string;
  number_paxs: number;
  children_ages: number[];
  services: ServiceItem[];
  isFixedLast?: boolean;
}
