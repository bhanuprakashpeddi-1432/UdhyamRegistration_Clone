/**
 * OTP Service for handling OTP generation and sending
 */

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to mobile number (mock implementation)
 * In production, integrate with SMS gateway like Twilio, AWS SNS, etc.
 */
export async function sendOTP(mobileNumber: string, otp: string): Promise<boolean> {
  try {
    // Mock implementation - log the OTP for testing
    console.log(`📱 OTP for ${mobileNumber}: ${otp}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, replace with actual SMS service:
    // const response = await smsService.send({
    //   to: mobileNumber,
    //   message: `Your Udyam Registration OTP is: ${otp}. Valid for 10 minutes.`
    // });
    
    return true;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return false;
  }
}

/**
 * Validate OTP format
 */
export function isValidOTP(otp: string): boolean {
  return /^[0-9]{6}$/.test(otp);
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
