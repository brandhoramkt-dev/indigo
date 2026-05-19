export type Category = string;

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  available: boolean;
  hasMilkOptions?: boolean;
  hasTemperatureOptions?: boolean;
  imageUrl?: string;
  updatedAt?: any;
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  publishedAt: any;
}

export interface Reservation {
  id: string;
  spotId: string;
  customerName: string;
  customerEmail?: string;
  date: string;
  time: string;
  pax: number;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: any;
}

export interface Admin {
  id: string;
  email: string;
  role: string;
}

export interface CartItem extends Product {
  uniqueId: string;
  selectedTemp?: "Caliente" | "Frío";
  selectedMilk?: string;
  selectedFlavor?: string;
  finalPrice: number;
}
