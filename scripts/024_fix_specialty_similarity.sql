-- ========================================
-- FIX SPECIALTY SIMILARITY FUNCTION
-- ========================================
-- This script fixes the multidimensional array issue

-- Drop and recreate the calculate_specialty_similarity function with a different approach
DROP FUNCTION IF EXISTS calculate_specialty_similarity(TEXT, TEXT);

-- Create a simpler version that doesn't use multidimensional arrays
CREATE OR REPLACE FUNCTION calculate_specialty_similarity(specialty1 TEXT, specialty2 TEXT)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
BEGIN
    -- Exact match
    IF specialty1 = specialty2 THEN
        RETURN 1.0;
    END IF;
    
    -- Check if in same domain using individual checks (avoid multidimensional arrays)
    -- Internal Medicine domain
    IF (specialty1 IN ('Internal Medicine', 'Family Medicine', 'General Practice') AND 
        specialty2 IN ('Internal Medicine', 'Family Medicine', 'General Practice')) THEN
        RETURN 0.5;
    END IF;
    
    -- Cardiology domain
    IF (specialty1 IN ('Cardiology', 'Cardiac Surgery') AND 
        specialty2 IN ('Cardiology', 'Cardiac Surgery')) THEN
        RETURN 0.5;
    END IF;
    
    -- Neurology domain
    IF (specialty1 IN ('Neurology', 'Neurosurgery') AND 
        specialty2 IN ('Neurology', 'Neurosurgery')) THEN
        RETURN 0.5;
    END IF;
    
    -- Orthopedics domain
    IF (specialty1 IN ('Orthopedics', 'Sports Medicine') AND 
        specialty2 IN ('Orthopedics', 'Sports Medicine')) THEN
        RETURN 0.5;
    END IF;
    
    -- Pediatrics domain
    IF (specialty1 IN ('Pediatrics', 'Neonatology') AND 
        specialty2 IN ('Pediatrics', 'Neonatology')) THEN
        RETURN 0.5;
    END IF;
    
    -- Obstetrics/Gynecology domain
    IF (specialty1 IN ('Obstetrics', 'Gynecology') AND 
        specialty2 IN ('Obstetrics', 'Gynecology')) THEN
        RETURN 0.5;
    END IF;
    
    -- Psychiatry domain
    IF (specialty1 IN ('Psychiatry', 'Psychology') AND 
        specialty2 IN ('Psychiatry', 'Psychology')) THEN
        RETURN 0.5;
    END IF;
    
    -- Radiology domain
    IF (specialty1 IN ('Radiology', 'Nuclear Medicine') AND 
        specialty2 IN ('Radiology', 'Nuclear Medicine')) THEN
        RETURN 0.5;
    END IF;
    
    -- Anesthesiology domain
    IF (specialty1 IN ('Anesthesiology', 'Pain Management') AND 
        specialty2 IN ('Anesthesiology', 'Pain Management')) THEN
        RETURN 0.5;
    END IF;
    
    -- Emergency Medicine domain
    IF (specialty1 IN ('Emergency Medicine', 'Critical Care') AND 
        specialty2 IN ('Emergency Medicine', 'Critical Care')) THEN
        RETURN 0.5;
    END IF;
    
    -- No similarity
    RETURN 0.0;
END;
$$;

-- Test the function
SELECT 
    calculate_specialty_similarity('Internal Medicine', 'Family Medicine') as related_specialties,
    calculate_specialty_similarity('Internal Medicine', 'Internal Medicine') as same_specialty,
    calculate_specialty_similarity('Internal Medicine', 'Dermatology') as different_specialties;

-- Now test the full matching system
SELECT trigger_manual_matching();

-- Success message
SELECT 
    '✅ Specialty similarity function fixed!' as status,
    'Matching system should now work properly' as message;
