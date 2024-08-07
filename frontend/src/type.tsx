export interface SearchPayload {
  zipCode: string;
  radius: string;
  keyWord: string;
}

export interface Product {
  store: string;
  stock: string;
  id: number;
  distance: string;
  price: string;
  brand: string;
};

export interface PriceEntry {
  price: string; 
  stock: string; 
}

export interface StoreData {
  prices: PriceEntry[];
  total: string; 
}

export interface PriceMatrix {
  [brand: string]: {
    [store: string]: StoreData;
  };
}

