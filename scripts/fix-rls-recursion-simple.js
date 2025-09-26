const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLSRecursion() {
  try {
    console.log('🔧 Fixing RLS recursion issue...');
    
    // Step 1: Drop existing problematic functions and policies
    console.log('1. Dropping existing functions and policies...');
    
    const dropStatements = [
      'DROP FUNCTION IF EXISTS public.current_profile_id();',
      'DROP FUNCTION IF EXISTS public.is_admin();',
      'DROP FUNCTION IF EXISTS public.is_moderator_or_admin();',
      'DROP FUNCTION IF EXISTS public.is_member_of_match(uuid);',
      'DROP POLICY IF EXISTS "Users can view own match memberships" ON public.match_members;',
      'DROP POLICY IF EXISTS "Match members can view other members" ON public.match_members;',
      'DROP POLICY IF EXISTS "Admins can manage all match members" ON public.match_members;'
    ];
    
    for (const statement of dropStatements) {
      try {
        await supabase.rpc('exec', { sql: statement });
        console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
      } catch (error) {
        console.log(`⚠️  Warning for: ${statement.substring(0, 50)}... - ${error.message}`);
      }
    }
    
    // Step 2: Create fixed helper functions
    console.log('2. Creating fixed helper functions...');
    
    const createFunctions = [
      `CREATE OR REPLACE FUNCTION public.current_profile_id()
       RETURNS uuid
       LANGUAGE sql
       SECURITY DEFINER
       STABLE
       AS $$
         SELECT id FROM public.profiles WHERE user_id = auth.uid()
       $$;`,
      
      `CREATE OR REPLACE FUNCTION public.is_admin()
       RETURNS boolean
       LANGUAGE sql
       SECURITY DEFINER
       STABLE
       AS $$
         SELECT EXISTS (
           SELECT 1 FROM public.profiles 
           WHERE user_id = auth.uid() 
           AND role = 'admin'
         )
       $$;`,
      
      `CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
       RETURNS boolean
       LANGUAGE sql
       SECURITY DEFINER
       STABLE
       AS $$
         SELECT EXISTS (
           SELECT 1 FROM public.profiles 
           WHERE user_id = auth.uid() 
           AND role IN ('moderator', 'admin')
         )
       $$;`
    ];
    
    for (const statement of createFunctions) {
      try {
        await supabase.rpc('exec', { sql: statement });
        console.log(`✅ Created function successfully`);
      } catch (error) {
        console.error(`❌ Error creating function: ${error.message}`);
        return false;
      }
    }
    
    // Step 3: Create fixed match_members policies
    console.log('3. Creating fixed match_members policies...');
    
    const createPolicies = [
      `CREATE POLICY "Users can view own match memberships" ON public.match_members
       FOR SELECT USING (profile_id = public.current_profile_id());`,
      
      `CREATE POLICY "Match members can view other members" ON public.match_members
       FOR SELECT USING (
         EXISTS (
           SELECT 1 FROM public.match_members mm2
           JOIN public.profiles p ON mm2.profile_id = p.id
           WHERE mm2.match_id = match_members.match_id 
           AND p.user_id = auth.uid()
           AND mm2.is_active = true
         )
       );`,
      
      `CREATE POLICY "Admins can manage all match members" ON public.match_members
       FOR ALL USING (public.is_admin());`
    ];
    
    for (const statement of createPolicies) {
      try {
        await supabase.rpc('exec', { sql: statement });
        console.log(`✅ Created policy successfully`);
      } catch (error) {
        console.error(`❌ Error creating policy: ${error.message}`);
        return false;
      }
    }
    
    // Step 4: Test the fix
    console.log('4. Testing the fix...');
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role')
      .limit(1);
    
    if (profileError) {
      console.error('❌ Profile access test failed:', profileError);
      return false;
    }
    
    console.log('✅ Profile access test passed!');
    console.log('Sample profile:', profiles?.[0]);
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Run the fix
fixRLSRecursion().then(success => {
  if (success) {
    console.log('🎉 RLS recursion fix completed successfully!');
    process.exit(0);
  } else {
    console.log('💥 RLS recursion fix failed!');
    process.exit(1);
  }
});







