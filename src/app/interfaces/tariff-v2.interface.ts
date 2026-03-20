export type TariffItemType =
  | 'HOTEL'
  | 'ENTRANCE'
  | 'EXPEDITION'
  | 'EXPERIENCE'
  | 'EXTRA'
  | 'GUIDE'
  | 'RESTAURANT'
  | 'TRAIN'
  | 'TRANSPORT'
  | 'OPERATOR_SERVICE'
  | 'PROVIDER_ACTIVITY';

export type ProductCategory =
  | 'ACCOMMODATION'
  | 'TRANSFER'
  | 'ACTIVITY'
  | 'MEAL'
  | 'TRAIN'
  | 'GUIDE'
  | 'ENTRANCE'
  | 'EXTRA'
  | 'GROUND_OPERATOR'
  | 'OTHER';

export type PricingMode = 'PER_PERSON' | 'PER_GROUP' | 'PER_PAX_RANGE' | 'PER_ROOM' | 'PER_SEASON' | 'CUSTOM';
export type OccupancyType = 'SWB' | 'DWB' | 'TRP';
export type SeasonType = 'High' | 'Low' | 'Regular';
export type ChildPriceType = 'FIXED' | 'PER_PERSON' | 'DISCOUNT_PERCENT';
export type SpecialDateOperation = 'ADD' | 'REPLACE' | 'CLOSE';
export type VehicleType = 'Camioneta' | 'Van' | 'Sprinter' | 'MiniBus' | 'Bus' | 'Sin especificar';
export type TariffStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

export interface ChildPolicy {
  minAge?: number | null;
  maxAge?: number | null;
  priceType: ChildPriceType;
  value: number;
}

export interface SpecialDateRule {
  date: string;
  operation: SpecialDateOperation;
  value?: number | null;
  note?: string;
}

export interface ClosingDateRule {
  date: string;
  note?: string;
}

export interface PaxRangeRate {
  minPax: number;
  maxPax: number;
  price: number;
  vehicleType?: VehicleType;
}

export interface OccupancyRate {
  occupancy: OccupancyType;
  confidential: number;
  rack: number;
}

export interface RoomRate {
  roomName: string;
  occupancyRates: OccupancyRate[];
}

export interface SeasonRate {
  season: SeasonType;
  adultPrice: number;
  childPrice?: number | null;
  guidePrice?: number | null;
}

export interface VehicleRate {
  vehicleType: VehicleType;
  price: number;
}

export interface TariffContent {
  shortDescription?: string;
  description?: string;
  duration?: string;
  schedules?: string;
  remarks?: string;
  observations?: string;
  cancellationPolicy?: string;
  contactPhone?: string;
  nearbyPlaces?: string;
  generalInfo?: Record<string, any>;
}

export interface TariffValidity {
  year: string;
  dateFrom?: string | null;
  dateTo?: string | null;
  specialDates?: SpecialDateRule[];
  closingDates?: ClosingDateRule[];
}

export interface TariffPricing {
  mode: PricingMode;
  currency?: string;
  pricePerson?: boolean | null;
  basePrice?: number | null;
  soloTravelerPrice?: number | null;
  guidePrice?: number | null;
  ranges?: PaxRangeRate[];
  rooms?: RoomRate[];
  seasons?: SeasonRate[];
  vehicleRates?: VehicleRate[];
  custom?: Record<string, any> | null;
}

export interface TariffItemV2 {
  _id?: string;
  code?: string;
  name: string;
  provider?: string;
  type: TariffItemType;
  category: ProductCategory;
  subtype?: string;
  city?: string;
  location?: string;
  active: boolean;
  status: TariffStatus;
  tags?: string[];
  content?: TariffContent;
  pricing: TariffPricing;
  childPolicies?: ChildPolicy[];
  validity: TariffValidity;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface TariffV2ListResponse {
  items: TariffItemV2[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TariffV2OptionsResponse {
  types: TariffItemType[];
  categories: ProductCategory[];
  pricingModes: PricingMode[];
  statuses: TariffStatus[];
  occupancyTypes: OccupancyType[];
  seasonTypes: SeasonType[];
  childPriceTypes: ChildPriceType[];
  specialDateOperations: SpecialDateOperation[];
  vehicleTypes: VehicleType[];
  sortFields: string[];
}

export interface TariffV2FiltersResponse {
  providers: string[];
  cities: string[];
  years: string[];
  tags: string[];
}

export const TARIFF_V2_TYPE_RULES: Record<TariffItemType, { categories: ProductCategory[]; pricingModes: PricingMode[]; providerRequired?: boolean }> = {
  HOTEL: { categories: ['ACCOMMODATION'], pricingModes: ['PER_ROOM'] },
  ENTRANCE: { categories: ['ENTRANCE'], pricingModes: ['PER_PERSON', 'PER_GROUP'] },
  EXPEDITION: { categories: ['ACTIVITY'], pricingModes: ['PER_PERSON', 'PER_GROUP'] },
  EXPERIENCE: { categories: ['ACTIVITY'], pricingModes: ['PER_PAX_RANGE', 'PER_PERSON', 'PER_GROUP'] },
  EXTRA: { categories: ['EXTRA'], pricingModes: ['PER_PERSON', 'PER_GROUP'] },
  GUIDE: { categories: ['GUIDE'], pricingModes: ['PER_GROUP', 'PER_PERSON'] },
  RESTAURANT: { categories: ['MEAL'], pricingModes: ['PER_PERSON', 'PER_GROUP'] },
  TRAIN: { categories: ['TRAIN'], pricingModes: ['PER_SEASON'] },
  TRANSPORT: { categories: ['TRANSFER'], pricingModes: ['CUSTOM', 'PER_PAX_RANGE'] },
  OPERATOR_SERVICE: { categories: ['GROUND_OPERATOR', 'TRANSFER', 'ACTIVITY'], pricingModes: ['CUSTOM', 'PER_PAX_RANGE'] },
  PROVIDER_ACTIVITY: { categories: ['ACTIVITY', 'MEAL'], pricingModes: ['PER_PERSON', 'PER_GROUP'], providerRequired: true },
};
