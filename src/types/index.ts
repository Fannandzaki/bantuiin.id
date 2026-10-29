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

export interface DigitalTaskOrderInput {
  customerName: string;
  customerContact: string; // WhatsApp or Email
  category: string;
  outputFormat: string;
  instructions: string;
  deadlineDate: string;
  includeLearnPackage: boolean;
}

export interface HardwareServiceOrderInput {
  customerName: string;
  customerContact: string;
  issueDescription: string;
  laptopBrandModel: string;
  deliveryMethod: "drop_off" | "home_service";
  expectedCompletionDate: string;
  acceptsDataDisclaimer: boolean;
}

