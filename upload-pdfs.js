// upload-pdfs.js - Debug Version
import dotenv from 'dotenv';
dotenv.config();

import { put } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';

async function upload() {
  try {
    // Debug: Check what's in your environment
    console.log('🔍 Environment Debug:');
    console.log('- Current working directory:', process.cwd());
    console.log('- .env file location:', path.join(process.cwd(), '.env'));
    console.log('- BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN);
    console.log('- Token preview:', process.env.BLOB_READ_WRITE_TOKEN ? 
      `${process.env.BLOB_READ_WRITE_TOKEN.substring(0, 20)}...` : 'NOT FOUND');

    // Check if .env file exists
    try {
      await fs.access(path.join(process.cwd(), '.env'));
      console.log('✅ .env file found');
    } catch {
      console.log('❌ .env file NOT found - create it in your project root');
      return;
    }

    // Explicitly check if the required token is loaded
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      console.log('\n❌ BLOB_READ_WRITE_TOKEN not found. Please:');
      console.log('1. Create a .env file in your project root');
      console.log('2. Add: BLOB_READ_WRITE_TOKEN=your_token_here');
      console.log('3. Get your token from: Vercel Dashboard → Storage → Blob → Settings');
      throw new Error("BLOB_READ_WRITE_TOKEN not found in your .env file.");
    }

    const reportsDir = path.join(process.cwd(), 'reports');
    
    // Check if reports directory exists
    try {
      await fs.access(reportsDir);
      console.log('✅ reports directory found');
    } catch {
      console.log('❌ reports directory NOT found - create it and add your PDF files');
      return;
    }

    const files = await fs.readdir(reportsDir);
    const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');

    console.log(`\n📁 Found ${files.length} total files, ${pdfFiles.length} PDF files`);
    console.log('PDF files:', pdfFiles);

    if (pdfFiles.length === 0) {
      console.log('❌ No PDF files found in reports directory');
      return;
    }

    console.log('\n🚀 Starting upload process...');

    for (const file of pdfFiles) {
      const filePath = path.join(reportsDir, file);
      const fileBuffer = await fs.readFile(filePath);

      console.log(`📤 Uploading ${file} (${fileBuffer.length} bytes)...`);

      const blob = await put(file, fileBuffer, {
        access: 'public',
        token: blobToken,
      });

      console.log(`  ✅ Uploaded ${file} successfully!`);
      console.log(`  📍 URL: ${blob.url}\n`);
    }
    
    console.log("🎉 All PDF files uploaded successfully!");

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error("\n❌ Error: File or directory not found.");
    } else if (error.message.includes('BLOB_READ_WRITE_TOKEN')) {
      console.error("\n❌ Token Error:", error.message);
    } else {
      console.error("\n❌ Upload Error:", error.message);
      console.error("Full error:", error);
    }
  }
}

upload();