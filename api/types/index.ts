export type {
  ApiEnvelope, ApiErrorShape, Paginated, AuthSession, User, Business, BusinessSummary, BusinessContext,
  Onboarding, Plan, Subscription, Entitlements, Product, Variant, Customer, Sale, SaleItem, Order, OrderStatus,
  Debt, DebtPayment, Expense, Notification, DashboardData, StorefrontTemplate, StorefrontHome, StorefrontBusiness,
  StorefrontProduct, StorefrontProductVariant, BuilderData, Receipt, Invoice, CartItem, StaffMember, UploadSignature,
  PaymentLinkResult, ChartPoint,
} from '~/types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  businessName: string;
  category: string;
  phone?: string;
  referral?: string;
}

export interface LoginPayload { email: string; password: string; }
export interface SaleLinePayload { productId: string; variantId?: string; quantity: number; unitPriceKobo?: number; }
export interface SalePayload {
  customerName?: string; customerPhone?: string; customerEmail?: string; customerId?: string;
  items: SaleLinePayload[]; discountKobo?: number; deliveryFeeKobo?: number; amountPaidKobo?: number;
  paymentMethod?: string; dueDate?: string; notes?: string; soldAt?: string; source?: string;
}
export interface OrderPayload {
  customerName: string; customerPhone: string; customerEmail?: string; deliveryAddress?: string;
  deliveryDetails?: string; items: SaleLinePayload[]; discountKobo?: number; deliveryFeeKobo?: number;
  amountPaidKobo?: number; paymentMethod?: string; dueDate?: string; createDebtNow?: boolean; notes?: string;
  source?: string; whatsappMessage?: string;
}
export interface ProductPayload {
  name: string; description?: string; category?: string; sku?: string; images?: string[]; tags?: string[];
  priceKobo?: number; costPriceKobo?: number; quantity?: number; lowStockThreshold?: number;
  variants?: { name?: string; sku?: string; attributes?: Record<string, string>; priceKobo: number; costPriceKobo: number; quantity: number; lowStockThreshold?: number; imageUrl?: string }[];
}
