export type Language = 'ar' | 'en';

export type BusinessId = 'foodoo-restaurant' | 'foodoo-cafe';

export type BusinessType = 'restaurant' | 'cafe';

export interface Business {
  id: BusinessId;
  nameAr: string;
  nameEn: string;
  type: BusinessType;
  locationAr: string;
  locationEn: string;
  descriptionAr: string;
  descriptionEn: string;
  categories: string[];
  isOpen: boolean;
  prepTimeMinutes: number;
  minOrderSar: number;
  deliveryFeeSar: number;
  isDemoData: boolean;
  managerUid: string;
  updatedAt?: unknown;
}

export interface Product {
  id: string;
  businessId: BusinessId;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: string;
  priceSar: number;
  calories: number;
  imageKey: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isDemoData: boolean;
  customizationLabelAr: string;
  customizationLabelEn: string;
  customizationOptions: string[];
  updatedAt?: unknown;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedOption: string;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type FulfillmentType = 'pickup' | 'delivery';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  merchantUid: string;
  customerName: string;
  customerPhone: string;
  businessId: BusinessId;
  businessNameAr: string;
  businessNameEn: string;
  fulfillmentType: FulfillmentType;
  deliveryAddress: string;
  notes: string;
  paymentMethod: 'DEMO_PAYMENT_ONLY';
  itemsSummary: string[];
  itemsCount: number;
  subtotalSar: number;
  deliveryFeeSar: number;
  totalSar: number;
  status: OrderStatus;
  squadId: string;
  squadName: string;
  squadPointAwarded: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type SquadCategory = 'Office' | 'University' | 'Friends' | 'Family';

export interface Squad {
  id: string;
  name: string;
  category: SquadCategory;
  description: string;
  inviteCode: string;
  creatorId: string;
  creatorName: string;
  memberCount: number;
  weeklyPoints: number;
  totalPoints: number;
  weeklyGoal: number;
  isActive: boolean;
  isDemoData: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SquadMember {
  userId: string;
  squadId: string;
  displayName: string;
  role: 'captain' | 'member';
  pointsContributed: number;
  joinedAt?: unknown;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  activeSquadId: string;
  assignedBusinessId: '' | BusinessId;
  completedOrdersCount: number;
  squadPointsContributed: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface UserPrivate {
  uid: string;
  email: string;
  phone: string;
  defaultAddress: string;
  updatedAt?: unknown;
}
