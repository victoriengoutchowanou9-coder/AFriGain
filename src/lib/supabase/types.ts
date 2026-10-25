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

export type UserCategory = 'etudiant' | 'particulier' | 'prestataire' | 'artisan' | 'entreprise' | 'fournisseur';
export type IdentityVerificationStatus = 'documents_pending' | 'incomplete' | 'pending' | 'in_review' | 'verified' | 'rejected' | 'correction_needed';
export type ProfessionalVerificationStatus = 'not_applicable' | 'documents_pending' | 'pending' | 'verified' | 'rejected' | 'suspended';
export type AccountStatus = 'active' | 'suspended' | 'deactivated';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  category?: UserCategory | null;
  account_status?: AccountStatus;
  identity_status?: IdentityVerificationStatus;
  professional_status?: ProfessionalVerificationStatus;
  company_name?: string | null;
  trade_name?: string | null;
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
  updated_at?: string;

  // Données de vérification d'identité personnelle
  id_document_type?: string | null;
  id_document_number?: string | null;
  id_document_country?: string | null;
  id_card_front_url?: string | null;
  id_card_back_url?: string | null;
  id_portrait_url?: string | null;
  student_card_url?: string | null;

  // Données de vérification d'entreprise
  rccm_number?: string | null;
  ifu_number?: string | null;
  business_country?: string | null;
  business_address?: string | null;
  business_sector?: string | null;
  business_registration_url?: string | null;

  // Galerie d'activité de l'entreprise (maximum 5 photos)
  company_gallery_urls?: string[];

  // Motif de rejet ou demande de correction
  rejection_reason?: string | null;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  request_type: 'identity' | 'company' | 'student';
  status: IdentityVerificationStatus | ProfessionalVerificationStatus;
  admin_id?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at?: string | null;
  profiles?: Profile;
}

export interface FraudReport {
  id: string;
  reporter_id?: string | null;
  target_id: string;
  target_type: 'profile' | 'job' | 'mission' | 'product';
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  admin_id?: string | null;
  admin_notes?: string | null;
  created_at: string;
  resolved_at?: string | null;
}

export interface SupplierProduct {
  id: string;
  supplier_id: string;
  name: string;
  description: string;
  category: string;
  min_order_quantity: string;
  unit_price: number;
  currency: string;
  lead_time: string;
  gallery_urls: string[]; // Au moins 5 photos
  primary_image_index: number;
  is_available: boolean;
  created_at: string;
  updated_at?: string;
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
