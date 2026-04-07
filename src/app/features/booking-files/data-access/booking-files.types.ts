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
  number_paxs: number;
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

export type OperationalItineraryStatus = 'PENDING' | 'IN_PROGRESS' | 'READY';
export type OperationalItineraryItemType = 'SERVICE' | 'HOTEL' | 'FLIGHT' | 'OPERATOR' | 'CRUISE' | 'TRANSPORT' | 'EXPERIENCE';
export type OperationalItineraryAppliesToMode = 'ALL_PAX' | 'GROUP' | 'INDIVIDUAL';

export interface OperationalItineraryItemDetail {
  status: OperationalItineraryStatus;
  start_time?: string;
  end_time?: string;
  pickup_time?: string;
  meeting_point?: string;
  responsible_name?: string;
  supplier_name?: string;
  supplier_contact?: string;
  applies_to_mode?: OperationalItineraryAppliesToMode;
  applies_to_refs?: string[];
  notes?: string;
  completed_at?: string | null;
  completed_by?: string | null;
  updated_at?: string | null;
}

export interface OperationalItineraryItem {
  item_id: string;
  source_section: 'services' | 'hotels' | 'flights' | 'operators' | 'cruises';
  source_ref_id?: string;
  item_type: OperationalItineraryItemType;
  title: string;
  subtitle?: string;
  city?: string;
  sort_time?: string;
  detail: OperationalItineraryItemDetail;
}

export interface OperationalItineraryDay {
  day: number;
  date?: string;
  city?: string;
  status: OperationalItineraryStatus;
  items: OperationalItineraryItem[];
}

export interface OperationalItinerary {
  generated_from_snapshot_at?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
  completion_percentage: number;
  days: OperationalItineraryDay[];
}

export type FileOverallStatus = 'PENDING' | 'ACTIVE' | 'AT_RISK' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type FileAreaStatus = 'NOT_STARTED' | 'PENDING' | 'IN_PROGRESS' | 'PARTIAL' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED' | 'NOT_REQUIRED';
export type FileRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PassengerInfoStatusCode = 'NOT_SENT' | 'SENT' | 'IN_PROGRESS' | 'INCOMPLETE' | 'COMPLETED' | 'VALIDATED';

export interface BookingFilePassengerInfoStatus {
  status: PassengerInfoStatusCode;
  completion_percentage: number;
  missing_required_fields: string[];
  last_reminder_at?: string | null;
  reminder_count: number;
  validated_at?: string | null;
  validated_by?: string | null;
  notes?: string;
}

export interface BibliaDailyItem {
  file_id: string;
  contact_id?: string;
  fileCode: string;
  guest: string;
  travel_date_start?: string;
  travel_date_end?: string;
  overall_status: FileOverallStatus;
  risk_level: FileRiskLevel;
  next_action?: string;
  execution_date: string;
  day: number;
  item_id: string;
  section: string;
  time?: string;
  end_time?: string;
  pickup_time?: string;
  meeting_point?: string;
  title: string;
  detail?: string;
  city?: string;
  notes?: string;
  service_order_ids: string[];
  execution_status: string;
  detail_status: OperationalItineraryStatus | 'READY';
  area?: string;
  responsible?: string | null;
  supplier_name?: string;
  supplier_contact?: string;
  has_service_order?: boolean;
  observations?: string;
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
  operational_itinerary?: OperationalItinerary;
  overall_status: FileOverallStatus;
  operations_status: FileAreaStatus;
  reservations_status: FileAreaStatus;
  payments_status: FileAreaStatus;
  deliverables_status: FileAreaStatus;
  passenger_info_status?: BookingFilePassengerInfoStatus;
  owner_user_id?: string | null;
  risk_level: FileRiskLevel;
  next_action?: string;
  next_action_due_at?: string | null;
  last_activity_at?: string | null;
  is_cancelled?: boolean;
  cancel_reason?: string;
  cancelled_at?: string | null;
  service_order_ids: ServiceOrder[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
