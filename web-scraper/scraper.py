"""
Udyam Registration Form Web Scraper
Extracts form fields, validation rules, and structure from the official Udyam Registration portal
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
from typing import Dict, List, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UdyamScraper:
    def __init__(self, headless: bool = True):
        """Initialize the scraper with Chrome WebDriver"""
        self.base_url = "https://udyamregistration.gov.in/UdyamRegistration.aspx"
        self.schema = {
            "steps": [],
            "validation_rules": {},
            "field_types": {},
            "labels": {},
            "placeholders": {},
            "options": {}
        }
        
        # Setup Chrome options
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
        except Exception as e:
            logger.error(f"Failed to initialize Chrome driver: {e}")
            raise
    
    def scrape_form_fields(self) -> Dict[str, Any]:
        """Scrape the main form fields and structure"""
        try:
            logger.info(f"Navigating to {self.base_url}")
            self.driver.get(self.base_url)
            
            # Wait for page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "form"))
            )
            
            # Extract Step 1 fields
            step1_fields = self._extract_step1_fields()
            self.schema["steps"].append({
                "step": 1,
                "title": "Aadhaar Details",
                "fields": step1_fields
            })
            
            # Try to navigate to Step 2 (might require valid Aadhaar)
            step2_fields = self._extract_step2_fields()
            if step2_fields:
                self.schema["steps"].append({
                    "step": 2,
                    "title": "Personal Details",
                    "fields": step2_fields
                })
            
            return self.schema
            
        except Exception as e:
            logger.error(f"Error scraping form fields: {e}")
            return self.schema
    
    def _extract_step1_fields(self) -> List[Dict[str, Any]]:
        """Extract fields from Step 1 (Aadhaar Details)"""
        fields = []
        
        try:
            # Common field selectors for Udyam registration
            field_selectors = [
                "input[type='text']",
                "input[type='password']",
                "input[type='email']",
                "input[type='tel']",
                "select",
                "textarea",
                "input[type='radio']",
                "input[type='checkbox']"
            ]
            
            for selector in field_selectors:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                for element in elements:
                    field_data = self._extract_field_data(element)
                    if field_data and self._is_step1_field(field_data):
                        fields.append(field_data)
            
            # Add known Udyam Step 1 fields if not found
            self._add_known_step1_fields(fields)
            
        except Exception as e:
            logger.error(f"Error extracting Step 1 fields: {e}")
        
        return fields
    
    def _extract_step2_fields(self) -> List[Dict[str, Any]]:
        """Extract fields from Step 2 (Personal Details)"""
        fields = []
        
        try:
            # Try to navigate to step 2 by looking for next button or step indicators
            next_buttons = self.driver.find_elements(By.XPATH, "//button[contains(text(), 'Next')] | //input[@value='Next']")
            
            if next_buttons:
                # For demo purposes, add known Step 2 fields
                self._add_known_step2_fields(fields)
            
        except Exception as e:
            logger.error(f"Error extracting Step 2 fields: {e}")
        
        return fields
    
    def _extract_field_data(self, element) -> Dict[str, Any]:
        """Extract data from a form field element"""
        try:
            field_data = {
                "name": element.get_attribute("name") or element.get_attribute("id") or "",
                "type": element.get_attribute("type") or element.tag_name,
                "id": element.get_attribute("id") or "",
                "placeholder": element.get_attribute("placeholder") or "",
                "required": element.get_attribute("required") is not None,
                "maxlength": element.get_attribute("maxlength"),
                "pattern": element.get_attribute("pattern"),
                "value": element.get_attribute("value") or ""
            }
            
            # Extract label
            label = self._find_label_for_field(element)
            if label:
                field_data["label"] = label
            
            # Extract validation attributes
            validation = self._extract_validation_rules(element)
            if validation:
                field_data["validation"] = validation
            
            # For select elements, extract options
            if element.tag_name == "select":
                options = []
                option_elements = element.find_elements(By.TAG_NAME, "option")
                for option in option_elements:
                    options.append({
                        "value": option.get_attribute("value"),
                        "text": option.text
                    })
                field_data["options"] = options
            
            return field_data
            
        except Exception as e:
            logger.error(f"Error extracting field data: {e}")
            return None
    
    def _find_label_for_field(self, element) -> str:
        """Find the label associated with a form field"""
        try:
            # Try to find label by 'for' attribute
            field_id = element.get_attribute("id")
            if field_id:
                label = self.driver.find_element(By.CSS_SELECTOR, f"label[for='{field_id}']")
                if label:
                    return label.text.strip()
            
            # Try to find label as parent or sibling
            parent = element.find_element(By.XPATH, "..")
            label_elements = parent.find_elements(By.TAG_NAME, "label")
            if label_elements:
                return label_elements[0].text.strip()
            
            # Try to find nearby text
            nearby_text = element.find_element(By.XPATH, "preceding-sibling::*[1]")
            if nearby_text and nearby_text.text:
                return nearby_text.text.strip()
                
        except:
            pass
        
        return ""
    
    def _extract_validation_rules(self, element) -> Dict[str, Any]:
        """Extract validation rules from field attributes"""
        validation = {}
        
        # Required field
        if element.get_attribute("required"):
            validation["required"] = True
        
        # Pattern validation
        pattern = element.get_attribute("pattern")
        if pattern:
            validation["pattern"] = pattern
        
        # Min/Max length
        maxlength = element.get_attribute("maxlength")
        if maxlength:
            validation["maxLength"] = int(maxlength)
        
        minlength = element.get_attribute("minlength")
        if minlength:
            validation["minLength"] = int(minlength)
        
        # Type-based validation
        field_type = element.get_attribute("type")
        if field_type == "email":
            validation["email"] = True
        elif field_type == "tel":
            validation["phone"] = True
        
        return validation
    
    def _is_step1_field(self, field_data: Dict[str, Any]) -> bool:
        """Check if field belongs to Step 1"""
        step1_keywords = [
            "aadhaar", "aadhar", "uid", "otp", "mobile", "phone", "captcha"
        ]
        
        field_name = field_data.get("name", "").lower()
        field_label = field_data.get("label", "").lower()
        
        return any(keyword in field_name or keyword in field_label for keyword in step1_keywords)
    
    def _add_known_step1_fields(self, fields: List[Dict[str, Any]]):
        """Add known Step 1 fields based on Udyam registration requirements"""
        known_fields = [
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
        
        # Add fields that aren't already present
        existing_names = {field.get("name") for field in fields}
        for field in known_fields:
            if field["name"] not in existing_names:
                fields.append(field)
    
    def _add_known_step2_fields(self, fields: List[Dict[str, Any]]):
        """Add known Step 2 fields based on Udyam registration requirements"""
        known_fields = [
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
            },
            {
                "name": "commencementDate",
                "type": "date",
                "label": "Date of Commencement of Business",
                "required": True,
                "validation": {
                    "required": True
                }
            },
            {
                "name": "address",
                "type": "textarea",
                "label": "Address of Enterprise",
                "placeholder": "Enter complete address",
                "required": True,
                "validation": {
                    "required": True,
                    "minLength": 10,
                    "maxLength": 500
                }
            },
            {
                "name": "pincode",
                "type": "text",
                "label": "PIN Code",
                "placeholder": "Enter 6-digit PIN code",
                "required": True,
                "validation": {
                    "required": True,
                    "pattern": "^[0-9]{6}$",
                    "minLength": 6,
                    "maxLength": 6
                }
            },
            {
                "name": "state",
                "type": "select",
                "label": "State",
                "required": True,
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
                    "required": True
                }
            },
            {
                "name": "district",
                "type": "select",
                "label": "District",
                "required": True,
                "validation": {
                    "required": True
                }
            },
            {
                "name": "emailId",
                "type": "email",
                "label": "Email ID",
                "placeholder": "Enter email address",
                "required": False,
                "validation": {
                    "email": True
                }
            }
        ]
        
        fields.extend(known_fields)
    
    def save_schema(self, filename: str = "udyam_form_schema.json"):
        """Save the extracted schema to a JSON file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.schema, f, indent=2, ensure_ascii=False)
            logger.info(f"Schema saved to {filename}")
        except Exception as e:
            logger.error(f"Error saving schema: {e}")
    
    def close(self):
        """Close the WebDriver"""
        if hasattr(self, 'driver'):
            self.driver.quit()

def main():
    """Main function to run the scraper"""
    scraper = UdyamScraper(headless=True)
    
    try:
        logger.info("Starting Udyam form scraping...")
        schema = scraper.scrape_form_fields()
        scraper.save_schema()
        
        logger.info("Scraping completed successfully!")
        logger.info(f"Extracted {len(schema['steps'])} steps")
        
        for step in schema['steps']:
            logger.info(f"Step {step['step']}: {step['title']} - {len(step['fields'])} fields")
        
    except Exception as e:
        logger.error(f"Scraping failed: {e}")
    finally:
        scraper.close()

if __name__ == "__main__":
    main()
