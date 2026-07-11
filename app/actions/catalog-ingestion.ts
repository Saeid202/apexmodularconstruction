"use server";

import { createServerClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as xlsx from "xlsx";
import mammoth from "mammoth";
import { exportImages } from 'pdf-export-images';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Universal Catalog Ingestor
 * Handles PDF (Vision) and Word/Excel (Text-Extraction)
 */
export async function processCatalogFile(storagePath: string, fileName: string, fileType: string) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return { success: false, error: "Authentication missing." };
    const sellerId = user.id;

    // 1. Download File
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from("temp-catalogs")
      .download(storagePath);

    if (downloadError) throw new Error(`Download failed: ${downloadError.message}`);

    const buffer = Buffer.from(await fileData.arrayBuffer());
    
    // 2. Prepare AI Parts
    let parts: any[] = [];
    const systemPrompt = `
      You are a Apex Modular Construction Catalog Ingestor. 
      Identify all products in the following data. 
      Extract: name, description, price (Numeric), specifications (JSON), category_slug, page_number, image_description.
      Return a JSON array of objects.
    `;
    parts.push({ text: systemPrompt });

    // 3. Conditional Extraction
    if (fileType === "application/pdf") {
      console.log("Processing PDF with Vision AI...");
      const base64File = buffer.toString('base64');
      parts.push({ inlineData: { data: base64File, mimeType: fileType } });
    } else {
      console.log("Processing Document/Spreadsheet as Text...");
      let text = "";
      if (fileType.includes("spreadsheet") || fileName.endsWith(".xlsx")) {
        const workbook = xlsx.read(buffer);
        text = xlsx.utils.sheet_to_txt(workbook.Sheets[workbook.SheetNames[0]]);
      } else if (fileType.includes("word") || fileName.endsWith(".docx")) {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } else {
        text = buffer.toString('utf-8');
      }
      parts[0].text += `\n\nFILE CONTENT:\n${text.substring(0, 40000)}`;
    }

    // 4. AI INVOCATION
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyB0McI-6PRtRd_V6S8ka3nYMTye9oLrZPE";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    const aiResponse = result.response.text();
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    const extractedProducts = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");

    // EXTRACT PDF IMAGES
    const extractedImagesByPage = new Map<number, string>();
    if (fileType === "application/pdf") {
      console.log("Extracting images from PDF using pdf-export-images...");
      try {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cargoplus-pdf-'));
        const tempPdfPath = path.join(tempDir, 'temp.pdf');
        fs.writeFileSync(tempPdfPath, buffer);
        const images = await exportImages(tempPdfPath, tempDir);
        
        for (const img of images) {
          // img.name format is typically "img_p0_1" where p0 is page index (0-based)
          const match = img.name.match(/_p(\d+)_/);
          if (match) {
            const pageIndex = parseInt(match[1], 10);
            const pageNumber = pageIndex + 1; // 1-based page number
            
            if (!extractedImagesByPage.has(pageNumber)) {
              const fileBuffer = fs.readFileSync(img.file);
              const imagePath = `extracted/${sellerId}/${Date.now()}_p${pageNumber}.png`;
              
              const { error: uploadError } = await supabase.storage.from("product-images").upload(imagePath, fileBuffer, { contentType: 'image/png' });
              
              if (!uploadError) {
                const { data: pubData } = supabase.storage.from("product-images").getPublicUrl(imagePath);
                extractedImagesByPage.set(pageNumber, pubData.publicUrl);
              }
            }
          }
        }
        
        // Clean up temp dir
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (err) {
        console.error("Failed to extract images from PDF", err);
      }
    }

    // 5. Save Drafts
    const { data: batch } = await supabase
      .from("ingestion_batches")
      .insert({ file_name: fileName, file_type: fileType, seller_id: sellerId, status: "processing" })
      .select().single();

    const drafts = extractedProducts.map((p: any) => {
      const pNum = p.page_number || 1;
      return {
        batch_id: batch.id,
        name: p.name,
        description: p.description,
        price: p.price,
        specifications: p.specifications,
        category_slug: p.category_slug,
        page_number: pNum,
        main_image_url: extractedImagesByPage.get(pNum) || null,
        ai_metadata: { image_description: p.image_description },
        original_data: p
      };
    });

    const { error: insertError } = await supabase.from("product_drafts").insert(drafts);
    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      return { success: false, error: "Database insertion failed: " + insertError.message };
    }
    await supabase.storage.from("temp-catalogs").remove([storagePath]);
    await supabase.from("ingestion_batches").update({ status: "completed", total_items: drafts.length }).eq("id", batch.id);

    return { success: true, batchId: batch.id, count: drafts.length };

  } catch (err: any) {
    console.error("Ingestion Error:", err.message);
    return { success: false, error: err.message };
  }
}
