import express from 'express';
import { UdyamController } from '@/controllers/udyamController';

const router = express.Router();
const udyamController = new UdyamController();

/**
 * @route POST /api/submit
 * @desc Submit form data for validation and storage
 * @access Public
 */
router.post('/submit', udyamController.submitForm.bind(udyamController));

/**
 * @route POST /api/otp/request
 * @desc Request OTP for mobile verification
 * @access Public
 */
router.post('/otp/request', udyamController.requestOTP.bind(udyamController));

/**
 * @route POST /api/otp/verify
 * @desc Verify OTP
 * @access Public
 */
router.post('/otp/verify', udyamController.verifyOTP.bind(udyamController));

/**
 * @route GET /api/submission/:submissionId
 * @desc Get submission by ID
 * @access Public
 */
router.get('/submission/:submissionId', udyamController.getSubmission.bind(udyamController));

/**
 * @route GET /api/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', udyamController.healthCheck.bind(udyamController));

export default router;
