// Auto-generated form configuration
export const UDYAM_FORM_CONFIG = {
  "steps": [
    {
      "step": 1,
      "title": "Aadhaar Details",
      "fields": [
        {
          "name": "aadhaarNumber",
          "type": "text",
          "label": "Aadhaar Number",
          "placeholder": "Enter 12-digit Aadhaar number",
          "required": true,
          "validation": {
            "required": true,
            "pattern": "^[0-9]{12}$",
            "minLength": 12,
            "maxLength": 12
          }
        },
        {
          "name": "mobileNumber",
          "type": "tel",
          "label": "Mobile Number",
          "placeholder": "Enter 10-digit mobile number",
          "required": true,
          "validation": {
            "required": true,
            "pattern": "^[6-9][0-9]{9}$",
            "minLength": 10,
            "maxLength": 10
          }
        },
        {
          "name": "otp",
          "type": "text",
          "label": "OTP",
          "placeholder": "Enter OTP",
          "required": true,
          "validation": {
            "required": true,
            "pattern": "^[0-9]{6}$",
            "minLength": 6,
            "maxLength": 6
          }
        }
      ]
    },
    {
      "step": 2,
      "title": "Personal Details",
      "fields": [
        {
          "name": "panNumber",
          "type": "text",
          "label": "PAN Number",
          "placeholder": "Enter PAN number",
          "required": true,
          "validation": {
            "required": true,
            "pattern": "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
            "minLength": 10,
            "maxLength": 10
          }
        },
        {
          "name": "enterpriseName",
          "type": "text",
          "label": "Name of Enterprise",
          "placeholder": "Enter enterprise name",
          "required": true,
          "validation": {
            "required": true,
            "minLength": 2,
            "maxLength": 100
          }
        },
        {
          "name": "enterpriseType",
          "type": "select",
          "label": "Type of Enterprise",
          "required": true,
          "options": [
            {"value": "", "text": "Select Type"},
            {"value": "proprietorship", "text": "Proprietorship"},
            {"value": "partnership", "text": "Partnership"},
            {"value": "llp", "text": "Limited Liability Partnership"},
            {"value": "pvt_ltd", "text": "Private Limited Company"},
            {"value": "public_ltd", "text": "Public Limited Company"},
            {"value": "cooperative", "text": "Cooperative Society"},
            {"value": "trust", "text": "Trust"},
            {"value": "society", "text": "Society"}
          ],
          "validation": {
            "required": true
          }
        },
        {
          "name": "commencementDate",
          "type": "date",
          "label": "Date of Commencement of Business",
          "required": true,
          "validation": {
            "required": true
          }
        },
        {
          "name": "address",
          "type": "textarea",
          "label": "Address of Enterprise",
          "placeholder": "Enter complete address",
          "required": true,
          "validation": {
            "required": true,
            "minLength": 10,
            "maxLength": 500
          }
        },
        {
          "name": "pincode",
          "type": "text",
          "label": "PIN Code",
          "placeholder": "Enter 6-digit PIN code",
          "required": true,
          "validation": {
            "required": true,
            "pattern": "^[0-9]{6}$",
            "minLength": 6,
            "maxLength": 6
          }
        },
        {
          "name": "state",
          "type": "select",
          "label": "State",
          "required": true,
          "options": [
            {"value": "", "text": "Select State"},
            {"value": "andhra_pradesh", "text": "Andhra Pradesh"},
            {"value": "arunachal_pradesh", "text": "Arunachal Pradesh"},
            {"value": "assam", "text": "Assam"},
            {"value": "bihar", "text": "Bihar"},
            {"value": "chhattisgarh", "text": "Chhattisgarh"},
            {"value": "goa", "text": "Goa"},
            {"value": "gujarat", "text": "Gujarat"},
            {"value": "haryana", "text": "Haryana"},
            {"value": "himachal_pradesh", "text": "Himachal Pradesh"},
            {"value": "jharkhand", "text": "Jharkhand"},
            {"value": "karnataka", "text": "Karnataka"},
            {"value": "kerala", "text": "Kerala"},
            {"value": "madhya_pradesh", "text": "Madhya Pradesh"},
            {"value": "maharashtra", "text": "Maharashtra"},
            {"value": "manipur", "text": "Manipur"},
            {"value": "meghalaya", "text": "Meghalaya"},
            {"value": "mizoram", "text": "Mizoram"},
            {"value": "nagaland", "text": "Nagaland"},
            {"value": "odisha", "text": "Odisha"},
            {"value": "punjab", "text": "Punjab"},
            {"value": "rajasthan", "text": "Rajasthan"},
            {"value": "sikkim", "text": "Sikkim"},
            {"value": "tamil_nadu", "text": "Tamil Nadu"},
            {"value": "telangana", "text": "Telangana"},
            {"value": "tripura", "text": "Tripura"},
            {"value": "uttar_pradesh", "text": "Uttar Pradesh"},
            {"value": "uttarakhand", "text": "Uttarakhand"},
            {"value": "west_bengal", "text": "West Bengal"}
          ],
          "validation": {
            "required": true
          }
        },
        {
          "name": "district",
          "type": "text",
          "label": "District",
          "placeholder": "District (auto-filled from PIN code)",
          "required": true,
          "validation": {
            "required": true
          }
        },
        {
          "name": "emailId",
          "type": "email",
          "label": "Email ID",
          "placeholder": "Enter email address",
          "required": false,
          "validation": {
            "email": true
          }
        }
      ]
    }
  ]
} as const;

export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  invalidAadhaar: 'Please enter a valid 12-digit Aadhaar number',
  invalidPAN: 'Please enter a valid PAN number (e.g., ABCDE1234F)',
  invalidMobile: 'Please enter a valid 10-digit mobile number',
  invalidOTP: 'Please enter a valid 6-digit OTP',
  invalidPincode: 'Please enter a valid 6-digit PIN code',
  invalidEmail: 'Please enter a valid email address',
  minLength: (min: number) => `Minimum ${min} characters required`,
  maxLength: (max: number) => `Maximum ${max} characters allowed`
} as const;

export const REGEX_PATTERNS = {
  aadhaar: /^[0-9]{12}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  mobile: /^[6-9][0-9]{9}$/,
  otp: /^[0-9]{6}$/,
  pincode: /^[0-9]{6}$/
} as const;
