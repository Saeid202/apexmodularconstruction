import { createServerClient } from "@/lib/supabase/server";

/**
 * Test script to check if colors are being saved and loaded correctly
 * Run with: npx tsx scripts/test-color-customization.ts <product-id>
 */

async function testColorCustomization() {
  const productId = process.argv[2];
  
  if (!productId) {
    console.error("❌ Please provide a product ID");
    console.log("Usage: npx tsx scripts/test-color-customization.ts <product-id>");
    process.exit(1);
  }

  console.log(`\n🔍 Testing color customization for product: ${productId}\n`);

  try {
    const supabase = await createServerClient();
    if (!supabase) {
      console.error("❌ Supabase not configured");
      process.exit(1);
    }

    // Get all customization groups for this product
    const { data: groups, error: groupsError } = await supabase
      .from("product_customization_groups")
      .select(`
        id,
        name,
        description,
        display_order,
        options:product_customization_options(
          id,
          name,
          description,
          price_modifier,
          image_url,
          display_order
        )
      `)
      .eq("product_id", productId)
      .order("display_order");

    if (groupsError) {
      console.error("❌ Error fetching groups:", groupsError);
      process.exit(1);
    }

    if (!groups || groups.length === 0) {
      console.warn("⚠️  No customization groups found for this product");
      process.exit(0);
    }

    console.log(`✅ Found ${groups.length} customization group(s)\n`);

    groups.forEach((group, groupIdx) => {
      const isColorGroup = group.name.toLowerCase().includes("color");
      const groupType = isColorGroup ? "🎨 COLOR GROUP" : "📦 REGULAR GROUP";
      
      console.log(`${groupType} #${groupIdx + 1}: "${group.name}"`);
      console.log(`   ID: ${group.id}`);
      console.log(`   Display Order: ${group.display_order}`);
      
      const options = group.options as any[];
      if (!options || options.length === 0) {
        console.log("   ⚠️  No options found");
        return;
      }

      console.log(`   📋 ${options.length} option(s):\n`);

      if (isColorGroup) {
        // Group options by base name for color groups
        const groupedByName: Record<string, any[]> = {};
        options.forEach(opt => {
          const baseNameMatch = opt.name.match(/^(.+?)\s*\(#[0-9A-Fa-f]{6}\)$/);
          const baseName = baseNameMatch ? baseNameMatch[1].trim() : opt.name;
          if (!groupedByName[baseName]) {
            groupedByName[baseName] = [];
          }
          groupedByName[baseName].push(opt);
        });

        Object.entries(groupedByName).forEach(([baseName, opts]) => {
          console.log(`      🎯 Base Name: "${baseName}"`);
          console.log(`         Colors (${opts.length}):`);
          opts.forEach(opt => {
            const colorHex = opt.description?.startsWith("#") ? opt.description : "N/A";
            console.log(`           - ${colorHex} (ID: ${opt.id}, Price: $${opt.price_modifier})`);
          });
          console.log("");
        });
      } else {
        options.forEach((opt, optIdx) => {
          console.log(`      Option ${optIdx + 1}: "${opt.name}"`);
          console.log(`        ID: ${opt.id}`);
          console.log(`        Price Modifier: $${opt.price_modifier}`);
          if (opt.description) console.log(`        Description: ${opt.description}`);
          if (opt.image_url) console.log(`        Image: ${opt.image_url.substring(0, 50)}...`);
          console.log("");
        });
      }
    });

    console.log("✅ Color customization test completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testColorCustomization();
