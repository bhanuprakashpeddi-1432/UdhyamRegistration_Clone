'use client';

import React, { useState, useEffect } from 'react';
import { UDYAM_FORM_CONFIG } from '@/types/form-config';
import type { UdyamFormData, FormField } from '@/types/form-types';
import { validateField, formatAadhaar, formatPAN, formatMobile, formatOTP, formatPincode, fetchLocationByPincode, debounce, cleanAadhaar, cleanMobile, cleanPAN, cleanOTP, cleanPincode } from '@/lib/utils';
import ProgressIndicator from './ProgressIndicator';
import FormFieldComponent from './FormField';
import Button from './ui/Button';

const UdyamRegistrationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<Partial<UdyamFormData>>({
    currentStep: 1,
    isComplete: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [isLookingUpPincode, setIsLookingUpPincode] = useState<boolean>(false);

  // OTP Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Debounced pincode lookup
  const debouncedPincodeCheck = debounce(async (pincode: string) => {
    if (pincode.length === 6) {
      setIsLookingUpPincode(true);
      try {
        console.log('Looking up pincode:', pincode); // Debug log
        const location = await fetchLocationByPincode(pincode);
        console.log('Location result:', location); // Debug log
        if (location) {
          setFormData(prev => ({
            ...prev,
            state: location.state,
            district: location.district
          }));
          console.log('Updated state and district:', location.state, location.district); // Debug log
        } else {
          console.log('No location found for pincode:', pincode); // Debug log
          // Clear state and district if no match found
          setFormData(prev => ({
            ...prev,
            state: '',
            district: ''
          }));
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      } finally {
        setIsLookingUpPincode(false);
      }
    } else {
      setIsLookingUpPincode(false);
    }
  }, 500);

  const handleFieldChange = (fieldName: string, value: string, fieldType?: string) => {
    let formattedValue = value;

    // Apply formatting based on field type
    switch (fieldName) {
      case 'aadhaarNumber':
        formattedValue = formatAadhaar(value);
        break;
      case 'panNumber':
        formattedValue = formatPAN(value);
        break;
      case 'mobileNumber':
        formattedValue = formatMobile(value);
        break;
      case 'otp':
        formattedValue = formatOTP(value);
        break;
      case 'pincode':
        formattedValue = formatPincode(value);
        // Trigger location lookup
        if (formattedValue.length === 6) {
          debouncedPincodeCheck(formattedValue);
        }
        break;
    }

    setFormData(prev => ({
      ...prev,
      [fieldName]: formattedValue
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    console.log('validateStep called for stepNumber:', stepNumber);
    const step = UDYAM_FORM_CONFIG.steps.find(s => s.step === stepNumber);
    if (!step) {
      console.log('Step not found in config:', stepNumber);
      return false;
    }

    console.log('Step fields to validate:', step.fields.map(f => f.name));
    const stepErrors: Record<string, string> = {};
    let isValid = true;

    step.fields.forEach((field: FormField) => {
      const value = (formData as any)[field.name] || '';
      console.log(`Validating field ${field.name}:`, value);
      
      // Map field names to validation types
      const validationType = field.name === 'aadhaarNumber' ? 'aadhaar' :
                           field.name === 'panNumber' ? 'pan' :
                           field.name === 'mobileNumber' ? 'mobile' :
                           field.name === 'otp' ? 'otp' :
                           field.name === 'pincode' ? 'pincode' :
                           field.name === 'emailId' ? 'email' :
                           field.name === 'address' ? 'address' :
                           field.name === 'enterpriseName' ? 'enterpriseName' :
                           field.name === 'enterpriseType' ? 'enterpriseType' :
                           field.name === 'commencementDate' ? 'commencementDate' :
                           field.name;
      console.log(`Using validation type ${validationType} for field ${field.name}`);
      
      const validation = validateField(value, validationType, field.required);
      console.log(`Validation result for ${field.name}:`, validation);
      
      if (!validation.isValid) {
        stepErrors[field.name] = validation.error || 'Invalid value';
        isValid = false;
        console.log(`Field ${field.name} failed validation:`, validation.error);
      }
    });

    console.log('Final validation errors:', stepErrors);
    console.log('Is step valid:', isValid);
    setErrors(stepErrors);
    return isValid;
  };

  const handleSendOTP = async () => {
    const mobileValid = validateField(formData.mobileNumber || '', 'mobile', true);
    const aadhaarValid = validateField(formData.aadhaarNumber?.replace(/\s/g, '') || '', 'aadhaar', true);

    if (!mobileValid.isValid || !aadhaarValid.isValid) {
      setErrors({
        ...(mobileValid.error && { mobileNumber: mobileValid.error }),
        ...(aadhaarValid.error && { aadhaarNumber: aadhaarValid.error })
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOtpSent(true);
      setOtpTimer(60);
      // In real implementation, call backend API
      console.log('OTP sent to:', formData.mobileNumber);
    } catch (error) {
      console.error('Error sending OTP:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1) {
        // For demo purposes, assume OTP is validated
        if (!otpSent || !formData.otp) {
          setErrors({ otp: 'Please request and enter OTP' });
          return;
        }
      }
      
      setCurrentStep(prev => prev + 1);
      setFormData(prev => ({ ...prev, currentStep: currentStep + 1 }));
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setFormData(prev => ({ ...prev, currentStep: currentStep - 1 }));
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called for step:', currentStep);
    console.log('Current form data:', formData);
    
    if (!validateStep(currentStep)) {
      console.log('Validation failed for step:', currentStep);
      console.log('Current errors:', errors);
      return;
    }

    console.log('Validation passed, proceeding with submission');
    try {
      setIsSubmitting(true);
      
      // Clean the form data for backend submission
      let cleanedData: any = {};
      
      if (currentStep === 1) {
        cleanedData = {
          aadhaarNumber: cleanAadhaar(formData.aadhaarNumber || ''),
          mobileNumber: cleanMobile(formData.mobileNumber || ''),
          otp: cleanOTP(formData.otp || '')
        };
      } else if (currentStep === 2) {
        cleanedData = {
          panNumber: cleanPAN(formData.panNumber || ''),
          enterpriseName: formData.enterpriseName,
          enterpriseType: formData.enterpriseType,
          commencementDate: formData.commencementDate,
          address: formData.address,
          pincode: cleanPincode(formData.pincode || ''),
          state: formData.state,
          district: formData.district,
          emailId: formData.emailId
        };
      }
      
      const submissionData = {
        step: currentStep,
        data: cleanedData,
        // Include aadhaarNumber for step 2 to identify the submission
        aadhaarNumber: cleanAadhaar(formData.aadhaarNumber || '')
      };
      
      console.log('Submitting data:', submissionData);
      
      // Submit to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({ ...prev, isComplete: true }));
        alert('Form submitted successfully! Submission ID: ' + result.data.submissionId);
      } else {
        const error = await response.json();
        console.error('Backend error:', error);
        
        // Handle validation errors
        if (error.errors && typeof error.errors === 'object') {
          const errorMessages = Object.entries(error.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          alert('Validation errors:\n' + errorMessages);
        } else {
          alert('Submission failed: ' + (error.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepConfig = UDYAM_FORM_CONFIG.steps.find(step => step.step === currentStep);

  if (formData.isComplete) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
          <p className="text-gray-600">Your Udyam registration application has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ProgressIndicator currentStep={currentStep} totalSteps={UDYAM_FORM_CONFIG.steps.length} />
      
      {currentStepConfig && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Step {currentStep}: {currentStepConfig.title}
            </h3>
          </div>

          <div className="space-y-6">
            {currentStepConfig.fields.map((field: FormField) => (
              <FormFieldComponent
                key={field.name}
                field={field}
                value={(formData as any)[field.name] || ''}
                error={errors[field.name]}
                onChange={(value) => handleFieldChange(field.name, value, field.type)}
                formData={formData}
              />
            ))}

            {/* Pincode lookup status for Step 2 */}
            {currentStep === 2 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                {isLookingUpPincode && (
                  <div className="flex items-center text-blue-600 text-sm">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Looking up location for PIN code...
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">📍 PIN Code Auto-fill:</p>
                  <p className="mb-1">State and District will be automatically filled when you enter a valid PIN code.</p>
                  <p className="text-xs text-gray-500">
                    Try: 110001 (Delhi), 400001 (Mumbai), 560001 (Bangalore), 600001 (Chennai), 700001 (Kolkata)
                  </p>
                </div>
              </div>
            )}

            {/* OTP Section for Step 1 */}
            {currentStep === 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-800">
                      {otpSent ? 'OTP sent to your mobile number' : 'Click to send OTP to your mobile'}
                    </p>
                    {otpTimer > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        Resend OTP in {otpTimer} seconds
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleSendOTP}
                    disabled={isSubmitting || otpTimer > 0}
                    variant="secondary"
                    size="sm"
                  >
                    {otpSent ? 'Resend OTP' : 'Send OTP'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
              variant="secondary"
            >
              Previous
            </Button>

            {currentStep < UDYAM_FORM_CONFIG.steps.length ? (
              <Button
                onClick={handleNextStep}
                disabled={isSubmitting}
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UdyamRegistrationForm;
