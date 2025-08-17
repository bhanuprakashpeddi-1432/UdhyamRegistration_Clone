export interface FieldOption {
  value: string;
  text: string;
}

export interface ValidationRules {
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  phone?: boolean;
}

export interface FormField {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: ValidationRules;
  options?: readonly FieldOption[];
  value?: string;
  maxlength?: string;
  id?: string;
}

export interface FormStep {
  step: number;
  title: string;
  fields: FormField[];
}

export interface UdyamFormSchema {
  steps: FormStep[];
  validation_rules?: Record<string, any>;
  field_types?: Record<string, any>;
  labels?: Record<string, string>;
  placeholders?: Record<string, string>;
  options?: Record<string, any>;
}

export interface Step1FormData {
  aadhaarNumber: string;
  mobileNumber: string;
  otp: string;
}

export interface Step2FormData {
  panNumber: string;
  enterpriseName: string;
  enterpriseType: string;
  commencementDate: string;
  address: string;
  pincode: string;
  state: string;
  district: string;
  emailId?: string;
}

export interface UdyamFormData extends Step1FormData, Step2FormData {
  currentStep: number;
  isComplete: boolean;
}
