export interface Quoter {
    name_version: string;
    status: 'WIP' | 'HOLD' | 'SOLD' | 'LOST';
    quoter_id?: string;
  }

export interface Contact {
    _id?: string;
    name: string;
    td_designed: string;
    email?: string;
    phone?: string;
    source?: string;
    cotizations?: Quoter[];
  }
