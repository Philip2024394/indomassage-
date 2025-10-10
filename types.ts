
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

export interface Photo {
  url: string;
  name: string;
}

interface BasePartner {
  name: string;
  type: 'massage';
  sub_type: SubType;
  address: string;
  status: Status;
  rating: number;
  image_url: string;
  header_image_url: string;
  whatsapp: string;
  bio: string;
  massage_types: string[];
  prices: Price[];
}

export interface HomeServicePartner extends BasePartner {
  sub_type: SubType.HomeService;
  street: 'Home Service';
}

export interface PlacePartner extends BasePartner {
  sub_type: SubType.Place;
  street: string;
  opening_hours?: string;
  other_services?: string[];
  photos?: Photo[];
}

export type Partner = HomeServicePartner | PlacePartner;
