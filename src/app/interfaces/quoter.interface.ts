
export interface Quoter {
    guest: string;
    FileCode: string;
    travelDate: {
      start: string;
      end: string;
    };
    accomodations: string;
    totalNights: number;
    number_paxs: number[];
    travel_agent: string;
    exchange_rate: string;
    services: any[];
    hotels: any[];
    flights: any[];
    operators: any[];
  }

