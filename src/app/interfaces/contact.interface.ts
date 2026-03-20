export interface Quoter {
    name_version: string;
    status: 'WIP' | 'HOLD' | 'SOLD' | 'LOST';
    quoter_id?: string;
    quoter_model?: 'v1' | 'v2';
    createQuoter?: Date; // Added to track the creator of the quoter
  }

export interface Contact {
    _id?: string;
    name: string;
    status:string; // 'WIP', 'HOLD', 'SOLD', 'LOST'
    td_designed: string;
    soldQuoterId?: string | null;
    email?: string;
    phone?: string;
    source?: string;
    cotizations?: Quoter[];
  }
