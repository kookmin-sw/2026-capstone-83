ALTER TABLE workplaces
ADD COLUMN company_name VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN business_number VARCHAR(20);

ALTER TABLE employers
DROP COLUMN company_name,
DROP COLUMN business_number;