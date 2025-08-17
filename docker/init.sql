-- Initialize Udyam database with basic setup
-- This file is executed when the PostgreSQL container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance
-- (Prisma will handle table creation)
