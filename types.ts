export enum SubType {
  HomeService = 'home_service',
  Place = 'place',
}

export enum Status {
  Online = 'online',
  Offline = 'offline',
  Busy = 'busy',
}

export interface Price {
  duration: number;
  price: number;
}

interface BasePartner {
  id?: string;
  user_id?: string;
  name: string;
  type: 'massage';
  sub_type: SubType;
  location: string;
  status: Status;
  image_url: string;
  header_image_url: string;
  whatsapp: string;
  bio: string;
  massage_types: string[];
  prices: Price[];
  booked_dates?: string[];
  gallery_image_urls?: string[];
}

export interface HomeServicePartner extends BasePartner {
  sub_type: SubType.HomeService;
  years_of_experience?: number;
  id_card_image_url?: string;
  is_verified?: boolean;
}

// FIX: Added PlacePartner interface for business/spa locations.
export interface PlacePartner extends BasePartner {
  sub_type: SubType.Place;
}

// FIX: Updated Partner to be a union type to support both home service and place partners.
export type Partner = HomeServicePartner | PlacePartner;
