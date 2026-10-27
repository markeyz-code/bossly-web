export interface ApiEnvelope<T> { success: boolean; data: T; requestId?: string; }
export interface ApiErrorShape { code: string; message: string; details?: unknown; status?: number; }
export interface Paginated<T> { items: T[]; meta: { total: number; page: number; limit: number; pages: number; hasNext?: boolean; [key: string]: unknown }; }
export interface User {
  id: string; name: string; email: string; phone?: string | null; avatarUrl?: string | null;
  emailVerified: boolean; platformRole?: 'super_admin' | 'support' | null;
}
export interface BusinessSummary { id: string; name: string; slug: string; role: 'owner' | 'staff'; logoUrl?: string | null; category: string; storefrontPublished: boolean; }
export interface AuthSession {
  user: User; businesses: BusinessSummary[]; activeBusinessId: string | null;
  accessToken: string; refreshToken: string; expiresIn: number;
}
export type PlanKey = 'free' | 'hustle' | 'boss' | string;
export interface Entitlements {
  productLimit: number | null; staffSeats: number; customDomain: boolean; advancedReports: boolean;
  csvExport: boolean; pdfExport: boolean; embedWidget: boolean; whatsappBot: boolean;
  templates: string[]; receiptBranding: boolean; prioritySupport: boolean;
}
export interface Plan {
  id: string; key: string; name: string; description: string; priceMonthlyKobo: number; priceYearlyKobo: number;
  entitlements: Entitlements; trialDays: number; isDefault: boolean; isTrialPlan: boolean; marketingFeatures: string[];
}
export interface Subscription {
  planKey: PlanKey; status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired';
  trialEndsAt?: string | null; trialMilestoneOrders?: number; milestoneReachedAt?: string | null;
  currentPeriodEnd?: string | null; billingInterval?: 'monthly' | 'yearly'; couponCode?: string | null;
}
export interface Business {
  id: string; name: string; slug: string; ownerId: string; category: string; description: string;
  logoUrl?: string | null; bannerUrl?: string | null; heroVideoUrl?: string | null; storyImageUrl?: string | null; lookbookTitle?: string; lookbook?: { url: string; caption?: string }[]; tagline: string; brandColor: string; templateKey: string;
  sections: string[]; socialLinks: Record<string, string>; publicPhone?: string | null; whatsappNumber?: string | null;
  email?: string | null; address: string; about: string; storefrontPublished: boolean; publishedAt?: string | null;
  seoTitle: string; seoDescription: string; customDomain?: string | null; customDomainVerified: boolean;
  summarySettings: { dailyEnabled: boolean; weeklyEnabled: boolean; sendTime: string; weeklyDay: number; channels: { whatsapp: boolean; email: boolean } };
  alertSettings: Record<string, unknown>; isSuspended?: boolean; createdAt?: string;
}
export interface BusinessContext {
  business: Business; plan: Plan; subscription: Subscription | null; entitlements: Entitlements;
  usage: { products: number; productLimit: number | null; staff: number; staffSeats: number; ordersThisMonth: number; month: string };
  storefront: { path: string; subdomain: string; customDomain?: string | null; published: boolean };
}
export interface Onboarding { steps: { key: string; label: string; done: boolean; href: string }[]; completed: number; total: number; percent: number; complete: boolean; }
export interface Variant {
  id?: string; _id?: string; name: string; sku: string; attributes: Record<string, string>;
  priceKobo: number; costPriceKobo: number; quantity: number; lowStockThreshold: number;
  imageUrl?: string | null; isActive: boolean;
}
export interface Product {
  id: string; name: string; description: string; category: string; sku: string; images: string[]; tags: string[];
  variants: Variant[]; priceKobo: number; costPriceKobo: number; quantity: number; lowStockThreshold: number;
  isActive: boolean; soldCount: number; stockStatus?: 'healthy' | 'low' | 'out'; lowStockCount?: number;
  variantCount?: number; createdAt?: string;
}
export interface Customer {
  id: string; name: string; phone: string; email?: string | null; address: string; notes: string; tags: string[];
  totalSpentKobo: number; outstandingKobo: number; orderCount: number; lastPurchaseAt?: string | null; isActive: boolean;
}
export interface SaleItem {
  id?: string; productId: string; variantId?: string | null; name: string; variantName: string; sku: string;
  quantity: number; unitPriceKobo: number; unitCostKobo: number; discountKobo: number; lineTotalKobo: number;
  lineCostKobo: number; imageUrl?: string | null;
}
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export interface Sale {
  id: string; saleNumber: string; orderId?: string | null; customerId?: string | null; customerName: string;
  customerPhone: string; customerEmail?: string | null; items: SaleItem[]; subtotalKobo: number;
  discountKobo: number; deliveryFeeKobo: number; totalKobo: number; costKobo: number; grossProfitKobo: number;
  amountPaidKobo: number; paymentStatus: PaymentStatus; paymentMethod: string; debtId?: string | null;
  receiptId?: string | null; notes: string; source: string; soldAt: string; createdAt?: string;
}
export type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'delivered' | 'cancelled';
export interface Order {
  id: string; orderNumber: string; status: OrderStatus; source: string; customerId?: string | null;
  customerName: string; customerPhone: string; customerEmail?: string | null; deliveryAddress: string;
  deliveryDetails: string; items: SaleItem[]; subtotalKobo: number; discountKobo: number; deliveryFeeKobo: number;
  totalKobo: number; amountPaidKobo: number; paymentStatus: PaymentStatus; paymentMethod: string;
  debtId?: string | null; saleId?: string | null; receiptId?: string | null; notes: string; publicToken: string;
  history: { status: string; at: string; note?: string }[]; createdAt: string; whatsappMessage?: string;
}
export interface DebtPayment { amountKobo: number; method: string; reference?: string | null; note?: string | null; paidAt: string; }
export interface Debt {
  id: string; customerId: string; customerName: string; customerPhone?: string | null; customerEmail?: string | null;
  saleId?: string | null; orderId?: string | null; principalKobo: number; paidKobo: number; balanceKobo: number;
  dueDate: string; status: 'unpaid' | 'partial' | 'paid' | 'overdue'; displayStatus?: string;
  payments: DebtPayment[]; reminders: { channel: string; kind: string; sentAt: string }[]; notes: string;
  publicToken: string; daysOverdue?: number; createdAt: string;
}
export interface Expense {
  id: string; category: string; amountKobo: number; date: string; notes: string; receiptUrl?: string | null;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly'; recurrenceEndsAt?: string | null; nextOccurrenceAt?: string | null; createdAt: string;
}
export interface Notification {
  id: string; type: string; title: string; message: string; tone: 'info' | 'success' | 'warning' | 'danger';
  data: Record<string, unknown>; readAt?: string | null; createdAt: string;
}
export interface ChartPoint { date: string; revenueKobo: number; profitKobo: number; expensesKobo: number; sales: number; }
export interface DashboardData {
  range: { preset: string; from: string; to: string; label: string; human: string };
  summary: {
    revenueKobo: number; cogsKobo: number; expensesKobo: number; grossProfitKobo: number; profitKobo: number;
    salesCount: number; profitMargin: number;
    comparison: { revenuePercent: number; profitPercent: number; expensesPercent: number; salesPercent: number };
  };
  previousSummary: { revenueKobo: number; profitKobo: number; expensesKobo: number; salesCount: number };
  expensesByCategory: { category: string; totalKobo: number; count: number }[];
  chart: ChartPoint[];
  bestSellers: { productId: string; name: string; quantity: number; revenueKobo: number; profitKobo: number }[];
  slowMovers: { productId: string; name: string; stock: number; priceKobo: number; unitsSold: number; imageUrl?: string | null }[];
  debts: { outstandingKobo: number; count: number; overdueKobo: number; overdueCount: number };
  stock: { units: number; costValueKobo: number; retailValueKobo: number; potentialProfitKobo: number; lowStock: number; products: number };
  customers: { total: number; new: number };
  recentSales: Sale[];
  insights: string[];
  capabilities: { advancedReports: boolean; csvExport: boolean; pdfExport: boolean; planName: string };
}
export interface TemplateColors { ink: string; background: string; surface: string; primary: string; accent: string; muted: string; onPrimary: string; }
export interface StorefrontTemplate {
  key: string; name: string; description: string; vibe: string; colors: TemplateColors;
  fonts: { display: string; body: string }; layout: string; heroStyle: string; cardStyle: string;
  radius: string; motif: string; isPaid: boolean; available?: boolean;
}
export interface StorefrontBusiness {
  id: string; name: string; slug: string; category: string; description: string; logoUrl?: string | null;
  bannerUrl?: string | null; heroVideoUrl?: string | null; storyImageUrl?: string | null; lookbookTitle?: string; lookbook?: { url: string; caption?: string }[]; tagline: string; brandColor: string; templateKey: string; sections: string[];
  socialLinks: Record<string, string>; publicPhone?: string | null; whatsappNumber?: string | null;
  email?: string | null; address: string; about: string; seoTitle: string; seoDescription: string; currency: string;
}
export interface StorefrontProductVariant { id: string; name: string; attributes: Record<string, string>; priceKobo: number; imageUrl?: string | null; inStock: boolean; lowStock: boolean; }
export interface StorefrontProduct {
  id: string; name: string; description: string; category: string; images: string[]; tags: string[];
  priceKobo: number; variants: StorefrontProductVariant[]; inStock: boolean; soldCount: number; createdAt?: string;
}
export interface StorefrontHome {
  business: StorefrontBusiness; template: StorefrontTemplate; products: StorefrontProduct[];
  categories: string[]; productCount: number;
}
export interface BuilderData {
  business: Business; template: StorefrontTemplate; templates: StorefrontTemplate[];
  plan: { name: string; entitlements: Entitlements }; products: Product[]; productCount: number;
  urls: { path: string; subdomain: string; customDomain?: string | null; embedScript: string; orderLink: string; embedKey: string };
}
export interface Receipt {
  id: string; receiptNumber: string; customerName: string; customerEmail?: string | null; customerPhone: string;
  items: SaleItem[]; subtotalKobo: number; discountKobo: number; deliveryFeeKobo: number; totalKobo: number;
  amountPaidKobo: number; paymentMethod: string; publicToken: string; issuedAt: string;
}
export interface Invoice {
  id: string; invoiceNumber: string; customerName: string; customerEmail?: string | null; customerPhone: string;
  customerAddress: string; items: SaleItem[]; subtotalKobo: number; discountKobo: number; deliveryFeeKobo: number;
  totalKobo: number; dueDate: string; status: string; notes: string; publicToken: string; createdAt: string;
}
export interface CartItem { productId: string; variantId: string; name: string; variantName: string; priceKobo: number; imageUrl?: string | null; quantity: number; maxQuantity?: number; slug: string; }
export interface StaffMember {
  id: string; userId: string; role: 'owner' | 'staff'; permissions: string[]; status: string; joinedAt: string;
  user: { name: string; email: string; phone?: string | null; avatarUrl?: string | null; verified: boolean; lastLoginAt?: string | null } | null;
}
export interface UploadSignature {
  cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string; uploadUrl: string;
  maxBytes: number; allowedFormats: string[]; resourceType?: 'image' | 'video';
}
export interface PaymentLinkResult { reference: string; authorizationUrl: string; amountKobo: number; publicKey?: string | null; }

export interface AffiliatePayoutDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface AffiliateReferral {
  id: string;
  business: string;
  status: 'registered' | 'converted' | 'cancelled';
  commissionKobo: number;
  commissionStatus: 'none' | 'pending' | 'available' | 'paid';
  commissionAvailableAt?: string | null;
  convertedAt?: string | null;
  createdAt: string;
}

export interface AffiliatePayout {
  id: string;
  amountKobo: number;
  status: 'requested' | 'paid' | 'rejected';
  bankName: string;
  accountName: string;
  accountNumber: string;
  note?: string | null;
  reference?: string | null;
  processedAt?: string | null;
  createdAt: string;
}

export interface AffiliateOverview {
  code: string;
  link: string;
  commissionRate: number;
  holdDays: number;
  minimumPayoutKobo: number;
  stats: {
    referralCount: number;
    convertedCount: number;
    totalEarnedKobo: number;
    pendingKobo: number;
    availableKobo: number;
    payoutPendingKobo: number;
    paidKobo: number;
  };
  payoutDetails: { bankName: string | null; accountName: string | null; accountNumber: string | null };
  referrals: AffiliateReferral[];
  payouts: AffiliatePayout[];
}
