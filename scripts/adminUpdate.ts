#!/usr/bin/env node

/**
 * Admin Update CLI Wrapper
 * 
 * A convenient command-line tool to call the admin update API.
 * 
 * Usage:
 *   tsx scripts/adminUpdate.ts profiles 00000000-0000-0000-0000-000000000000 '{"first_name":"John","city":"London"}'
 *   tsx scripts/adminUpdate.ts --table profiles --id 00000000-0000-0000-0000-000000000000 --patch '{"first_name":"John"}' --return-all
 */

import { config } from 'dotenv';

// Load environment variables
config();

interface UpdateRequest {
  table: string;
  id: string;
  patch: Record<string, unknown>;
  returnAll?: boolean;
}

interface UpdateResponse {
  success: boolean;
  data?: any;
  error?: string;
  details?: any;
  meta?: {
    table: string;
    id: string;
    updatedColumns: string[];
    timestamp: string;
  };
}

async function callAdminUpdateAPI(request: UpdateRequest): Promise<UpdateResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '') || 'http://localhost:3000';
  const url = `${baseUrl}/api/admin/update`;
  
  const adminToken = process.env.ADMIN_MUTATION_TOKEN;
  if (!adminToken) {
    throw new Error('ADMIN_MUTATION_TOKEN environment variable is required');
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': adminToken
    },
    body: JSON.stringify(request)
  });
  
  return await response.json();
}

function parseArgs(): UpdateRequest {
  const args = process.argv.slice(2);
  
  // Simple positional arguments: table id patch
  if (args.length >= 3 && !args[0].startsWith('--')) {
    const [table, id, patchJson] = args;
    
    try {
      const patch = JSON.parse(patchJson);
      return { table, id, patch };
    } catch (error) {
      throw new Error(`Invalid JSON in patch argument: ${patchJson}`);
    }
  }
  
  // Named arguments
  let table = '';
  let id = '';
  let patch: Record<string, unknown> = {};
  let returnAll = false;
  
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];
    
    switch (flag) {
      case '--table':
      case '-t':
        table = value;
        break;
      case '--id':
      case '-i':
        id = value;
        break;
      case '--patch':
      case '-p':
        try {
          patch = JSON.parse(value);
        } catch (error) {
          throw new Error(`Invalid JSON in patch: ${value}`);
        }
        break;
      case '--return-all':
      case '-r':
        returnAll = true;
        i--; // No value for this flag
        break;
      default:
        throw new Error(`Unknown flag: ${flag}`);
    }
  }
  
  if (!table || !id || Object.keys(patch).length === 0) {
    throw new Error('Missing required arguments: table, id, and patch');
  }
  
  return { table, id, patch, returnAll };
}

function showUsage() {
  console.log(`
Admin Update CLI Tool

Usage:
  # Positional arguments
  tsx scripts/adminUpdate.ts <table> <id> '<patch_json>'
  
  # Named arguments  
  tsx scripts/adminUpdate.ts --table <table> --id <id> --patch '<patch_json>' [--return-all]

Examples:
  tsx scripts/adminUpdate.ts profiles 00000000-0000-0000-0000-000000000000 '{"first_name":"John","city":"London"}'
  
  tsx scripts/adminUpdate.ts \\
    --table profiles \\
    --id 00000000-0000-0000-0000-000000000000 \\
    --patch '{"first_name":"John","is_verified":true}' \\
    --return-all

Environment Variables:
  ADMIN_MUTATION_TOKEN - Required admin authentication token
  NEXT_PUBLIC_SUPABASE_URL - Supabase URL (optional, defaults to localhost:3000)

Flags:
  --table, -t      Table name to update
  --id, -i         UUID of the record to update  
  --patch, -p      JSON object with fields to update
  --return-all, -r Return all columns (not just allowed ones)
  --help, -h       Show this help message
`);
}

async function main() {
  try {
    const args = process.argv.slice(2);
    
    // Show help
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
      showUsage();
      return;
    }
    
    // Parse arguments
    const request = parseArgs();
    
    console.log('🔧 Admin Update Request:');
    console.log(`   Table: ${request.table}`);
    console.log(`   ID: ${request.id}`);
    console.log(`   Patch: ${JSON.stringify(request.patch, null, 2)}`);
    console.log(`   Return All: ${request.returnAll || false}`);
    console.log('');
    
    // Make API call
    console.log('📡 Calling admin update API...');
    const response = await callAdminUpdateAPI(request);
    
    // Handle response
    if (response.success) {
      console.log('✅ Update successful!');
      console.log('');
      
      if (response.meta) {
        console.log('📊 Update Summary:');
        console.log(`   Updated Columns: ${response.meta.updatedColumns.join(', ')}`);
        console.log(`   Timestamp: ${response.meta.timestamp}`);
        console.log('');
      }
      
      if (response.data) {
        console.log('📋 Updated Record:');
        console.log(JSON.stringify(response.data, null, 2));
      }
    } else {
      console.log('❌ Update failed!');
      console.log(`   Error: ${response.error}`);
      
      if (response.details) {
        console.log(`   Details: ${JSON.stringify(response.details, null, 2)}`);
      }
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ CLI Error:', (error as Error).message);
    console.log('');
    showUsage();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as adminUpdate };


