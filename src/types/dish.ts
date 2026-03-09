export interface Dish {
  id: string;
  name: string;
  restaurant: string;
  restaurantId: string;
  cuisine: string;
  price: number;
  imageUrl: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    neighborhood: string;
  };
  sentiment: {
    overall: number;
    google: number | null;
    reddit: number | null;
    tiktok: number | null;
    yelp: number | null;
    summary: string;
  };
  trend: {
    direction: "rising" | "falling" | "stable" | "new";
    changePercent: number;
    weeklyMentions: number;
  };
  tags: string[];
  dietaryFlags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
  };
  cuisine: string[];
  hours: string;
  phone: string;
  orderLinks: {
    ubereats?: string;
    doordash?: string;
    resy?: string;
  };
}
