import { z } from 'zod';

// Validation schemas matching frontend
export const Step1Schema = z.object({
  aadhaarNumber: z.string().regex(/^[0-9]{12}$/, 'Invalid Aadhaar number'),
  mobileNumber: z.string().regex(/^[6-9][0-9]{9}$/, 'Invalid mobile number'),
  otp: z.string().regex(/^[0-9]{6}$/, 'Invalid OTP')
});

export const Step2Schema = z.object({
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number'),
  enterpriseName: z.string().min(2).max(100),
  enterpriseType: z.enum([
    'proprietorship',
    'partnership', 
    'llp',
    'pvt_ltd',
    'public_ltd',
    'cooperative',
    'trust',
    'society'
  ]),
  commencementDate: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid date'),
  address: z.string().min(10).max(500),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Invalid pincode'),
  state: z.string().min(1),
  district: z.string().min(1),
  emailId: z.string().email().optional().or(z.literal(''))
});

export const SubmissionSchema = z.object({
  step: z.number().int().min(1).max(2),
  data: z.union([Step1Schema, Step2Schema, Step1Schema.merge(Step2Schema)]),
  aadhaarNumber: z.string().regex(/^[0-9]{12}$/, 'Invalid Aadhaar number').optional()
});

export const OTPRequestSchema = z.object({
  aadhaarNumber: z.string().regex(/^[0-9]{12}$/, 'Invalid Aadhaar number'),
  mobileNumber: z.string().regex(/^[6-9][0-9]{9}$/, 'Invalid mobile number')
});

export const OTPVerifySchema = z.object({
  mobileNumber: z.string().regex(/^[6-9][0-9]{9}$/, 'Invalid mobile number'),
  otp: z.string().regex(/^[0-9]{6}$/, 'Invalid OTP')
});

// Type exports
export type Step1Data = z.infer<typeof Step1Schema>;
export type Step2Data = z.infer<typeof Step2Schema>;
export type SubmissionData = z.infer<typeof SubmissionSchema>;
export type OTPRequestData = z.infer<typeof OTPRequestSchema>;
export type OTPVerifyData = z.infer<typeof OTPVerifySchema>;

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

export interface SubmissionResponse {
  submissionId: string;
  currentStep: number;
  isComplete: boolean;
}

export interface OTPResponse {
  sent: boolean;
  expiresIn: number;
}

// Error types
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
