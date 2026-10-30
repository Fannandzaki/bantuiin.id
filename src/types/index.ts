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
}


