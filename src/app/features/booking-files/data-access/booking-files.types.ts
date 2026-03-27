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
  section: string;
  title: string;
  detail?: string;
  city?: string;
  notes?: string;
  service_order_ids: string[];
  execution_status: string;
  area?: string;
  responsible?: string | null;
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
