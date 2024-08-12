export interface SearchPayload {
  zipCode: string;
  radius: string;
  keyWord: string;
}

export interface Product {
  store: string;
  stock: string;
  id: number;
  title: string;
  price: string;
  brand: string;
};

interface PriceDetails {
  price: string;
  stock: string;
}

// PriceMatrix type
export interface PriceMatrix {
  [brand: string]: {
    [productName: string]: {
      [store: string]: PriceDetails[];
    };
  };
}

