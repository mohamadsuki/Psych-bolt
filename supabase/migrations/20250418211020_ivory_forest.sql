/*
  # Fix array fields in evaluator_assessments table

  1. Changes
    - Ensure evaluator_data.diagnosis is properly initialized as an array in the database
    - Ensure evaluator_data.validityFactors is properly initialized as an array in the database
    
  2. Security
    - No changes to security policies
*/

-- Check if the diagnosis field exists in the JSONB structure and ensure it's an array
UPDATE evaluator_assessments
SET evaluator_data = jsonb_set(
  CASE 
    WHEN evaluator_data ? 'diagnosis' AND jsonb_typeof(evaluator_data->'diagnosis') != 'array' THEN
      evaluator_data - 'diagnosis'
    ELSE
      evaluator_data
  END, 
  '{diagnosis}', 
  CASE 
    WHEN evaluator_data ? 'diagnosis' AND jsonb_typeof(evaluator_data->'diagnosis') = 'array' THEN
      evaluator_data->'diagnosis'
    ELSE
      '[]'::jsonb
  END
);

-- Check if the validityFactors field exists in the JSONB structure and ensure it's an array
UPDATE evaluator_assessments
SET evaluator_data = jsonb_set(
  CASE 
    WHEN evaluator_data ? 'validityFactors' AND jsonb_typeof(evaluator_data->'validityFactors') != 'array' THEN
      evaluator_data - 'validityFactors'
    ELSE
      evaluator_data
  END, 
  '{validityFactors}', 
  CASE 
    WHEN evaluator_data ? 'validityFactors' AND jsonb_typeof(evaluator_data->'validityFactors') = 'array' THEN
      evaluator_data->'validityFactors'
    ELSE
      '[]'::jsonb
  END
);