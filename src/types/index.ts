import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string | null;
    };
  }
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  category_id: number;
  user_id: string;
  status: string;
  views: number;
  created_at: string;
  updated_at: string;
  seller_name?: string;
  category_name?: string;
  images?: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  parent_id?: number | null;
}

export interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  listing_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
  listing_title?: string;
}
