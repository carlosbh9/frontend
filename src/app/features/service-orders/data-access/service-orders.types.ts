export type ServiceOrderArea = 'RESERVAS' | 'OPERACIONES' | 'CONTABILIDAD' | 'PAGOS';
export type ServiceOrderType = 'HOTEL' | 'TRANSPORT' | 'TOUR' | 'TICKETS' | 'PREPAYMENT' | 'INVOICE';
export type ServiceOrderStatus = 'PENDING' | 'IN_PROGRESS' | 'WAITING_INFO' | 'DONE' | 'CANCELLED';
export type ServiceOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ServiceOrderChecklistStatus = 'PENDING' | 'DONE' | 'SKIPPED';
export type ServiceOrderStageStatus = 'PENDING' | 'ACTIVE' | 'DONE' | 'SKIPPED';

export interface ServiceOrderChecklistItem {
  itemId: string;
  label: string;
  required?: boolean;
  helpText?: string;
  status: ServiceOrderChecklistStatus;
  doneAt?: string | null;
  doneBy?: string | null;
}

export interface ServiceOrderStageSnapshot {
  code: string;
  label: string;
  description?: string;
  color?: string;
  order: number;
  isFinal?: boolean;
  requireCommentOnEnter?: boolean;
  requireCommentOnComplete?: boolean;
  requiredAttachments?: string[];
  status: ServiceOrderStageStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  checklist: ServiceOrderChecklistItem[];
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
  file_id?: string;
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
  workflowTemplateId?: string | null;
  workflowTemplateCode?: string;
  workflowTemplateName?: string;
  currentStageCode?: string;
  currentStageLabel?: string;
  stagesSnapshot?: ServiceOrderStageSnapshot[];
  dependencies: Array<{ dependsOnOrderId: string; relation: 'BLOCKING' | 'RELATED' }>;
  checklist: ServiceOrderChecklistItem[];
  sourceSnapshot: any;
  accountingStatus?: 'NOT_REQUIRED' | 'PENDING_INVOICE' | 'INVOICED' | 'PARTIALLY_PAID' | 'PAID';
  financials?: ServiceOrderFinancials;
  attachments?: ServiceOrderAttachment[];
  auditLogs: ServiceOrderAuditLog[];
  lastStatusChangeAt?: string | null;
  lastStageChangeAt?: string | null;
  completedAt?: string | null;
  completedBy?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  cancellationReason?: string;
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

export interface ServiceOrderTemplateChecklistItem {
  itemId: string;
  label: string;
  required?: boolean;
  helpText?: string;
}

export interface ServiceOrderTemplateStage {
  code: string;
  label: string;
  description?: string;
  color?: string;
  order: number;
  isFinal?: boolean;
  requireCommentOnEnter?: boolean;
  requireCommentOnComplete?: boolean;
  requiredAttachments?: string[];
  checklistTemplate: ServiceOrderTemplateChecklistItem[];
}

export interface ServiceOrderTemplate {
  _id?: string;
  code?: string;
  name: string;
  active?: boolean;
  isDefault?: boolean;
  type: ServiceOrderType;
  area: ServiceOrderArea;
  defaultPriority: ServiceOrderPriority;
  slaDays: number;
  blocking: boolean;
  defaultStageCode: string;
  stages: ServiceOrderTemplateStage[];
}
