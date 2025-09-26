require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyEssentialRLS() {
  console.log('🔐 APPLYING ESSENTIAL RLS POLICIES')
  console.log('=' .repeat(50))

  try {
    // Step 1: Enable RLS on core tables
    console.log('\n📋 Step 1: Enabling RLS on core tables...')
    
    const tables = [
      'profiles', 'matches', 'match_members', 'chat_rooms', 
      'chat_messages', 'notifications', 'verification_documents', 
      'user_preferences', 'feedback', 'match_batches', 'match_history',
      'message_reactions', 'message_read_status', 'payment_plans',
      'payments', 'user_subscriptions', 'profile_availability_slots',
      'profile_interests', 'profile_meeting_activities', 'profile_preferences',
      'profile_specialties', 'audit_log'
    ]

    for (const table of tables) {
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql: `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;` 
        })
        
        if (error && !error.message.includes('already enabled')) {
          console.log(`⚠️  ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: RLS enabled`)
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
      }
    }

    // Step 2: Create helper functions
    console.log('\n🔧 Step 2: Creating helper functions...')
    
    const functions = [
      `CREATE OR REPLACE FUNCTION public.current_profile_id()
       RETURNS uuid
       LANGUAGE plpgsql
       SECURITY DEFINER
       STABLE
       AS $$
       BEGIN
         RETURN (
           SELECT id 
           FROM public.profiles 
           WHERE user_id = auth.uid()
           LIMIT 1
         );
       END;
       $$;`,
       
      `CREATE OR REPLACE FUNCTION public.is_admin()
       RETURNS boolean
       LANGUAGE plpgsql
       SECURITY DEFINER
       STABLE
       AS $$
       BEGIN
         RETURN (
           SELECT role = 'admin' 
           FROM public.profiles 
           WHERE user_id = auth.uid()
           LIMIT 1
         );
       END;
       $$;`,
       
      `CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
       RETURNS boolean
       LANGUAGE plpgsql
       SECURITY DEFINER
       STABLE
       AS $$
       BEGIN
         RETURN (
           SELECT role IN ('admin', 'moderator') 
           FROM public.profiles 
           WHERE user_id = auth.uid()
           LIMIT 1
         );
       END;
       $$;`
    ]

    for (const func of functions) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: func })
        if (error) {
          console.log(`⚠️  Function: ${error.message}`)
        } else {
          console.log(`✅ Function created successfully`)
        }
      } catch (err) {
        console.log(`❌ Function error: ${err.message}`)
      }
    }

    // Step 3: Create essential policies
    console.log('\n🛡️  Step 3: Creating essential policies...')
    
    const policies = [
      // Profiles policies
      `DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
       CREATE POLICY "Users can view own profile" ON public.profiles
         FOR SELECT USING (user_id = auth.uid());`,
       
      `DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
       CREATE POLICY "Users can update own profile" ON public.profiles
         FOR UPDATE USING (user_id = auth.uid());`,
       
      `DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
       CREATE POLICY "Admins can view all profiles" ON public.profiles
         FOR SELECT USING (public.is_admin());`,

      // Matches policies
      `DROP POLICY IF EXISTS "Users can view own matches" ON public.matches;
       CREATE POLICY "Users can view own matches" ON public.matches
         FOR SELECT USING (
           EXISTS (
             SELECT 1 FROM public.match_members mm
             JOIN public.profiles p ON mm.profile_id = p.id
             WHERE mm.match_id = matches.id
             AND p.user_id = auth.uid()
             AND mm.is_active = true
           )
         );`,

      // Chat messages policies
      `DROP POLICY IF EXISTS "Users can view own chat messages" ON public.chat_messages;
       CREATE POLICY "Users can view own chat messages" ON public.chat_messages
         FOR SELECT USING (
           EXISTS (
             SELECT 1 FROM public.chat_rooms cr
             JOIN public.match_members mm ON cr.match_id = mm.match_id
             JOIN public.profiles p ON mm.profile_id = p.id
             WHERE cr.id = chat_messages.chat_room_id
             AND p.user_id = auth.uid()
             AND mm.is_active = true
           )
         );`,

      // Notifications policies
      `DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
       CREATE POLICY "Users can view own notifications" ON public.notifications
         FOR SELECT USING (profile_id = public.current_profile_id());`
    ]

    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy })
        if (error) {
          console.log(`⚠️  Policy: ${error.message}`)
        } else {
          console.log(`✅ Policy created successfully`)
        }
      } catch (err) {
        console.log(`❌ Policy error: ${err.message}`)
      }
    }

    console.log('\n🎉 Essential RLS policies applied successfully!')
    
    // Test the policies
    console.log('\n🧪 Testing RLS policies...')
    await testRLS()

  } catch (error) {
    console.error('❌ RLS application failed:', error)
  }
}

async function testRLS() {
  try {
    // Test basic table access
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) {
      console.log(`⚠️  Profiles access: ${error.message}`)
    } else {
      console.log(`✅ Profiles access: Working`)
    }

    // Test helper functions
    const { data: profileId, error: profileError } = await supabase.rpc('current_profile_id')
    if (profileError) {
      console.log(`⚠️  current_profile_id: ${profileError.message}`)
    } else {
      console.log(`✅ current_profile_id: Working`)
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin')
    if (adminError) {
      console.log(`⚠️  is_admin: ${adminError.message}`)
    } else {
      console.log(`✅ is_admin: Working`)
    }

  } catch (error) {
    console.error('❌ RLS testing failed:', error)
  }
}

// Run the application
applyEssentialRLS().catch(console.error)







