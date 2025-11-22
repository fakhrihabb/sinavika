/**
 * Test upload file ke Supabase Storage bucket 'documents'
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  console.log('🧪 Testing Supabase Storage Upload...\n');
  console.log('URL:', supabaseUrl);
  console.log('');

  try {
    // Create test file
    const testContent = Buffer.from('Test file content - ' + new Date().toISOString());
    const fileName = `test-${Date.now()}.txt`;
    const filePath = `public/${fileName}`;

    console.log('📤 Uploading test file to bucket "documents"...');
    console.log('   Path:', filePath);

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, testContent, {
        contentType: 'text/plain',
        upsert: true,
      });

    if (error) {
      console.error('\n❌ Upload FAILED!');
      console.error('   Error:', error.message);
      console.error('   Status:', error.statusCode);
      console.error('\nFull error:', error);

      if (error.message?.includes('Bucket not found') || error.statusCode === '404') {
        console.log('\n💡 Bucket "documents" tidak ditemukan!');
        console.log('\n🔧 Pastikan:');
        console.log('   1. Buka: https://supabase.com/dashboard/project/xiqcpytcvubmypevflme/storage/buckets');
        console.log('   2. Lihat apakah bucket "documents" ada di list');
        console.log('   3. Jika tidak ada, buat dengan klik "New bucket"');
        console.log('   4. Name: documents, Public: ON');
      } else if (error.message?.includes('row-level security') || error.statusCode === '403') {
        console.log('\n💡 RLS Policy belum diset!');
        console.log('\n🔧 Run SQL query ini di Supabase SQL Editor:');
        console.log(`
-- Allow public uploads
CREATE POLICY IF NOT EXISTS "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents');

-- Allow public reads
CREATE POLICY IF NOT EXISTS "Allow public reads"
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
      }

      return;
    }

    console.log('\n✅ Upload SUCCESS!');
    console.log('   Path:', data.path);
    console.log('   Full path:', data.fullPath);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    console.log('   Public URL:', urlData.publicUrl);

    // Cleanup
    console.log('\n🧹 Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (deleteError) {
      console.warn('   Warning: Failed to delete test file:', deleteError.message);
    } else {
      console.log('   ✅ Test file deleted');
    }

    console.log('\n🎉 Storage bucket "documents" is working perfectly!');
    console.log('   Upload file di chatbot seharusnya sudah bisa.\n');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.error('\nFull error:', error);
  }
}

testUpload();
