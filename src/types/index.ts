export type ServiceCategoryKey =
  | "coding"
  | "design"
  | "documents"
  | "hardware";

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  startPriceText: string;
  colorHeader: string;
  textColor?: string;
  items: string[];
}

export interface ServiceItem {
  id: string;
  categoryId: ServiceCategoryKey;
  title: string;
  categoryLabel: string;
  tagColor: string;
  description: string;
  priceRange: string;
  minPrice: number;
  maxPrice: number;
  estimatedDuration: string;
}

export type PricingMethod =
  | "per_unit"
  | "per_package"
  | "per_document"
  | "complexity_range"
  | "manual_quotation";

export interface CalculatorServiceConfig {
  id: string;
  categoryId: ServiceCategoryKey;
  title: string;
  description: string;
  pricingMethod: PricingMethod;
  unitName?: string;
  defaultQuantity?: number;
  minQuantity?: number;
  maxQuantity?: number;
  minPrice: number;
  maxPrice: number;
  packageLimit?: number;
  packageNote?: string;
  basePackageQuantity?: number;
  extraUnitPriceMin?: number;
  extraUnitPriceMax?: number;
  hasReferencesInput?: boolean;
  defaultReferences?: number;
  maxReferences?: number;
  baseIncludedReferences?: number;
  extraReferencePrice?: number;
  allowLearnPackage?: boolean;
  estimatedDuration: string;
  badgeLabel?: string;
  infoParams?: {
    label: string;
    placeholder: string;
    defaultValue?: string;
  }[];
}

export interface PriceCalculationResult {
  isManualQuotation: boolean;
  isInvalidDeadline?: boolean;
  baseMinPrice: number;
  baseMaxPrice: number;
  surchargePercent: number;
  deadlineSurchargePercent: number;
  afterHoursSurchargePercent: number;
  surchargeMinAmount: number;
  surchargeMaxAmount: number;
  learnPackageMinAmount: number;
  learnPackageMaxAmount: number;
  totalMinPrice: number;
  totalMaxPrice: number;
  requiresAdminApproval: boolean;
  isOutsidePackage: boolean;
  packageWarning?: string;
  priceRangeFormatted: string;
  deadlineTierLabel: string;
  afterHoursTierLabel: string;
  effectiveHoursRemaining?: number;
  effectiveStartTimeFormatted?: string;
  baseCalculationDetail?: string;
}

export interface CalculatorPrefillEventData {
  orderType: "task" | "hardware";
  categoryId: ServiceCategoryKey;
  serviceId: string;
  serviceTitle: string;
  quantity?: number;
  unitName?: string;
  referencesCount?: number;
  deadlineIso: string;
  deadlineFormatted: string;
  startTimePreference: StartTimePreference;
  requestedStartTime?: string;
  includeLearnPackage: boolean;
  priceEstimateText: string;
  surchargeSummaryText: string;
  infoNotes?: string;
}

export type OrderType = "digital_task" | "hardware_service";

export type OrderStatus =
  | "new_inquiry"
  | "under_review"
  | "quotation_sent"
  | "awaiting_dp"
  | "in_progress"
  | "awaiting_final_payment"
  | "revision"
  | "completed"
  | "cancelled";

export type StartTimePreference = "asap" | "specific_time" | "regular_hours";

export type PriorityStatus =
  | "normal"
  | "priority_pending_admin"
  | "priority_approved"
  | "priority_rejected";

export interface DigitalTaskOrderInput {
  customerName: string;
  customerContact: string;
  category: string;
  outputFormat: string;
  instructions: string;
  deadlineDate: string;
  includeLearnPackage: boolean;
  startTimePreference?: StartTimePreference;
  requestedStartTime?: string;
}

export interface HardwareServiceOrderInput {
  customerName: string;
  customerContact: string;
  issueDescription: string;
  laptopBrandModel: string;
  deliveryMethod: "drop_off" | "home_service";
  expectedCompletionDate: string;
  acceptsDataDisclaimer: boolean;
  startTimePreference?: StartTimePreference;
  requestedStartTime?: string;
}

export interface AdminOrder {
  id: string;
  order_code: string;
  order_type: OrderType;
  customer_name: string;
  customer_contact: string;
  service_category: string | null;
  format_output: string | null;
  instructions: string;
  deadline: string;
  include_learn_package: boolean;
  hardware_details?: {
    laptop_model?: string;
    issue?: string;
    delivery_method?: string;
    accepts_data_disclaimer?: boolean;
  };
  status: OrderStatus;
  total_price: number | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;

  // Priority & After-hours Fields
  requested_deadline?: string | null;
  requested_start_time?: string | null;
  start_time_preference?: StartTimePreference | null;
  deadline_surcharge_percent?: number | null;
  after_hours_surcharge_percent?: number | null;
  total_surcharge_percent?: number | null;
  priority_status?: PriorityStatus | null;
  priority_rejection_reason?: string | null;
  admin_adjustment_reason?: string | null;
}

export interface QuotationCalculationSnapshot {
  basePrice: number;
  deadlineSurchargePercent: number;
  deadlineSurchargeAmount: number;
  afterHoursSurchargePercent: number;
  afterHoursSurchargeAmount: number;
  capAdjustmentAmount: number; // Diskon penyesuaian jika kombinasi > 25%
  totalSurchargeAmount: number;
  finalPrice: number;
  dpAmount: number;
  finalAmount: number;
  adminCustomAdjustment?: {
    percentage?: number;
    amount?: number;
    reason: string;
  };
}

export interface QuotationRecord {
  id: string;
  order_id: string;
  quotation_number: string;
  total_amount: number;
  dp_amount: number;
  final_amount: number;
  items: QuotationCalculationSnapshot;
  valid_until?: string | null;
  status: "draft" | "sent" | "accepted" | "rejected";
  notes?: string | null;
  created_at: string;
}
