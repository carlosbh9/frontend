export type MasterQuoterV2Type = 'TEMPLATE' | 'TOUR_OPTION';
export type MasterQuoterV2Status = 'ACTIVE' | 'INACTIVE' | 'DRAFT';
export type MasterQuoterV2ItemPlacement = 'services' | 'options';

export interface MasterQuoterV2Item {
  _id?: string;
  placement: MasterQuoterV2ItemPlacement;
  tariffItemId: string;
  itemOrder?: number;
  title?: string;
  notes?: string;
  tariffSnapshot?: {
    name?: string;
    type?: string;
    category?: string;
    provider?: string;
    city?: string;
  };
  tariffItem?: any;
}

export interface MasterQuoterV2Day {
  _id?: string;
  dayNumber: number;
  city?: string;
  title?: string;
  notes?: string;
  items: MasterQuoterV2Item[];
}

export interface MasterQuoterV2Template {
  _id?: string;
  name: string;
  type: MasterQuoterV2Type;
  destinations?: string;
  totalDays: number;
  status: MasterQuoterV2Status;
  active: boolean;
  notes?: string;
  metadata?: Record<string, any>;
  days: MasterQuoterV2Day[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterQuoterV2ListResponse {
  items: MasterQuoterV2Template[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MasterQuoterV2OptionsResponse {
  types: MasterQuoterV2Type[];
  placements: MasterQuoterV2ItemPlacement[];
  statuses: MasterQuoterV2Status[];
  sortFields: string[];
}
