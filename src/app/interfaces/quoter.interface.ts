
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
    total_prices: TotalPrices;
  }

  interface TotalPrices {
    total_hoteles: number[];
    total_services: number[];
    total_cost: number[];
    external_utility:[];
    cost_external_taxes:number[];
    total_cost_external:number[];
    total_ext_operator: number[];
    total_ext_cruises: number[];
    total_flights: number[];
    subtotal: number[];
    cost_transfers: number[];
    final_cost: number[];
    price_pp: number[];
    porcentajeTD: number;
  }