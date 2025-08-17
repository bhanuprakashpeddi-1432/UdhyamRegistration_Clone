import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format Aadhaar number with spaces for display
export function formatAadhaar(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 12); // Limit to 12 digits
  const match = cleaned.match(/^(\d{0,4})(\d{0,4})(\d{0,4})$/);
  if (match) {
    return [match[1], match[2], match[3]].filter(Boolean).join(' ');
  }
  return cleaned;
}

// Format PAN number to uppercase
export function formatPAN(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Format mobile number
export function formatMobile(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

// Format OTP
export function formatOTP(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6);
}

// Format pincode
export function formatPincode(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6);
}

// Clean functions - remove formatting for backend submission
export function cleanAadhaar(value: string): string {
  return value.replace(/\D/g, '');
}

export function cleanMobile(value: string): string {
  return value.replace(/\D/g, '');
}

export function cleanPAN(value: string): string {
  return value.replace(/[^A-Z0-9]/g, '');
}

export function cleanPincode(value: string): string {
  return value.replace(/\D/g, '');
}

export function cleanOTP(value: string): string {
  return value.replace(/\D/g, '');
}

// Validate field based on type
export function validateField(
  value: string,
  type: string,
  required: boolean = false
): { isValid: boolean; error?: string } {
  if (required && !value.trim()) {
    return { isValid: false, error: 'This field is required' };
  }

  if (!value.trim()) {
    return { isValid: true };
  }

  switch (type) {
    case 'aadhaar':
      if (!/^[0-9]{12}$/.test(value.replace(/\s/g, ''))) {
        return { isValid: false, error: 'Please enter a valid 12-digit Aadhaar number' };
      }
      break;
    
    case 'pan':
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
        return { isValid: false, error: 'Please enter a valid PAN number (e.g., ABCDE1234F)' };
      }
      break;
    
    case 'mobile':
      if (!/^[6-9][0-9]{9}$/.test(value)) {
        return { isValid: false, error: 'Please enter a valid 10-digit mobile number' };
      }
      break;
    
    case 'otp':
      if (!/^[0-9]{6}$/.test(value)) {
        return { isValid: false, error: 'Please enter a valid 6-digit OTP' };
      }
      break;
    
    case 'pincode':
      if (!/^[0-9]{6}$/.test(value)) {
        return { isValid: false, error: 'Please enter a valid 6-digit PIN code' };
      }
      break;
    
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return { isValid: false, error: 'Please enter a valid email address' };
      }
      break;
    
    case 'address':
      if (value.length < 10) {
        return { isValid: false, error: 'Address must be at least 10 characters long' };
      }
      if (value.length > 500) {
        return { isValid: false, error: 'Address must not exceed 500 characters' };
      }
      break;
    
    case 'enterpriseName':
      if (value.length < 2) {
        return { isValid: false, error: 'Enterprise name must be at least 2 characters long' };
      }
      if (value.length > 100) {
        return { isValid: false, error: 'Enterprise name must not exceed 100 characters' };
      }
      break;
    
    case 'enterpriseType':
      const validTypes = ['proprietorship', 'partnership', 'llp', 'pvt_ltd', 'public_ltd', 'cooperative', 'trust', 'society'];
      if (!validTypes.includes(value)) {
        return { isValid: false, error: 'Please select a valid enterprise type' };
      }
      break;
    
    case 'commencementDate':
      if (!value || isNaN(Date.parse(value))) {
        return { isValid: false, error: 'Please enter a valid date' };
      }
      break;
  }

  return { isValid: true };
}

// Debounce function for API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Mock API function for PIN code lookup
export async function fetchLocationByPincode(pincode: string): Promise<{
  state: string;
  district: string;
  city: string;
} | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data - in real implementation, use PostPin API or similar
  const mockData: Record<string, { state: string; district: string; city: string }> = {
    // Delhi
    '110001': { state: 'delhi', district: 'Central Delhi', city: 'New Delhi' },
    '110002': { state: 'delhi', district: 'Central Delhi', city: 'New Delhi' },
    '110005': { state: 'delhi', district: 'Central Delhi', city: 'New Delhi' },
    '110006': { state: 'delhi', district: 'Central Delhi', city: 'New Delhi' },
    '110051': { state: 'delhi', district: 'South West Delhi', city: 'New Delhi' },
    '110018': { state: 'delhi', district: 'South Delhi', city: 'New Delhi' },
    
    // Maharashtra
    '400001': { state: 'maharashtra', district: 'Mumbai', city: 'Mumbai' },
    '400002': { state: 'maharashtra', district: 'Mumbai', city: 'Mumbai' },
    '400020': { state: 'maharashtra', district: 'Mumbai', city: 'Mumbai' },
    '411001': { state: 'maharashtra', district: 'Pune', city: 'Pune' },
    '411014': { state: 'maharashtra', district: 'Pune', city: 'Pune' },
    
    // Karnataka
    '560001': { state: 'karnataka', district: 'Bangalore Urban', city: 'Bangalore' },
    '560002': { state: 'karnataka', district: 'Bangalore Urban', city: 'Bangalore' },
    '560025': { state: 'karnataka', district: 'Bangalore Urban', city: 'Bangalore' },
    '560100': { state: 'karnataka', district: 'Bangalore Urban', city: 'Bangalore' },
    
    // Tamil Nadu
    '600001': { state: 'tamil_nadu', district: 'Chennai', city: 'Chennai' },
    '600002': { state: 'tamil_nadu', district: 'Chennai', city: 'Chennai' },
    '600020': { state: 'tamil_nadu', district: 'Chennai', city: 'Chennai' },
    '641001': { state: 'tamil_nadu', district: 'Coimbatore', city: 'Coimbatore' },
    
    // West Bengal
    '700001': { state: 'west_bengal', district: 'Kolkata', city: 'Kolkata' },
    '700002': { state: 'west_bengal', district: 'Kolkata', city: 'Kolkata' },
    '700020': { state: 'west_bengal', district: 'Kolkata', city: 'Kolkata' },
    
    // Uttar Pradesh
    '201001': { state: 'uttar_pradesh', district: 'Ghaziabad', city: 'Ghaziabad' },
    '226001': { state: 'uttar_pradesh', district: 'Lucknow', city: 'Lucknow' },
    '282001': { state: 'uttar_pradesh', district: 'Agra', city: 'Agra' },
    
    // Gujarat
    '380001': { state: 'gujarat', district: 'Ahmedabad', city: 'Ahmedabad' },
    '395001': { state: 'gujarat', district: 'Surat', city: 'Surat' },
    
    // Rajasthan
    '302001': { state: 'rajasthan', district: 'Jaipur', city: 'Jaipur' },
    '342001': { state: 'rajasthan', district: 'Jodhpur', city: 'Jodhpur' },
    
    // Haryana
    '122001': { state: 'haryana', district: 'Gurgaon', city: 'Gurgaon' },
    '134001': { state: 'haryana', district: 'Ambala', city: 'Ambala' },
    
    // Punjab
    '140001': { state: 'punjab', district: 'Chandigarh', city: 'Chandigarh' },
    '141001': { state: 'punjab', district: 'Ludhiana', city: 'Ludhiana' },
  };
  
  return mockData[pincode] || null;
}
