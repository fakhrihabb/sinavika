/**
 * Script untuk check storage buckets yang ada di Supabase
 *
 * Run: node scripts/check-buckets.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env
const envPath = fs.existsSync(path.join(__dirname, '..', '.env.local'))
  ? path.join(__dirname, '..', '.env.local')
  : path.join(__dirname, '..', '.env');

let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');

      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value;
      if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = value;
    }
  });
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBuckets() {
  console.log('🔍 Checking Supabase Storage Buckets...\n');
  console.log('URL:', supabaseUrl);
  console.log('');

  try {
    // List all buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('❌ Error listing buckets:', error.message);
      console.error('\nDetail:', error);
      return;
    }

    if (!buckets || buckets.length === 0) {
      console.log('⚠️  No buckets found!\n');
      console.log('Bucket "documents" tidak ada. Anda perlu membuatnya.');
      console.log('\n📝 Cara membuat bucket:');
      console.log('   1. Buka: https://supabase.com/dashboard');
      console.log('   2. Pilih project SINAVIKA');
      console.log('   3. Storage → New bucket');
      console.log('   4. Name: documents, Public: ✅ ON');
      return;
    }

    console.log(`✅ Found ${buckets.length} bucket(s):\n`);

    buckets.forEach((bucket, index) => {
      console.log(`${index + 1}. Bucket: "${bucket.name}"`);
      console.log(`   ID: ${bucket.id}`);
      console.log(`   Public: ${bucket.public ? '✅ YES' : '❌ NO'}`);
      console.log(`   Created: ${bucket.created_at}`);
      console.log('');
    });

    // Check if 'documents' bucket exists
    const documentsBucket = buckets.find(b => b.id === 'documents' || b.name === 'documents');

    if (documentsBucket) {
      console.log('✅ Bucket "documents" EXISTS!\n');
      console.log('📊 Details:');
      console.log(`   Name: ${documentsBucket.name}`);
      console.log(`   ID: ${documentsBucket.id}`);
      console.log(`   Public: ${documentsBucket.public ? '✅ YES' : '❌ NO (WARNING!)'}`);

      if (!documentsBucket.public) {
        console.log('\n⚠️  WARNING: Bucket is NOT public!');
        console.log('   Ubah menjadi public di Dashboard → Storage → documents → Settings');
      }

      // Try to upload a test file
      console.log('\n🧪 Testing upload...');
      const testFile = Buffer.from('Test upload');
      const testPath = `test-${Date.now()}.txt`;

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('documents')
        .upload(testPath, testFile, {
          contentType: 'text/plain',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Upload FAILED:', uploadError.message);
        console.log('\n💡 Possible issues:');
        console.log('   1. RLS policies not set correctly');
        console.log('   2. Bucket not public');
        console.log('   3. Missing storage policies');
        console.log('\n🔧 Fix dengan SQL query ini di Supabase SQL Editor:');
        console.log(`
-- Allow public uploads
CREATE POLICY IF NOT EXISTS "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents');

-- Allow public downloads
CREATE POLICY IF NOT EXISTS "Allow public downloads"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- Allow public updates
CREATE POLICY IF NOT EXISTS "Allow public updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents');

-- Allow public deletes
CREATE POLICY IF NOT EXISTS "Allow public deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents');
        `);
      } else {
        console.log('✅ Upload SUCCESS!');
        console.log(`   Path: ${uploadData.path}`);

        // Cleanup
        await supabase.storage.from('documents').remove([testPath]);
        console.log('   (test file cleaned up)');

        console.log('\n🎉 Bucket "documents" is working perfectly!');
      }

    } else {
      console.log('❌ Bucket "documents" NOT FOUND!\n');
      console.log('Anda perlu membuat bucket "documents".');
      console.log('\n📝 Cara membuat bucket:');
      console.log('   1. Buka: https://supabase.com/dashboard');
      console.log('   2. Pilih project SINAVIKA');
      console.log('   3. Storage → New bucket');
      console.log('   4. Name: documents, Public: ✅ ON');
      console.log('\nAtau run SQL query di SQL Editor:');
      console.log(`
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('documents', 'documents', true, 52428800)
ON CONFLICT (id) DO NOTHING;
      `);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nDetail:', error);
  }
}

checkBuckets();
