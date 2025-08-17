# Web Scraper Module

This module scrapes the Udyam Registration form to extract field definitions, validation rules, and form structure.

## Features

- Extracts form fields from Steps 1 and 2 of Udyam Registration
- Generates TypeScript interfaces and Zod validation schemas
- Handles dynamic content and form validation rules
- Provides fallback data for offline development

## Usage

### Basic Scraping
```bash
python scraper.py
```

### Generate TypeScript Files
```bash
python schema_generator.py
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

## Output Files

- `udyam_form_schema.json` - Complete form schema
- `../frontend/src/types/form-types.ts` - TypeScript interfaces
- `../frontend/src/types/form-validation.ts` - Zod validation schemas
- `../frontend/src/types/form-config.ts` - Form configuration

## Schema Structure

```json
{
  "steps": [
    {
      "step": 1,
      "title": "Aadhaar Details",
      "fields": [
        {
          "name": "aadhaarNumber",
          "type": "text",
          "label": "Aadhaar Number",
          "required": true,
          "validation": {
            "pattern": "^[0-9]{12}$"
          }
        }
      ]
    }
  ]
}
```

## Testing

```bash
pytest tests/
```
