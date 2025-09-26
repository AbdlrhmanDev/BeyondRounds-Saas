#!/usr/bin/env node

/**
 * سكربت CLI مبسط لاختبار النظام الإداري
 * 
 * الاستخدام:
 * node scripts/testAdminCLI.js profiles uuid '{"first_name":"عبدالله"}'
 */

const { config } = require('dotenv');
config();

async function testAdminUpdate(table, id, patch) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '') || 'http://localhost:3000';
  const url = `${baseUrl}/api/admin/update`;
  
  const adminToken = process.env.ADMIN_MUTATION_TOKEN;
  if (!adminToken) {
    console.error('❌ ADMIN_MUTATION_TOKEN غير محدد في متغيرات البيئة');
    return;
  }
  
  const body = {
    table,
    id,
    patch: JSON.parse(patch),
    returnAll: true
  };
  
  console.log('🔧 إرسال طلب تحديث إداري...');
  console.log(`📋 الجدول: ${table}`);
  console.log(`🆔 المعرف: ${id}`);
  console.log(`📝 التحديث: ${patch}`);
  console.log('');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify(body)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ التحديث نجح!');
      console.log('📊 النتيجة:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ فشل التحديث');
      console.log('📋 الخطأ:', result.error);
      if (result.details) {
        console.log('📝 التفاصيل:', result.details);
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
  }
}

// تشغيل السكربت
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log(`
استخدام السكربت:
  node scripts/testAdminCLI.js <table> <id> '<patch_json>'

أمثلة:
  node scripts/testAdminCLI.js profiles 00000000-0000-0000-0000-000000000000 '{"first_name":"عبدالله","city":"الرياض"}'
  node scripts/testAdminCLI.js chat_messages 11111111-1111-1111-1111-111111111111 '{"is_flagged":true,"flag_reason":"محتوى غير مناسب"}'
  node scripts/testAdminCLI.js matches 22222222-2222-2222-2222-222222222222 '{"status":"completed"}'

الجداول المتاحة:
  profiles, chat_messages, matches, notifications, payments, user_preferences, etc.
`);
  process.exit(1);
}

const [table, id, patch] = args;
testAdminUpdate(table, id, patch);


