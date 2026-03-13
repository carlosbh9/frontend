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

export interface ServiceOrderAttachment {
  attachmentId: string;
  type: 'VOUCHER' | 'INVOICE' | 'PAYMENT_PROOF' | 'RESERVATION_CONFIRMATION' | 'TICKET' | 'PASSPORT_COPY' | 'OTHER';
  fileName: string;
  url?: string;
  storageKey?: string;
  contentType?: string;
  notes?: string;
  uploadedAt?: string;
  uploadedBy?: string | null;
}

export interface ServiceOrderFinancials {
  supplierName?: string;
  supplierReference?: string;
  currency?: string;
  expectedCost?: number;
  paidAmount?: number;
  paymentStatus?: 'NOT_REQUIRED' | 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  paymentMethod?: 'TRANSFER' | 'CASH' | 'CARD' | 'CHECK' | 'OTHER';
  paymentDueDate?: string | null;
  paymentDate?: string | null;
  invoiceNumber?: string;
  invoiceDate?: string | null;
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
  financials?: ServiceOrderFinancials;
  attachments?: ServiceOrderAttachment[];
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
