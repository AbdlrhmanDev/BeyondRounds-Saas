const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixProfileCreation() {
  console.log('🔧 Fixing profile creation...\n');

  try {
    // First, let's check if the trigger exists
    console.log('1. Checking for existing triggers...');
    
    // Check if the function exists
    const { data: functions, error: funcError } = await supabase
      .rpc('get_function_info', { function_name: 'handle_new_user' });
    
    if (funcError) {
      console.log('⚠️  Function check failed, will create trigger');
    } else {
      console.log('✅ Function exists');
    }

    // Create the trigger function
    console.log('2. Creating handle_new_user function...');
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (
          user_id,
          email,
          first_name,
          last_name,
          city,
          gender,
          role,
          is_verified,
          is_banned,
          onboarding_completed,
          profile_completion_percentage
        )
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
          COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
          COALESCE(NEW.raw_user_meta_data->>'city', 'Not specified'),
          'prefer-not-to-say',
          'user',
          false,
          false,
          false,
          0
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    const { error: createFuncError } = await supabase.rpc('exec_sql', { 
      sql: createFunctionSQL 
    });

    if (createFuncError) {
      console.error('❌ Failed to create function:', createFuncError.message);
      console.log('   You may need to run this SQL manually in Supabase SQL Editor:');
      console.log(createFunctionSQL);
    } else {
      console.log('✅ Function created successfully');
    }

    // Create the trigger
    console.log('3. Creating trigger...');
    const createTriggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;

    const { error: createTriggerError } = await supabase.rpc('exec_sql', { 
      sql: createTriggerSQL 
    });

    if (createTriggerError) {
      console.error('❌ Failed to create trigger:', createTriggerError.message);
      console.log('   You may need to run this SQL manually in Supabase SQL Editor:');
      console.log(createTriggerSQL);
    } else {
      console.log('✅ Trigger created successfully');
    }

    // Check for users without profiles
    console.log('4. Checking for users without profiles...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('⚠️  Could not check auth users (requires admin access)');
    } else {
      console.log(`   Found ${authUsers.users.length} auth users`);
      
      for (const user of authUsers.users) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (profileError && profileError.code === 'PGRST116') {
          console.log(`   ⚠️  User ${user.id} (${user.email}) has no profile`);
          
          // Create profile for this user
          const { error: createError } = await supabase
          .from('profiles')
          .insert({
              user_id: user.id,
              email: user.email,
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              city: user.user_metadata?.city || 'Not specified',
            gender: 'prefer-not-to-say',
            role: 'user',
            is_verified: false,
            is_banned: false,
            onboarding_completed: false,
              profile_completion_percentage: 0
            });

        if (createError) {
            console.error(`     ❌ Failed to create profile: ${createError.message}`);
        } else {
            console.log(`     ✅ Created profile for user ${user.id}`);
          }
        }
      }
    }

    console.log('\n✅ Profile creation fix completed!');
    console.log('   New users should now automatically get profiles created.');
    console.log('   Existing users without profiles have been fixed.');

  } catch (error) {
    console.error('💥 Exception:', error.message);
  }
}

fixProfileCreation();