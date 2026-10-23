export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'entrepreneur' | 'client' | 'partner' | 'moderator' | 'admin';
export type VerificationStatus = 'unverified' | 'in_review' | 'verified' | 'rejected';
export type JobStatus = 'draft' | 'in_moderation' | 'published' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  company_name?: string | null;
  headline?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  country: string;
  city?: string | null;
  currency: string;
  language: string;
  verification_status: VerificationStatus;
  skills: string[];
  completed_missions_count: number;
  average_rating: number;
  is_active: boolean;
  created_at: string;
}

export interface JobPost {
  id: string;
  client_id: string;
  category_id?: string | null;
  title: string;
  description: string;
  budget_amount: number;
  budget_currency: string;
  deadline?: string | null;
  location_mode: 'remote' | 'on_site' | 'hybrid';
  location_country: string;
  location_city?: string | null;
  skills_required: string[];
  status: JobStatus;
  created_at: string;
  profiles?: Profile;
}

export interface ServiceListing {
  id: string;
  user_id: string;
  category_id?: string | null;
  title: string;
  description: string;
  deliverables: string[];
  delivery_days: number;
  price_amount: number;
  price_currency: string;
  is_published: boolean;
  created_at: string;
  profiles?: Profile;
}

export interface Quote {
  id: string;
  entrepreneur_id: string;
  client_name: string;
  client_email?: string | null;
  client_phone?: string | null;
  quote_number: string;
  issue_date: string;
  valid_until: string;
  total_ht: number;
  tax_rate: number;
  total_ttc: number;
  currency: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  notes?: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  entrepreneur_id: string;
  contract_id?: string | null;
  client_name: string;
  client_email?: string | null;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total_ht: number;
  tax_rate: number;
  total_ttc: number;
  currency: string;
  status: InvoiceStatus;
  payment_method?: string | null;
  notes?: string | null;
  created_at: string;
}
