export interface Expedition {
    _id: string | null;
    name: string;
    price_pp: number;
    priceperson: boolean | null;
    remarks: string;
    year: string;
  }

export interface Operator {
    operador: string;
    ciudad: string;
    name_service: string;
    servicios: string[];
    observaciones: string;
    year: string;
}
