export type ServiceOrderArea = 'RESERVAS' | 'OPERACIONES' | 'CONTABILIDAD' | 'PAGOS';
export type ServiceOrderType = 'HOTEL' | 'TRANSPORT' | 'TOUR' | 'TICKETS' | 'PREPAYMENT' | 'INVOICE';
export type ServiceOrderStatus = 'PENDING' | 'IN_PROGRESS' | 'WAITING_INFO' | 'DONE' | 'CANCELLED';
export type ServiceOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ServiceOrderChecklistItem {
  itemId: string;
  label: string;
  status: 'PENDING' | 'DONE' | 'SKIPPED';
  doneAt?: string | null;
  doneBy?: string | null;
}

export interface ServiceOrderAuditLog {
  action: string;
  at: string;
  by?: string | null;
  message?: string;
  payload?: any;
}

export interface ServiceOrder {
  _id: string;
  contactId: string;
  soldQuoterId: string;
  sourceQuoterId: string;
  businessEventId: string;
  idempotencyKey: string;
  area: ServiceOrderArea;
  type: ServiceOrderType;
  status: ServiceOrderStatus;
  priority: ServiceOrderPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
  dependencies: Array<{ dependsOnOrderId: string; relation: 'BLOCKING' | 'RELATED' }>;
  checklist: ServiceOrderChecklistItem[];
  sourceSnapshot: any;
  accountingStatus?: 'NOT_REQUIRED' | 'PENDING_INVOICE' | 'INVOICED' | 'PARTIALLY_PAID' | 'PAID';
  auditLogs: ServiceOrderAuditLog[];
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceOrderListResponse {
  items: ServiceOrder[];
  total: number;
  page: number;
  pageSize: number;
  kpis?: {
    pending: number;
    inProgress: number;
    done: number;
    overdue: number;
  };
}

export interface ServiceOrderFilters {
  page?: number;
  pageSize?: number;
  area?: string;
  status?: string;
  type?: string;
  contactId?: string;
}

export interface ServiceOrderTemplate {
  _id?: string;
  type: ServiceOrderType;
  area: ServiceOrderArea;
  defaultPriority: ServiceOrderPriority;
  slaDays: number;
  blocking: boolean;
  checklistTemplate: Array<{ itemId: string; label: string }>;
}
