import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  SubmissionSchema, 
  OTPRequestSchema, 
  OTPVerifySchema,
  ValidationError,
  NotFoundError,
  APIResponse,
  SubmissionResponse,
  OTPResponse,
  Step1Data,
  Step2Data
} from '@/types';
import { generateOTP, sendOTP } from '@/services/otpService';
import { auditLog } from '@/services/auditService';

const prisma = new PrismaClient();

export class UdyamController {
  
  /**
   * Submit form data for a specific step
   */
  async submitForm(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = SubmissionSchema.parse(req.body);
      const { step, data } = validatedData;
      
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      let submission;

      if (step === 1) {
        // Step 1: Create or update submission with Aadhaar and mobile
        const step1Data = data as Step1Data;
        const existingSubmission = await prisma.udyamSubmission.findFirst({
          where: { aadhaarNumber: step1Data.aadhaarNumber }
        });

        if (existingSubmission) {
          submission = await prisma.udyamSubmission.update({
            where: { id: existingSubmission.id },
            data: {
              aadhaarNumber: step1Data.aadhaarNumber,
              mobileNumber: step1Data.mobileNumber,
              currentStep: step,
              ipAddress: clientIP,
              userAgent: userAgent
            }
          });
        } else {
          submission = await prisma.udyamSubmission.create({
            data: {
              aadhaarNumber: step1Data.aadhaarNumber,
              mobileNumber: step1Data.mobileNumber,
              currentStep: step,
              ipAddress: clientIP,
              userAgent: userAgent,
              // Initialize empty fields for step 2
              panNumber: '',
              enterpriseName: '',
              enterpriseType: '',
              commencementDate: new Date(),
              address: '',
              pincode: '',
              state: '',
              district: '',
              emailId: null
            }
          });
        }
      } else if (step === 2) {
        // Step 2: Update submission with enterprise details
        const step2Data = data as Step2Data;
        // For step 2, we need the aadhaarNumber to identify the submission
        const aadhaarNumber = validatedData.aadhaarNumber;
        if (!aadhaarNumber) {
          throw new ValidationError('Aadhaar number required for step 2', { aadhaarNumber: 'Required' });
        }

        const existingSubmission = await prisma.udyamSubmission.findFirst({
          where: { aadhaarNumber: aadhaarNumber }
        });

        if (!existingSubmission) {
          throw new NotFoundError('No submission found for this Aadhaar number');
        }

        submission = await prisma.udyamSubmission.update({
          where: { id: existingSubmission.id },
          data: {
            panNumber: step2Data.panNumber,
            enterpriseName: step2Data.enterpriseName,
            enterpriseType: step2Data.enterpriseType,
            commencementDate: new Date(step2Data.commencementDate),
            address: step2Data.address,
            pincode: step2Data.pincode,
            state: step2Data.state,
            district: step2Data.district,
            emailId: step2Data.emailId || null,
            currentStep: step,
            isComplete: true,
            ipAddress: clientIP,
            userAgent: userAgent
          }
        });
      }

      // Log the submission
      await auditLog({
        action: 'FORM_SUBMIT',
        resource: 'UDYAM_SUBMISSION',
        resourceId: submission?.id || undefined,
        details: { step },
        ipAddress: clientIP,
        userAgent: userAgent
      });

      const response: APIResponse<SubmissionResponse> = {
        success: true,
        message: `Step ${step} submitted successfully`,
        data: {
          submissionId: submission?.submissionId || '',
          currentStep: submission?.currentStep || step,
          isComplete: submission?.isComplete || false
        }
      };

      res.status(200).json(response);

    } catch (error) {
      if (error instanceof ValidationError) {
        const response: APIResponse = {
          success: false,
          message: 'Validation failed',
          errors: error.errors
        };
        res.status(400).json(response);
      } else if (error instanceof NotFoundError) {
        const response: APIResponse = {
          success: false,
          message: error.message
        };
        res.status(404).json(response);
      } else {
        console.error('Form submission error:', error);
        const response: APIResponse = {
          success: false,
          message: 'Internal server error'
        };
        res.status(500).json(response);
      }
    }
  }

  /**
   * Request OTP for mobile verification
   */
  async requestOTP(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = OTPRequestSchema.parse(req.body);
      const { aadhaarNumber, mobileNumber } = validatedData;
      
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database
      await prisma.oTPVerification.create({
        data: {
          mobileNumber,
          otp,
          expiresAt
        }
      });

      // Send OTP (mock implementation)
      await sendOTP(mobileNumber, otp);

      // Log the OTP request
      await auditLog({
        action: 'OTP_REQUEST',
        resource: 'OTP_VERIFICATION',
        resourceId: mobileNumber,
        details: { aadhaarNumber },
        ipAddress: clientIP,
        userAgent: userAgent
      });

      const response: APIResponse<OTPResponse> = {
        success: true,
        message: 'OTP sent successfully',
        data: {
          sent: true,
          expiresIn: 600 // 10 minutes in seconds
        }
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('OTP request error:', error);
      const response: APIResponse = {
        success: false,
        message: 'Failed to send OTP'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = OTPVerifySchema.parse(req.body);
      const { mobileNumber, otp } = validatedData;
      
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      // Find the OTP record
      const otpRecord = await prisma.oTPVerification.findFirst({
        where: {
          mobileNumber,
          otp,
          isVerified: false,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (!otpRecord) {
        await auditLog({
          action: 'OTP_VERIFY_FAILED',
          resource: 'OTP_VERIFICATION',
          resourceId: mobileNumber,
          details: { reason: 'Invalid or expired OTP' },
          ipAddress: clientIP,
          userAgent: userAgent
        });

        const response: APIResponse = {
          success: false,
          message: 'Invalid or expired OTP'
        };
        res.status(400).json(response);
        return;
      }

      // Mark OTP as verified
      await prisma.oTPVerification.update({
        where: { id: otpRecord.id },
        data: { isVerified: true }
      });

      // Update submission OTP status
      await prisma.udyamSubmission.updateMany({
        where: { mobileNumber },
        data: { otpVerified: true }
      });

      // Log successful verification
      await auditLog({
        action: 'OTP_VERIFY_SUCCESS',
        resource: 'OTP_VERIFICATION',
        resourceId: mobileNumber,
        details: {},
        ipAddress: clientIP,
        userAgent: userAgent
      });

      const response: APIResponse = {
        success: true,
        message: 'OTP verified successfully'
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('OTP verification error:', error);
      const response: APIResponse = {
        success: false,
        message: 'Failed to verify OTP'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get submission by ID
   */
  async getSubmission(req: Request, res: Response): Promise<void> {
    try {
      const { submissionId } = req.params;

      const submission = await prisma.udyamSubmission.findUnique({
        where: { submissionId }
      });

      if (!submission) {
        const response: APIResponse = {
          success: false,
          message: 'Submission not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: APIResponse = {
        success: true,
        message: 'Submission retrieved successfully',
        data: submission
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('Get submission error:', error);
      const response: APIResponse = {
        success: false,
        message: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(_req: Request, res: Response): Promise<void> {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      
      const response: APIResponse = {
        success: true,
        message: 'API is healthy',
        data: {
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          version: process.env.npm_package_version || '1.0.0'
        }
      };

      res.status(200).json(response);
    } catch (error) {
      const response: APIResponse = {
        success: false,
        message: 'API is unhealthy'
      };
      res.status(503).json(response);
    }
  }
}
