export interface Product {
  id: string;
  name: string;
  priceCents: number;
  image: string;
  rating: {
    stars: number;
    count: number;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  deliveryOption?: {
    priceCents: number;
  };
}



