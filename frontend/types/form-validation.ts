import { z } from 'zod';

export const step1Schema = z.object({
  aadhaarNumber: z.string().regex(/^[0-9]{12}$/, "Please enter a valid 12-digit Aadhaar number"),
  mobileNumber: z.string().regex(/^[6-9][0-9]{9}$/, "Please enter a valid 10-digit mobile number"),
  otp: z.string().regex(/^[0-9]{6}$/, "Please enter a valid 6-digit OTP")
});

export const step2Schema = z.object({
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please enter a valid PAN number (e.g., ABCDE1234F)"),
  enterpriseName: z.string().min(2, "Enterprise name must be at least 2 characters").max(100, "Enterprise name must not exceed 100 characters"),
  enterpriseType: z.string().min(1, "Please select enterprise type"),
  commencementDate: z.string().min(1, "Please select commencement date"),
  address: z.string().min(10, "Address must be at least 10 characters").max(500, "Address must not exceed 500 characters"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Please enter a valid 6-digit PIN code"),
  state: z.string().min(1, "Please select state"),
  district: z.string().min(1, "Please select district"),
  emailId: z.string().email("Please enter a valid email address").optional().or(z.literal(""))
});

export const udyamFormSchema = z.object({
  currentStep: z.number().min(1).max(2),
  isComplete: z.boolean().optional().default(false)
}).and(step1Schema).and(step2Schema);

export type UdyamFormData = z.infer<typeof udyamFormSchema>;
export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
