-- Enable RLS on verification_documents table
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own verification documents
CREATE POLICY "Users can insert own verification" ON verification_documents
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own verification status
CREATE POLICY "Users can view own verification" ON verification_documents
FOR SELECT USING (auth.uid() = user_id);

-- Policy: Admins can view and update all verification documents
CREATE POLICY "Admins can manage all verifications" ON verification_documents
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email LIKE '%@beyondrounds.com'
  )
);

-- Policy: System can update verification status (for admin actions)
CREATE POLICY "System can update verification status" ON verification_documents
FOR UPDATE USING (true);
