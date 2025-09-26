import { Database } from '@/lib/types/database-updated'

type ProfilesUpdate = Database['public']['Tables']['users']['Update']

/**
 * Calculate basic profile completion based on form data
 * This is a simplified version that only considers fields in the users table
 */
function calculateBasicProfileCompletion(formData: any): number {
  let score = 0
  
  // Basic Information (40 points total)
  if (formData?.firstName?.trim()) score += 10
  if (formData?.lastName?.trim()) score += 10
  if (formData?.age) score += 5
  if (formData?.city?.trim()) score += 10
  if (formData?.nationality?.trim()) score += 5

  // Medical Background (30 points total)
  if (formData?.medicalSpecialty?.trim()) score += 15
  if (formData?.specialties && formData.specialties.length > 0) score += 15

  // Additional Information (30 points total)
  if (formData?.gender) score += 5
  if (formData?.lookingFor?.trim()) score += 10
  if (formData?.careerStage) score += 15

  return Math.min(score, 100)
};

type Nil<T> = T | null | undefined;

const maps = {
  gender_preference: new Map([
    ['no preference', 'no_preference'],
    ['no_preference', 'no_preference'],
    ['mixed', 'mixed'],
    ['mixed_preferred', 'mixed'], // your old UI value
    ['same gender only', 'same_gender_only'],
    ['same_gender_only', 'same_gender_only'],
    ['same gender preferred', 'same_gender_preferred'],
    ['same_gender_preferred', 'same_gender_preferred'],
  ]),

  specialty_preference: new Map([
    ['no preference', 'no_preference'],
    ['no_preference', 'no_preference'],
    ['same', 'same'],
    ['different', 'different'],
  ]),

  career_stage: new Map([
    ['medical student', 'medical_student'],
    ['resident (1-2)', 'resident_1_2'],
    ['resident (3+)', 'resident_3_plus'],
    ['fellow', 'fellow'],
    ['attending (0-5)', 'attending_0_5'],
    ['attending (5+)', 'attending_5_plus'],
    ['private practice', 'private_practice'],
    ['academic medicine', 'academic_medicine'],
    ['other', 'other'],
  ]),

  activity_level: new Map([
    ['very_active','very_active'],
    ['active','active'],
    ['moderately_active','moderately_active'],
    ['occasionally_active','occasionally_active'],
    ['non_physical','non_physical'],
  ]),

  social_energy_level: new Map([
    ['very_high','very_high'],
    ['high','high'],
    ['moderate','moderate'],
    ['low','low'],
  ]),

  conversation_style: new Map([
    ['deep_philosophical','deep_philosophical'],
    ['light_casual','light_casual'],
    ['professional_focused','professional_focused'],
    ['professional_focused','professional_focused'],
    ['mixed','mixed'],
  ]),

  meeting_frequency: new Map([
    ['weekly','weekly'],
    ['bi_weekly','bi_weekly'],
    ['monthly','monthly'],
    ['as schedules allow','flexible'],
    ['flexible','flexible'],
  ]),

  life_stage: new Map([
    ['single','single'],
    ['dating','dating'],
    ['married','married'],
    ['parent','parent'],
    ['parent','parent'],
    ['empty_nester','empty_nester'],
    ['single','single'],
  ]),

  ideal_weekend: new Map([
    ['adventure-and-exploration','adventure_exploration'],
    ['relaxation-and-self-care','relaxation_self_care'],
    ['social_activities-with-friends','social_activities'],
    ['cultural_activities-(museums,-shows)','cultural_activities'],
    ['sports-and-fitness','sports_fitness'],
    ['home-projects-and-hobbies','home_projects_hobbies'],
    ['mix-of-active-and-relaxing','mix_active_relaxing'],
    // Also support the direct database values
    ['adventure_exploration','adventure_exploration'],
    ['relaxation_self_care','relaxation_self_care'],
    ['social_activities','social_activities'],
    ['cultural_activities','cultural_activities'],
    ['sports_fitness','sports_fitness'],
    ['home_projects_hobbies','home_projects_hobbies'],
    ['mix_active_relaxing','mix_active_relaxing'],
  ]),
};

const norm = (map: Map<string,string>, v: Nil<string>) =>
  v == null || v === '' ? null : (map.get(v) ?? v);

// "" -> null,  undefined يبقى undefined (لن يُرسل)
const nn = (v: any) => {
  if (v === undefined) return undefined;
  if (v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : v;
};

// لا ترسل مصفوفة فاضية (كي لا تمسح القيمة القديمة)
const arr = (v: any) => (Array.isArray(v) && v.length > 0 ? v : undefined);

// sports -> jsonb; لو فاضي لا ترسل
const sportsObj = (sports: any) => {
  if (!Array.isArray(sports) || sports.length === 0) return undefined;
  return sports.reduce((acc: Record<string, number>, s: string) => {
    const k = String(s || '').trim();
    if (k) acc[k] = 3;
    return acc;
  }, {});
};

/**
 * Safe mapper that normalizes all enums and converts empties to null
 * Maps UserFormData to database update format with proper type safety
 * Updated to handle new schema fields
 */
export function mapFormToProfilesUpdate(formData: any): ProfilesUpdate {
  const age =
    formData?.age != null && String(formData.age).trim() !== ''
      ? Number(formData.age)
      : undefined;

  // دعم الاسم القديم medical_specialty (اختيار واحد) + specialties (متعدد)
  const uiSpecialties = Array.isArray(formData?.specialties) ? formData.specialties : undefined;
  const uiMedicalSpecialty =
    formData?.medicalSpecialty != null && String(formData.medicalSpecialty).trim() !== ''
      ? String(formData.medicalSpecialty).trim()
      : undefined;

  const mergedSpecialties =
    uiSpecialties?.length ? uiSpecialties : uiMedicalSpecialty ? [uiMedicalSpecialty] : undefined;

  // مخرجات مطابقة للـ CHECK constraints بالحروف نفسها عبر norm(...)
  const payload: ProfilesUpdate = {
    // Ensure required fields are not null
    first_name: nn(formData?.firstName) || 'Unknown',
    last_name : nn(formData?.lastName) || 'User',
    city: nn(formData?.city) || 'Unknown',

    age: Number.isFinite(age as number) ? (age as number) : undefined,

    gender: nn(formData?.gender) as any,
    nationality: nn(formData?.nationality),

    // medical_specialty (اختيار واحد) — قاعدة البيانات تستخدم medical_specialty كـ TEXT
    // Ensure this field is not null since it's required in the database
    medical_specialty: nn(formData?.medicalSpecialty) || nn(formData?.specialties?.[0]) || 'General Practice',

    // Only include fields that exist in the users table
    // Other fields like gender_preference, specialty_preference, career_stage, etc. are in separate tables
    looking_for: nn(formData?.lookingFor),

    // Calculate profile completion based on available data
    profile_completion_percentage: calculateBasicProfileCompletion(formData),

    // عيّنها فقط لحظة إنهاء الأونبوردنغ، وليس كل تحديث
    onboarding_completed: formData?.completeOnboarding === true ? true : undefined,

    // لا ترسل updated_at — التريجر سيحدثها تلقائيًا
  };

  return payload;
}
