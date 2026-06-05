/**
 * Wspólne typy domenowe (Mulbox.ch).
 * Trzymamy je w jednym miejscu, by widoki/serwisy nie duplikowały modelu.
 */

export type PlanType = "free" | "personal" | "business";
export type UserRole = "user" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan_type: PlanType;
  plan_expires_at: string | null;
  role: UserRole;
  created_at: string;
  stripe_customer_id?: string | null;
}

/** Pojedynczy "klocek" w wizualnym kreatorze. */
export interface FormField {
  id: string;
  type: "text" | "email" | "tel" | "textarea" | "number" | "date" | "file" | "select" | "checkbox";
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  /** Opcje listy wyboru (tylko dla type="select"). */
  options?: string[];
}

/** Konfiguracja formularza (JSONB w tabeli forms.config). */
export interface FormConfig {
  fields: FormField[];
  submit_label?: string;
  theme?: {
    primary?: string;
    background?: string;
  };
  /** Tryb landing page /p/[formId]. */
  formpage_enabled?: boolean;
  formpage_title?: string;
  formpage_description?: string;
  formpage_logo_url?: string;
  formpage_bg_color?: string;
  formpage_accent_color?: string;
  formpage_footer?: string;
  formpage_wide?: boolean;
  form_type?: "standard" | "brief";
}

export interface FormRecord {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  config: FormConfig;
  notification_email: string | null;
  redirect_url: string | null;
  recaptcha_site_key: string | null;
  recaptcha_secret_key: string | null;
  custom_email_template: string | null;
  autoresponder_enabled: boolean;
  autoresponder_subject: string | null;
  autoresponder_body: string | null;
  notification_signature: string | null;
  created_at: string;
}

export interface SubmissionRecord {
  id: string;
  form_id: string;
  data: Record<string, unknown>;
  sender_email: string | null;
  is_spam: boolean;
  created_at: string;
}
