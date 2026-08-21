import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'zoning-documents';
const PDF_DIR = 'C:/Users/shaba/Downloads/Zoning AI';

async function uploadPDFs() {
  console.log('🏁 Starting PDF upload to Supabase Storage...');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing database credentials! Please check your .env file.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // 1. Ensure the storage bucket exists (create if not present)
  console.log(`Checking/Creating bucket: "${BUCKET_NAME}"...`);
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 52428800 // 50MB
  });

  if (bucketError) {
    if (bucketError.message.includes('already exists') || bucketError.message.includes('Duplicate')) {
      console.log(`ℹ️ Bucket "${BUCKET_NAME}" already exists. Proceeding to upload.`);
    } else {
      console.error('❌ Error creating bucket:', bucketError.message);
      process.exit(1);
    }
  } else {
    console.log(`✅ Created public bucket "${BUCKET_NAME}".`);
  }

  // 2. Read PDFs from the local directory
  if (!fs.existsSync(PDF_DIR)) {
    console.error(`❌ Local PDF directory does not exist: ${PDF_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(PDF_DIR).filter(file => file.toLowerCase().endsWith('.pdf'));
  console.log(`Files found in directory: ${files.join(', ')}`);

  if (files.length === 0) {
    console.log('⚠️ No PDF files found to upload.');
    return;
  }

  // 3. Upload each file to Supabase Storage
  for (const file of files) {
    const filePath = path.join(PDF_DIR, file);
    const fileBuffer = fs.readFileSync(filePath);
    
    console.log(`📤 Uploading ${file} (${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB)...`);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(file, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true // Overwrite if it already exists
      });

    if (error) {
      console.error(`❌ Failed to upload ${file}:`, error.message);
    } else {
      console.log(`✅ Successfully uploaded ${file} to ${data.path}`);
    }
  }

  console.log('🎉 All PDFs have been processed.');
}

uploadPDFs();
