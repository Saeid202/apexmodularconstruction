-- Add category and specialties to sellers table
ALTER TABLE sellers
ADD COLUMN category text,
ADD COLUMN specialties text[];
