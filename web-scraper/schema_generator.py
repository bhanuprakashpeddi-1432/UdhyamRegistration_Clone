"""
Schema Generator for Udyam Registration Form
Generates TypeScript interfaces and validation schemas from scraped data
"""

import json
import re
from typing import Dict, List, Any, Optional
from pathlib import Path

class SchemaGenerator:
    def __init__(self, schema_file: str = "udyam_form_schema.json"):
        """Initialize with the scraped schema file"""
        self.schema_file = schema_file
        self.schema_data = self._load_schema()
    
    def _load_schema(self) -> Dict[str, Any]:
        """Load the scraped schema from JSON file"""
        try:
            with open(self.schema_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Schema file {self.schema_file} not found. Using default schema.")
            return self._get_default_schema()
        except json.JSONDecodeError as e:
            print(f"Error parsing schema file: {e}")
            return self._get_default_schema()
    
    def _get_default_schema(self) -> Dict[str, Any]:
        """Provide a default schema if scraping fails"""
        return {
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
                            "required": True,
                            "validation": {
                                "required": True,
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
                            "required": True,
                            "validation": {
                                "required": True,
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
                            "required": True,
                            "validation": {
                                "required": True,
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
                            "required": True,
                            "validation": {
                                "required": True,
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
                            "required": True,
                            "validation": {
                                "required": True,
                                "minLength": 2,
                                "maxLength": 100
                            }
                        },
                        {
                            "name": "enterpriseType",
                            "type": "select",
                            "label": "Type of Enterprise",
                            "required": True,
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
                                "required": True
                            }
                        }
                    ]
                }
            ]
        }
    
    def generate_typescript_interfaces(self) -> str:
        """Generate TypeScript interfaces from the schema"""
        interfaces = []
        
        # Generate field option interface
        interfaces.append("""
export interface FieldOption {
  value: string;
  text: string;
}
""")
        
        # Generate validation rules interface
        interfaces.append("""
export interface ValidationRules {
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  phone?: boolean;
}
""")
        
        # Generate field interface
        interfaces.append("""
export interface FormField {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: ValidationRules;
  options?: FieldOption[];
  value?: string;
  maxlength?: string;
  id?: string;
}
""")
        
        # Generate step interface
        interfaces.append("""
export interface FormStep {
  step: number;
  title: string;
  fields: FormField[];
}
""")
        
        # Generate main schema interface
        interfaces.append("""
export interface UdyamFormSchema {
  steps: FormStep[];
  validation_rules?: Record<string, any>;
  field_types?: Record<string, any>;
  labels?: Record<string, string>;
  placeholders?: Record<string, string>;
  options?: Record<string, any>;
}
""")
        
        # Generate form data interfaces for each step
        for step in self.schema_data.get('steps', []):
            step_num = step.get('step', 1)
            interface_name = f"Step{step_num}FormData"
            
            fields_def = []
            for field in step.get('fields', []):
                field_name = field.get('name', '')
                field_type = self._get_typescript_type(field)
                is_required = field.get('required', False)
                
                if field_name:
                    if is_required:
                        fields_def.append(f"  {field_name}: {field_type};")
                    else:
                        fields_def.append(f"  {field_name}?: {field_type};")
            
            interface = f"""
export interface {interface_name} {{
{chr(10).join(fields_def)}
}}
"""
            interfaces.append(interface)
        
        # Generate combined form data interface
        step_types = []
        for step in self.schema_data.get('steps', []):
            step_num = step.get('step', 1)
            step_types.append(f"Step{step_num}FormData")
        
        if step_types:
            interfaces.append(f"""
export interface UdyamFormData extends {', '.join(step_types)} {{
  currentStep: number;
  isComplete: boolean;
}}
""")
        
        return '\n'.join(interfaces)
    
    def _get_typescript_type(self, field: Dict[str, Any]) -> str:
        """Convert field type to TypeScript type"""
        field_type = field.get('type', 'text')
        
        type_mapping = {
            'text': 'string',
            'email': 'string',
            'tel': 'string',
            'password': 'string',
            'textarea': 'string',
            'select': 'string',
            'radio': 'string',
            'checkbox': 'boolean',
            'date': 'string',
            'number': 'number'
        }
        
        return type_mapping.get(field_type, 'string')
    
    def generate_zod_schema(self) -> str:
        """Generate Zod validation schema"""
        imports = "import { z } from 'zod';\n\n"
        
        schemas = []
        
        # Generate validation schema for each step
        for step in self.schema_data.get('steps', []):
            step_num = step.get('step', 1)
            schema_name = f"step{step_num}Schema"
            
            field_validations = []
            for field in step.get('fields', []):
                field_name = field.get('name', '')
                if not field_name:
                    continue
                
                validation = self._generate_zod_field_validation(field)
                if validation:
                    field_validations.append(f"  {field_name}: {validation}")
            
            if field_validations:
                field_str = ',\n'.join(field_validations)
                schema = f"""export const {schema_name} = z.object({{
{field_str}
}});
"""
                schemas.append(schema)
        
        # Generate combined schema
        step_schemas = []
        for step in self.schema_data.get('steps', []):
            step_num = step.get('step', 1)
            step_schemas.append(f"step{step_num}Schema")
        
        if step_schemas:
            and_clause = '.and('.join(step_schemas)
            combined_schema = f"""
export const udyamFormSchema = z.object({{
  currentStep: z.number().min(1).max({len(self.schema_data.get('steps', []))}),
  isComplete: z.boolean().optional().default(false)
}}).and({and_clause});

export type UdyamFormData = z.infer<typeof udyamFormSchema>;
"""
            schemas.append(combined_schema)
        
        return imports + '\n'.join(schemas)
    
    def _generate_zod_field_validation(self, field: Dict[str, Any]) -> str:
        """Generate Zod validation for a single field"""
        field_type = field.get('type', 'text')
        validation_rules = field.get('validation', {})
        is_required = field.get('required', False)
        
        # Base validation
        if field_type in ['text', 'email', 'tel', 'password', 'textarea', 'select', 'radio', 'date']:
            base = "z.string()"
        elif field_type == 'checkbox':
            base = "z.boolean()"
        elif field_type == 'number':
            base = "z.number()"
        else:
            base = "z.string()"
        
        validations = []
        
        # Add specific validations
        if validation_rules.get('email'):
            validations.append('.email("Please enter a valid email address")')
        
        if validation_rules.get('pattern'):
            pattern = validation_rules['pattern']
            validations.append(f'.regex(/{pattern}/, "Invalid format")')
        
        if validation_rules.get('minLength'):
            min_len = validation_rules['minLength']
            validations.append(f'.min({min_len}, "Minimum {min_len} characters required")')
        
        if validation_rules.get('maxLength'):
            max_len = validation_rules['maxLength']
            validations.append(f'.max({max_len}, "Maximum {max_len} characters allowed")')
        
        # Handle required/optional
        if not is_required:
            validations.append('.optional()')
        
        return base + ''.join(validations)
    
    def generate_form_config(self) -> str:
        """Generate a TypeScript configuration file"""
        config = f"""
// Auto-generated form configuration
export const UDYAM_FORM_CONFIG = {json.dumps(self.schema_data, indent=2)} as const;

export const VALIDATION_MESSAGES = {{
  required: 'This field is required',
  invalidAadhaar: 'Please enter a valid 12-digit Aadhaar number',
  invalidPAN: 'Please enter a valid PAN number (e.g., ABCDE1234F)',
  invalidMobile: 'Please enter a valid 10-digit mobile number',
  invalidOTP: 'Please enter a valid 6-digit OTP',
  invalidPincode: 'Please enter a valid 6-digit PIN code',
  invalidEmail: 'Please enter a valid email address',
  minLength: (min: number) => `Minimum ${{min}} characters required`,
  maxLength: (max: number) => `Maximum ${{max}} characters allowed`
}} as const;

export const REGEX_PATTERNS = {{
  aadhaar: /^[0-9]{{12}}$/,
  pan: /^[A-Z]{{5}}[0-9]{{4}}[A-Z]{{1}}$/,
  mobile: /^[6-9][0-9]{{9}}$/,
  otp: /^[0-9]{{6}}$/,
  pincode: /^[0-9]{{6}}$/
}} as const;
"""
        return config
    
    def save_generated_files(self, output_dir: str = "../frontend/src/types"):
        """Save all generated TypeScript files"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Save TypeScript interfaces
        interfaces_content = self.generate_typescript_interfaces()
        with open(output_path / "form-types.ts", 'w', encoding='utf-8') as f:
            f.write(interfaces_content)
        
        # Save Zod schemas
        zod_content = self.generate_zod_schema()
        with open(output_path / "form-validation.ts", 'w', encoding='utf-8') as f:
            f.write(zod_content)
        
        # Save form configuration
        config_content = self.generate_form_config()
        with open(output_path / "form-config.ts", 'w', encoding='utf-8') as f:
            f.write(config_content)
        
        print(f"Generated TypeScript files saved to {output_path}")

def main():
    """Main function to generate schema files"""
    generator = SchemaGenerator()
    generator.save_generated_files()
    print("Schema generation completed!")

if __name__ == "__main__":
    main()
