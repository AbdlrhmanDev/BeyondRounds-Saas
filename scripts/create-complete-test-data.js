#!/usr/bin/env node

/**
 * Complete Medical Matching System Test Data Generator
 * Creates 25 verified and subscribed medical professional accounts with comprehensive data
 * 
 * IMPORTANT: This script will clean up existing test data first and write the password
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Comprehensive medical professionals data
const medicalProfessionals = [
  {
    email: 'dr.ahmed.alharbi@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'أحمد',
    last_name: 'الغربي',
    medical_specialty: 'Cardiology',
    city: 'Riyadh',
    gender: 'male',
    experience_years: 15,
    hospital: 'King Fahd Medical City',
    phone: '+966501234567',
    bio: 'استشاري أمراض القلب والشرايين مع خبرة 15 عاماً في علاج أمراض القلب المعقدة',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Cardiology', 'Fellowship in Interventional Cardiology'],
    interests: ['Interventional Cardiology', 'Heart Failure Management', 'Preventive Cardiology']
  },
  {
    email: 'dr.sara.almansouri@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'سارة',
    last_name: 'المنصوري',
    medical_specialty: 'Pediatrics',
    city: 'Jeddah',
    gender: 'female',
    experience_years: 12,
    hospital: 'King Abdulaziz Hospital',
    phone: '+966502345678',
    bio: 'استشارية طب الأطفال مع تخصص في أمراض الأطفال حديثي الولادة',
    languages: ['Arabic', 'English', 'French'],
    certifications: ['Saudi Board of Pediatrics', 'Neonatal Intensive Care'],
    interests: ['Neonatology', 'Pediatric Emergency', 'Child Development']
  },
  {
    email: 'dr.mohammed.alshehri@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'محمد',
    last_name: 'الشهري',
    medical_specialty: 'Orthopedics',
    city: 'Dammam',
    gender: 'male',
    experience_years: 18,
    hospital: 'King Fahd Specialist Hospital',
    phone: '+966503456789',
    bio: 'استشاري جراحة العظام والمفاصل مع خبرة في جراحات العمود الفقري',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Orthopedics', 'Spine Surgery Fellowship'],
    interests: ['Spine Surgery', 'Joint Replacement', 'Sports Medicine']
  },
  {
    email: 'dr.fatima.alqahtani@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'فاطمة',
    last_name: 'القحطاني',
    medical_specialty: 'Dermatology',
    city: 'Riyadh',
    gender: 'female',
    experience_years: 10,
    hospital: 'King Saud Medical City',
    phone: '+966504567890',
    bio: 'استشارية الأمراض الجلدية مع تخصص في علاج الأمراض الجلدية المعقدة',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Dermatology', 'Cosmetic Dermatology'],
    interests: ['Medical Dermatology', 'Cosmetic Procedures', 'Skin Cancer Treatment']
  },
  {
    email: 'dr.khalid.alrashid@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'خالد',
    last_name: 'الراشد',
    medical_specialty: 'Neurology',
    city: 'Jeddah',
    gender: 'male',
    experience_years: 20,
    hospital: 'King Fahd Hospital',
    phone: '+966505678901',
    bio: 'استشاري أمراض الأعصاب مع خبرة في علاج السكتات الدماغية',
    languages: ['Arabic', 'English', 'German'],
    certifications: ['Saudi Board of Neurology', 'Stroke Medicine Fellowship'],
    interests: ['Stroke Medicine', 'Epilepsy', 'Movement Disorders']
  },
  {
    email: 'dr.noura.alsulaimani@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'نورا',
    last_name: 'السليماني',
    medical_specialty: 'Obstetrics & Gynecology',
    city: 'Riyadh',
    gender: 'female',
    experience_years: 14,
    hospital: 'King Fahd Medical City',
    phone: '+966506789012',
    bio: 'استشارية أمراض النساء والولادة مع تخصص في طب الأم والجنين',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of OB/GYN', 'Maternal-Fetal Medicine'],
    interests: ['High-Risk Pregnancy', 'Fetal Medicine', 'Gynecologic Surgery']
  },
  {
    email: 'dr.omar.almutairi@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'عمر',
    last_name: 'المطيري',
    medical_specialty: 'Emergency Medicine',
    city: 'Dammam',
    gender: 'male',
    experience_years: 8,
    hospital: 'King Fahd Specialist Hospital',
    phone: '+966507890123',
    bio: 'استشاري طب الطوارئ مع خبرة في إدارة الحالات الحرجة',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Emergency Medicine', 'Trauma Care'],
    interests: ['Trauma Medicine', 'Critical Care', 'Emergency Procedures']
  },
  {
    email: 'dr.layla.alharbi@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'ليلى',
    last_name: 'الغربي',
    medical_specialty: 'Psychiatry',
    city: 'Jeddah',
    gender: 'female',
    experience_years: 11,
    hospital: 'King Abdulaziz Hospital',
    phone: '+966508901234',
    bio: 'استشارية الطب النفسي مع تخصص في علاج اضطرابات القلق والاكتئاب',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Psychiatry', 'Child Psychiatry'],
    interests: ['Anxiety Disorders', 'Depression', 'Child Psychiatry']
  },
  {
    email: 'dr.yousef.alzahrani@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'يوسف',
    last_name: 'الزهراني',
    medical_specialty: 'Urology',
    city: 'Riyadh',
    gender: 'male',
    experience_years: 16,
    hospital: 'King Saud Medical City',
    phone: '+966509012345',
    bio: 'استشاري جراحة المسالك البولية مع خبرة في الجراحات الروبوتية',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Urology', 'Robotic Surgery'],
    interests: ['Robotic Surgery', 'Kidney Stones', 'Prostate Surgery']
  },
  {
    email: 'dr.amal.alshehri@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'أمل',
    last_name: 'الشهري',
    medical_specialty: 'Ophthalmology',
    city: 'Dammam',
    gender: 'female',
    experience_years: 13,
    hospital: 'King Fahd Specialist Hospital',
    phone: '+966510123456',
    bio: 'استشارية طب العيون مع تخصص في جراحات الشبكية',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Ophthalmology', 'Retinal Surgery'],
    interests: ['Retinal Surgery', 'Cataract Surgery', 'Pediatric Ophthalmology']
  },
  {
    email: 'dr.abdullah.alqahtani@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'عبدالله',
    last_name: 'القحطاني',
    medical_specialty: 'General Surgery',
    city: 'Jeddah',
    gender: 'male',
    experience_years: 19,
    hospital: 'King Fahd Hospital',
    phone: '+966511234567',
    bio: 'استشاري الجراحة العامة مع خبرة في جراحات الجهاز الهضمي',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of General Surgery', 'Laparoscopic Surgery'],
    interests: ['Laparoscopic Surgery', 'Gastrointestinal Surgery', 'Trauma Surgery']
  },
  {
    email: 'dr.hanan.alrashid@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'حنان',
    last_name: 'الراشد',
    medical_specialty: 'Endocrinology',
    city: 'Riyadh',
    gender: 'female',
    experience_years: 9,
    hospital: 'King Fahd Medical City',
    phone: '+966512345678',
    bio: 'استشارية الغدد الصماء مع تخصص في علاج السكري',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Endocrinology', 'Diabetes Management'],
    interests: ['Diabetes Management', 'Thyroid Disorders', 'Metabolic Disorders']
  },
  {
    email: 'dr.saad.alsulaimani@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'سعد',
    last_name: 'السليماني',
    medical_specialty: 'Pulmonology',
    city: 'Dammam',
    gender: 'male',
    experience_years: 17,
    hospital: 'King Fahd Specialist Hospital',
    phone: '+966513456789',
    bio: 'استشاري أمراض الصدر مع خبرة في علاج أمراض الرئة المزمنة',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Pulmonology', 'Critical Care Medicine'],
    interests: ['Chronic Lung Diseases', 'Critical Care', 'Sleep Medicine']
  },
  {
    email: 'dr.mona.alharbi@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'منى',
    last_name: 'الغربي',
    medical_specialty: 'Radiology',
    city: 'Jeddah',
    gender: 'female',
    experience_years: 12,
    hospital: 'King Abdulaziz Hospital',
    phone: '+966514567890',
    bio: 'استشارية الأشعة مع تخصص في التصوير بالرنين المغناطيسي',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Radiology', 'MRI Specialist'],
    interests: ['MRI Imaging', 'Neuroradiology', 'Breast Imaging']
  },
  {
    email: 'dr.faisal.alzahrani@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'فيصل',
    last_name: 'الزهراني',
    medical_specialty: 'Anesthesiology',
    city: 'Riyadh',
    gender: 'male',
    experience_years: 14,
    hospital: 'King Saud Medical City',
    phone: '+966515678901',
    bio: 'استشاري التخدير مع خبرة في التخدير للجراحات المعقدة',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Anesthesiology', 'Pain Management'],
    interests: ['Pain Management', 'Critical Care Anesthesia', 'Regional Anesthesia']
  },
  {
    email: 'dr.reem.alshehri@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'ريم',
    last_name: 'الشهري',
    medical_specialty: 'Pathology',
    city: 'Dammam',
    gender: 'female',
    experience_years: 10,
    hospital: 'King Fahd Specialist Hospital',
    phone: '+966516789012',
    bio: 'استشارية علم الأمراض مع تخصص في علم الأمراض الجراحي',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Pathology', 'Surgical Pathology'],
    interests: ['Surgical Pathology', 'Cytopathology', 'Molecular Pathology']
  },
  {
    email: 'dr.tariq.alqahtani@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'طارق',
    last_name: 'القحطاني',
    medical_specialty: 'Gastroenterology',
    city: 'Jeddah',
    gender: 'male',
    experience_years: 15,
    hospital: 'King Fahd Hospital',
    phone: '+966517890123',
    bio: 'استشاري أمراض الجهاز الهضمي مع خبرة في التنظير الداخلي',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Gastroenterology', 'Advanced Endoscopy'],
    interests: ['Advanced Endoscopy', 'Inflammatory Bowel Disease', 'Liver Diseases']
  },
  {
    email: 'dr.nadia.alrashid@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'نادية',
    last_name: 'الراشد',
    medical_specialty: 'Hematology',
    city: 'Riyadh',
    gender: 'female',
    experience_years: 11,
    hospital: 'King Fahd Medical City',
    phone: '+966518901234',
    bio: 'استشارية أمراض الدم مع تخصص في علاج سرطان الدم',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Hematology', 'Oncology'],
    interests: ['Blood Cancers', 'Bone Marrow Transplantation', 'Hemophilia']
  },
  {
    email: 'dr.waleed.alsulaimani@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'وليد',
    last_name: 'السليماني',
    medical_specialty: 'Rheumatology',
    city: 'Dammam',
    gender: 'male',
    experience_years: 13,
    hospital: 'King Fahd Specialist Hospital',
    phone: '+966519012345',
    bio: 'استشاري أمراض الروماتيزم مع خبرة في علاج التهاب المفاصل',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Rheumatology', 'Autoimmune Diseases'],
    interests: ['Rheumatoid Arthritis', 'Lupus', 'Autoimmune Diseases']
  },
  {
    email: 'dr.salma.alharbi@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'سلمى',
    last_name: 'الغربي',
    medical_specialty: 'Nephrology',
    city: 'Jeddah',
    gender: 'female',
    experience_years: 16,
    hospital: 'King Abdulaziz Hospital',
    phone: '+966520123456',
    bio: 'استشارية أمراض الكلى مع خبرة في زراعة الكلى',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Nephrology', 'Transplant Medicine'],
    interests: ['Kidney Transplantation', 'Dialysis', 'Chronic Kidney Disease']
  },
  {
    email: 'dr.khaled.alzahrani@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'خالد',
    last_name: 'الزهراني',
    medical_specialty: 'Oncology',
    city: 'Riyadh',
    gender: 'male',
    experience_years: 18,
    hospital: 'King Saud Medical City',
    phone: '+966521234567',
    bio: 'استشاري الأورام مع خبرة في علاج السرطان بالعلاج الموجه',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Oncology', 'Targeted Therapy'],
    interests: ['Targeted Therapy', 'Immunotherapy', 'Breast Cancer']
  },
  {
    email: 'dr.hala.alshehri@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'هالة',
    last_name: 'الشهري',
    medical_specialty: 'Physical Medicine',
    city: 'Dammam',
    gender: 'female',
    experience_years: 9,
    hospital: 'King Fahd Specialist Hospital',
    phone: '+966522345678',
    bio: 'استشارية الطب الطبيعي مع تخصص في إعادة التأهيل',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Physical Medicine', 'Rehabilitation Medicine'],
    interests: ['Rehabilitation Medicine', 'Sports Medicine', 'Pain Management']
  },
  {
    email: 'dr.bandar.alqahtani@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'بندر',
    last_name: 'القحطاني',
    medical_specialty: 'Infectious Diseases',
    city: 'Jeddah',
    gender: 'male',
    experience_years: 12,
    hospital: 'King Fahd Hospital',
    phone: '+966523456789',
    bio: 'استشاري الأمراض المعدية مع خبرة في علاج العدوى المقاومة',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Infectious Diseases', 'Antimicrobial Stewardship'],
    interests: ['Antimicrobial Resistance', 'Hospital Infections', 'Travel Medicine']
  },
  {
    email: 'dr.manal.alrashid@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'منال',
    last_name: 'الراشد',
    medical_specialty: 'Family Medicine',
    city: 'Riyadh',
    gender: 'female',
    experience_years: 7,
    hospital: 'King Fahd Medical City',
    phone: '+966524567890',
    bio: 'استشارية طب الأسرة مع تخصص في الطب الوقائي',
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Family Medicine', 'Preventive Medicine'],
    interests: ['Preventive Medicine', 'Chronic Disease Management', 'Health Promotion']
  }
]

async function cleanupExistingData() {
  console.log('🧹 Cleaning up existing test data...')
  
  try {
    // Delete profiles first (due to foreign key constraints)
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .like('email', '%@beyondrounds.com')

    if (profilesError) {
      console.log('⚠️  Profiles cleanup warning:', profilesError.message)
    } else {
      console.log('✅ Existing profiles cleaned up')
    }

    // List and delete auth users
    const { data: users } = await supabase.auth.admin.listUsers()
    const testUsers = users.users.filter(user => user.email.includes('@beyondrounds.com'))
    
    for (const user of testUsers) {
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      if (error) {
        console.log(`⚠️  Could not delete user ${user.email}:`, error.message)
      }
    }
    
    console.log(`✅ Cleaned up ${testUsers.length} existing test users`)
  } catch (error) {
    console.log('⚠️  Cleanup warning:', error.message)
  }
}

async function createMedicalProfessionals() {
  console.log('\n👥 Creating 25 Medical Professional Accounts...')
  console.log('================================================')
  
  const createdUsers = []
  
  for (let i = 0; i < medicalProfessionals.length; i++) {
    const prof = medicalProfessionals[i]
    
    try {
      console.log(`\n📝 Creating user ${i + 1}/25: ${prof.email}`)
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: prof.email,
        password: prof.password,
        email_confirm: true,
        user_metadata: {
          first_name: prof.first_name,
          last_name: prof.last_name,
          medical_specialty: prof.medical_specialty,
          city: prof.city
        }
      })

      if (authError) {
        console.error(`❌ Auth error for ${prof.email}:`, authError.message)
        continue
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          email: prof.email,
          first_name: prof.first_name,
          last_name: prof.last_name,
          medical_specialty: prof.medical_specialty,
          city: prof.city,
          gender: prof.gender,
          role: 'user',
          is_verified: true,
          is_banned: false,
          onboarding_completed: true,
          profile_completion: 100,
          bio: prof.bio,
          phone: prof.phone,
          hospital: prof.hospital,
          experience_years: prof.experience_years,
          languages: prof.languages,
          certifications: prof.certifications,
          interests: prof.interests,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error(`❌ Profile error for ${prof.email}:`, profileError.message)
        continue
      }

      console.log(`✅ Created: ${prof.first_name} ${prof.last_name} (${prof.medical_specialty})`)
      createdUsers.push(prof)
      
    } catch (error) {
      console.error(`❌ Unexpected error for ${prof.email}:`, error.message)
    }
  }
  
  return createdUsers
}

async function createAdminAccount() {
  console.log('\n👑 Creating Admin Account...')
  console.log('============================')
  
  try {
    // Check if admin exists
    const { data: users } = await supabase.auth.admin.listUsers()
    const existingAdmin = users.users.find(u => u.email === 'admin@beyondrounds.com')
    
    if (existingAdmin) {
      console.log('✅ Admin account already exists')
      return existingAdmin
    }

    // Create admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@beyondrounds.com',
      password: 'AdminPassword123!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      }
    })

    if (authError) {
      console.error('❌ Admin auth error:', authError.message)
      return null
    }

    // Create admin profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email: 'admin@beyondrounds.com',
        first_name: 'Admin',
        last_name: 'User',
        medical_specialty: 'Administration',
        city: 'Riyadh',
        gender: 'prefer-not-to-say',
        role: 'admin',
        is_verified: true,
        is_banned: false,
        onboarding_completed: true,
        profile_completion: 100,
        bio: 'System Administrator',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('❌ Admin profile error:', profileError.message)
      return null
    }

    console.log('✅ Admin account created successfully')
    return authData.user
    
  } catch (error) {
    console.error('❌ Admin creation error:', error.message)
    return null
  }
}

async function generateTestData() {
  console.log('🏥 BeyondRounds Medical Matching System')
  console.log('========================================')
  console.log('Complete Test Data Generator')
  console.log('Creating 25 verified medical professionals + Admin\n')

  try {
    // Cleanup existing data
    await cleanupExistingData()
    
    // Create medical professionals
    const createdUsers = await createMedicalProfessionals()
    
    // Create admin account
    await createAdminAccount()
    
    console.log('\n🎉 Test Data Generation Complete!')
    console.log('================================')
    console.log(`✅ Created ${createdUsers.length} medical professionals`)
    console.log('✅ Created admin account')
    console.log('\n📋 Login Credentials:')
    console.log('====================')
    console.log('🔑 All medical professionals use password: MedicalPass123!')
    console.log('👑 Admin password: AdminPassword123!')
    console.log('\n📧 Sample Accounts:')
    console.log('==================')
    console.log('• dr.ahmed.alharbi@beyondrounds.com (Cardiology)')
    console.log('• dr.sara.almansouri@beyondrounds.com (Pediatrics)')
    console.log('• dr.mohammed.alshehri@beyondrounds.com (Orthopedics)')
    console.log('• admin@beyondrounds.com (Admin)')
    console.log('\n🔗 Login at: http://localhost:3000/auth/login')
    
  } catch (error) {
    console.error('❌ Test data generation failed:', error.message)
  }
}

// Run the script
generateTestData().catch(console.error)

