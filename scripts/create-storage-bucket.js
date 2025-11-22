/**
 * Script untuk create storage bucket 'documents' di Supabase
 *
 * Run: node scripts/create-storage-bucket.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local or .env manually
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envPath = path.join(__dirname, '..', '.env');
const targetEnvPath = fs.existsSync(envLocalPath) ? envLocalPath : envPath;

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (fs.existsSync(targetEnvPath)) {
  console.log(`📖 Reading env from: ${targetEnvPath}\n`);
  const envFile = fs.readFileSync(targetEnvPath, 'utf8');
  const envLines = envFile.split('\n');

  envLines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');

      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value;
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseServiceKey = value;
      if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && !supabaseServiceKey) supabaseServiceKey = value;
    }
  });
} else {
  console.error('❌ File .env atau .env.local tidak ditemukan');
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env.local');
  console.error('   Pastikan file .env.local ada dan berisi kedua variable tersebut.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDocumentsBucket() {
  console.log('🚀 Creating storage bucket "documents"...\n');

  try {
    // 1. Create bucket
    const { data: bucket, error: bucketError } = await supabase
      .storage
      .createBucket('documents', {
        public: true,
        fileSizeLimit: 52428800, // 50 MB
        allowedMimeTypes: [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
        ]
      });

    if (bucketError) {
      if (bucketError.message?.includes('already exists')) {
        console.log('ℹ️  Bucket "documents" sudah ada, skip create.');
      } else {
        throw bucketError;
      }
    } else {
      console.log('✅ Bucket "documents" berhasil dibuat!');
      console.log('   Bucket ID:', bucket.name);
    }

    // 2. Verify bucket exists
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) {
      throw listError;
    }

    const documentsBucket = buckets.find(b => b.name === 'documents');
    if (documentsBucket) {
      console.log('\n📊 Bucket "documents" details:');
      console.log('   Name:', documentsBucket.name);
      console.log('   ID:', documentsBucket.id);
      console.log('   Public:', documentsBucket.public);
      console.log('   Created at:', documentsBucket.created_at);
    }

    // 3. Test upload
    console.log('\n🧪 Testing upload...');
    const testFile = Buffer.from('Test file content');
    const testPath = `test-${Date.now()}.txt`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload(testPath, testFile, {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    console.log('✅ Test upload berhasil!');
    console.log('   Path:', uploadData.path);

    // 4. Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('documents')
      .getPublicUrl(testPath);

    console.log('   Public URL:', publicUrlData.publicUrl);

    // 5. Cleanup test file
    await supabase.storage.from('documents').remove([testPath]);
    console.log('   Test file cleaned up.');

    console.log('\n✅ Setup complete! Bucket "documents" siap digunakan.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nDetail:', error);

    console.log('\n💡 Troubleshooting:');
    console.log('   1. Pastikan Anda menggunakan Service Role Key (bukan Anon Key)');
    console.log('   2. Cek di Supabase Dashboard → Settings → API → service_role key');
    console.log('   3. Copy key tersebut ke .env.local sebagai SUPABASE_SERVICE_ROLE_KEY');
    console.log('   4. Atau buat bucket manual di Dashboard → Storage → New bucket');

    process.exit(1);
  }
}

createDocumentsBucket();
