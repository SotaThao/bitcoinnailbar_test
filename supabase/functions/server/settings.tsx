import { Hono } from 'npm:hono@4.6.14';
import { kv } from './helpers.tsx';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Initialize Hono app for settings routes
export const settingsApp = new Hono();

// Import initial services data (from original index.tsx)
const initialServices = {
  "Nail Services": {
    groups: [
      {
        title: "Manicure",
        items: [
          { name: "Classic Manicure", price: "25", duration: "30 min" },
          { name: "Gel Manicure", price: "35", duration: "45 min" },
          { name: "Deluxe Manicure", price: "45", duration: "60 min" }
        ]
      },
      {
        title: "Pedicure",
        items: [
          { name: "Classic Pedicure", price: "40", duration: "45 min" },
          { name: "Gel Pedicure", price: "50", duration: "60 min" },
          { name: "Deluxe Pedicure", price: "65", duration: "75 min" }
        ]
      }
    ]
  }
};

// ========================================
// SOCIAL MEDIA SETTINGS
// ========================================

// GET: Social Media Links
settingsApp.get("/make-server-84f9c112/settings/social-media", async (c) => {
  try {
    const socialMedia = await kv.get("settings:social-media");
    if (!socialMedia) {
      // Return default with only Facebook
      return c.json({
        success: true,
        data: {
          facebook: "https://www.facebook.com/bitcoinnailbar",
          instagram: "",
          tiktok: ""
        }
      });
    }
    return c.json({ success: true, data: socialMedia });
  } catch (error: any) {
    console.error('❌ [SOCIAL MEDIA GET] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT: Update Social Media Links
settingsApp.put("/make-server-84f9c112/settings/social-media", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("settings:social-media", {
      facebook: body.facebook || "",
      instagram: body.instagram || "",
      tiktok: body.tiktok || "",
      updatedAt: new Date().toISOString()
    });
    console.log('✅ [SOCIAL MEDIA UPDATE] Successfully updated');
    return c.json({ success: true, data: body });
  } catch (error: any) {
    console.error('❌ [SOCIAL MEDIA UPDATE] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========================================
// SERVICE MENU SETTINGS
// ========================================

// GET: Service Menu Data
settingsApp.get("/make-server-84f9c112/settings/service-menu", async (c) => {
  try {
    console.log('🔍 [SERVICE MENU GET] Fetching data from KV store...');
    const data = await kv.get("settings:service-menu");
    
    if (!data) {
      console.log('⚠️ [SERVICE MENU GET] No data found, initializing with defaults');
      await kv.set("settings:service-menu", initialServices);
      return c.json({ success: true, data: initialServices });
    }
    
    // Count services
    const categoryCounts: Record<string, number> = {};
    Object.keys(data).forEach(categoryKey => {
      const groups = data[categoryKey]?.groups || [];
      let totalServices = 0;
      groups.forEach((group: any) => {
        totalServices += group.items?.length || 0;
      });
      categoryCounts[categoryKey] = totalServices;
    });
    console.log('✅ [SERVICE MENU GET] Returning data, services per category:', categoryCounts);
    
    return c.json({ success: true, data });
  } catch (error: any) {
    console.error('❌ [SERVICE MENU GET] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT: Update Service Menu Data
settingsApp.put("/make-server-84f9c112/settings/service-menu", async (c) => {
  try {
    const body = await c.req.json();
    console.log('🔍 [SERVICE MENU PUT] Received data:', JSON.stringify(body, null, 2));
    console.log('📊 [SERVICE MENU PUT] Data size:', JSON.stringify(body).length, 'bytes');
    
    // Count services in each category
    const categoryCounts: Record<string, number> = {};
    Object.keys(body).forEach(categoryKey => {
      const groups = body[categoryKey]?.groups || [];
      let totalServices = 0;
      groups.forEach((group: any) => {
        totalServices += group.items?.length || 0;
      });
      categoryCounts[categoryKey] = totalServices;
    });
    console.log('📈 [SERVICE MENU PUT] Services per category:', categoryCounts);
    
    await kv.set("settings:service-menu", body);
    console.log('✅ [SERVICE MENU PUT] Successfully saved to KV store');
    
    // Verify by reading back
    const savedData = await kv.get("settings:service-menu");
    console.log('🔍 [SERVICE MENU PUT] Verification read - data exists:', !!savedData);
    
    return c.json({ success: true, data: body });
  } catch (error: any) {
    console.error('❌ [SERVICE MENU PUT] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST: Reset Service Menu Data
settingsApp.post("/make-server-84f9c112/settings/service-menu/reset", async (c) => {
  try {
    await kv.set("settings:service-menu", initialServices);
    console.log('✅ [SERVICE MENU RESET] Reset to default values');
    return c.json({ success: true, data: initialServices });
  } catch (error: any) {
    console.error('❌ [SERVICE MENU RESET] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========================================
// SERVICE CATEGORIES MANAGEMENT
// ========================================

// GET: All categories
settingsApp.get("/make-server-84f9c112/settings/categories", async (c) => {
  try {
    const categories = await kv.get("settings:categories");
    console.log(`📋 [GET CATEGORIES] Found ${categories?.length || 0} categories`);
    if (categories && categories.length > 0) {
      console.log(`📋 [GET CATEGORIES] IDs:`, categories.map((c: any) => `${c.id}:${c.name}`));
    }
    if (!categories) {
      console.log(`⚠️ [GET CATEGORIES] No categories found, returning empty array`);
      return c.json({ success: true, data: [] });
    }
    return c.json({ success: true, data: categories });
  } catch (error: any) {
    console.error("❌ [GET CATEGORIES] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT: Save/Update categories
settingsApp.put("/make-server-84f9c112/settings/categories", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("settings:categories", body);
    console.log(`✅ [UPDATE CATEGORIES] Updated ${body.length} categories`);
    return c.json({ success: true, data: body });
  } catch (error: any) {
    console.error("❌ [UPDATE CATEGORIES] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT: Reorder categories (drag & drop)
settingsApp.put("/make-server-84f9c112/settings/categories/reorder", async (c) => {
  try {
    const { categories } = await c.req.json();
    
    if (!Array.isArray(categories)) {
      return c.json({ success: false, error: "Invalid categories array" }, 400);
    }
    
    // Update displayOrder for each category based on array position
    const reorderedCategories = categories.map((cat, index) => ({
      ...cat,
      displayOrder: index,
    }));
    
    await kv.set("settings:categories", reorderedCategories);
    console.log(`✅ [REORDER CATEGORIES] Successfully reordered ${reorderedCategories.length} categories`);
    
    return c.json({ success: true, data: reorderedCategories });
  } catch (error: any) {
    console.error("❌ [REORDER CATEGORIES] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST: Add new category
settingsApp.post("/make-server-84f9c112/settings/categories", async (c) => {
  try {
    const newCategory = await c.req.json();
    const categories = await kv.get("settings:categories") || [];
    
    // Generate new ID
    const maxId = categories.length > 0 ? Math.max(...categories.map((c: any) => c.id)) : 0;
    newCategory.id = maxId + 1;
    
    // Ensure status field exists (default: active)
    if (!newCategory.status) {
      newCategory.status = 'active';
    }
    
    categories.push(newCategory);
    await kv.set("settings:categories", categories);
    
    console.log(`✅ [ADD CATEGORY] Added category ID ${newCategory.id}: ${newCategory.name}`);
    return c.json({ success: true, data: newCategory });
  } catch (error: any) {
    console.error("❌ [ADD CATEGORY] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE: Delete category (CASCADE DELETE: also deletes all services in this category)
settingsApp.delete("/make-server-84f9c112/settings/categories/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    console.log(`🗑️ [DELETE CATEGORY] Request to delete category ID: ${id}`);
    
    // 1. Get and filter categories
    const categories = await kv.get("settings:categories") || [];
    console.log(`📋 [DELETE CATEGORY] Total categories in DB: ${categories.length}`);
    
    const categoryToDelete = categories.find((cat: any) => cat.id === id);
    
    if (!categoryToDelete) {
      console.warn(`⚠️ [DELETE CATEGORY] Category with ID ${id} not found (may have been already deleted)`);
      console.log(`🔍 [DELETE CATEGORY] Available category IDs:`, categories.map((c: any) => c.id));
      // Return 200 with success=true since idempotent delete is acceptable
      return c.json({ 
        success: true, 
        message: `Category ${id} not found (may have been already deleted)`,
        alreadyDeleted: true 
      }, 200);
    }
    
    const categoryName = categoryToDelete.name;
    console.log(`📌 [DELETE CATEGORY] Found category: "${categoryName}" (ID: ${id})`);
    
    const filtered = categories.filter((cat: any) => cat.id !== id);
    await kv.set("settings:categories", filtered);
    console.log(`✅ [DELETE CATEGORY] Category removed from categories list`);
    
    // 2. CASCADE DELETE: Remove all services in this category from service-menu
    const serviceMenu = await kv.get("settings:service-menu") || {};
    
    // Remove the category key from service menu if exists
    if (serviceMenu[categoryName]) {
      const servicesCount = serviceMenu[categoryName]?.groups?.reduce((total: number, group: any) => {
        return total + (group.services?.length || 0);
      }, 0) || 0;
      
      delete serviceMenu[categoryName];
      await kv.set("settings:service-menu", serviceMenu);
      console.log(`✅ [DELETE CATEGORY] CASCADE: Removed "${categoryName}" from service menu (${servicesCount} services deleted)`);
    } else {
      console.log(`ℹ️ [DELETE CATEGORY] No services found in service menu for "${categoryName}"`);
    }
    
    return c.json({ 
      success: true, 
      message: `Category "${categoryName}" deleted successfully`,
      cascadeDeleted: true
    });
  } catch (error: any) {
    console.error("❌ [DELETE CATEGORY] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST: Delete categories in batch
settingsApp.post("/make-server-84f9c112/settings/categories/delete-batch", async (c) => {
  try {
    const { ids } = await c.req.json();
    
    if (!Array.isArray(ids)) {
      return c.json({ success: false, error: "Invalid ids array" }, 400);
    }
    
    console.log(`🗑️ [DELETE BATCH] Request to delete ${ids.length} categories: [${ids.join(', ')}]`);
    
    const categories = await kv.get("settings:categories") || [];
    const serviceMenu = await kv.get("settings:service-menu") || {};
    
    let deletedCount = 0;
    let cascadeDeletedServices = 0;
    
    // Filter out categories with matching IDs
    const remaining = categories.filter((cat: any) => {
      if (ids.includes(cat.id)) {
        deletedCount++;
        
        // CASCADE DELETE from service menu
        if (serviceMenu[cat.name]) {
          const servicesInCategory = serviceMenu[cat.name]?.groups?.reduce((total: number, group: any) => {
            return total + (group.services?.length || 0);
          }, 0) || 0;
          
          cascadeDeletedServices += servicesInCategory;
          delete serviceMenu[cat.name];
        }
        
        return false; // Remove this category
      }
      return true; // Keep this category
    });
    
    await kv.set("settings:categories", remaining);
    await kv.set("settings:service-menu", serviceMenu);
    
    console.log(`✅ [DELETE BATCH] Deleted ${deletedCount} categories, cascade deleted ${cascadeDeletedServices} services`);
    
    return c.json({ 
      success: true, 
      message: `Deleted ${deletedCount} categories`,
      deletedCount,
      cascadeDeletedServices
    });
  } catch (error: any) {
    console.error("❌ [DELETE BATCH] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========================================
// HOMEPAGE MENU MODE SETTING
// ========================================

// GET: Homepage menu mode setting
settingsApp.get("/make-server-84f9c112/settings/homepage-menu", async (c) => {
  try {
    const mode = await kv.get("settings:homepage-menu-mode") || "services-list";
    return c.json({ success: true, data: { mode } });
  } catch (error: any) {
    console.error("❌ [GET HOMEPAGE SETTING] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST: Update homepage menu mode
settingsApp.post("/make-server-84f9c112/admin/settings/homepage-menu", async (c) => {
  try {
    const { mode } = await c.req.json();
    
    if (!["services-list", "menu-images"].includes(mode)) {
      return c.json({ success: false, error: "Invalid mode" }, 400);
    }
    
    await kv.set("settings:homepage-menu-mode", mode);
    
    console.log(`✅ [HOMEPAGE SETTING] Mode set to: ${mode}`);
    return c.json({ success: true, data: { mode } });
  } catch (error: any) {
    console.error("❌ [HOMEPAGE SETTING] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========================================
// CHATBOT AVATAR SETTING
// ========================================

// GET: Fetch chatbot avatar
settingsApp.get("/make-server-84f9c112/settings/chatbot-avatar", async (c) => {
  try {
    const avatarPath = await kv.get("settings:chatbot-avatar-path") || '';
    
    if (!avatarPath) {
      console.log('ℹ️ [CHATBOT AVATAR] No avatar path found in KV store');
      return c.json({ success: true, data: { avatar: '' } });
    }

    // Use public URL instead of signed URL (avatar is public content)
    const BUCKET_NAME = 'make-84f9c112-promotions';
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(avatarPath);

    console.log(`✅ [CHATBOT AVATAR] Public URL generated for: ${avatarPath}`);
    return c.json({ success: true, data: { avatar: data.publicUrl } });
  } catch (error: any) {
    console.error("❌ [CHATBOT SETTING] Exception:", error);
    // Fallback to empty avatar on error
    return c.json({ success: true, data: { avatar: '' } });
  }
});

// POST: Update chatbot avatar (expects file path, not signed URL)
settingsApp.post("/make-server-84f9c112/admin/settings/chatbot-avatar", async (c) => {
  try {
    const { avatarPath } = await c.req.json();
    
    // Save file path to KV store
    await kv.set("settings:chatbot-avatar-path", avatarPath || '');
    
    console.log(`✅ [CHATBOT SETTING] Avatar path updated: ${avatarPath}`);
    return c.json({ success: true, data: { avatarPath } });
  } catch (error: any) {
    console.error("❌ [CHATBOT SETTING] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========================================
// PROMOTIONS SETTINGS
// ========================================

// 🤖 AUTO-TRANSLATION HELPER (using DeepSeek API)
async function translateText(text: string, sourceLang: 'vi' | 'en', targetLang: 'vi' | 'en'): Promise<string> {
  try {
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!DEEPSEEK_API_KEY) {
      console.warn('⚠️ [TRANSLATE] DEEPSEEK_API_KEY not found, returning original text');
      return text;
    }

    // Helper: Strip HTML tags but preserve structure markers
    const stripHtml = (html: string): { plain: string; hasHtml: boolean } => {
      const hasHtml = /<[^>]+>/.test(html);
      if (!hasHtml) {
        return { plain: html, hasHtml: false };
      }
      
      // Replace HTML tags with placeholders that preserve structure
      let plain = html;
      
      // Replace common tags with newlines/markers
      plain = plain.replace(/<\/p>/gi, '\n');
      plain = plain.replace(/<br\s*\/?>/gi, '\n');
      plain = plain.replace(/<li>/gi, '• ');
      plain = plain.replace(/<\/li>/gi, '\n');
      
      // Remove all remaining HTML tags
      plain = plain.replace(/<[^>]+>/g, '');
      
      // Decode HTML entities
      plain = plain.replace(/&nbsp;/g, ' ');
      plain = plain.replace(/&amp;/g, '&');
      plain = plain.replace(/&lt;/g, '<');
      plain = plain.replace(/&gt;/g, '>');
      plain = plain.replace(/&quot;/g, '"');
      
      // Clean up extra whitespace
      plain = plain.trim();
      
      return { plain, hasHtml: true };
    };
    
    // Helper: Reconstruct HTML from translated plain text
    const reconstructHtml = (originalHtml: string, translatedPlain: string): string => {
      // Simple approach: wrap in paragraph tags if original had HTML
      if (/<p>/.test(originalHtml)) {
        // Split by newlines and wrap each in <p> tags
        const lines = translatedPlain.split('\n').filter(line => line.trim());
        return lines.map(line => `<p>${line.trim()}</p>`).join('');
      }
      
      // If original had <strong> tags, try to preserve emphasis on numbers/key words
      if (/<strong>/.test(originalHtml)) {
        // Preserve strong tags around numbers, percentages, and dollar amounts
        let html = translatedPlain;
        html = html.replace(/(\d+%)/g, '<strong>$1</strong>');
        html = html.replace(/(\$\d+[\d,]*)/g, '<strong>$1</strong>');
        html = html.replace(/(<|>|&lt;|&gt;)\s*(\$?\d+)/g, '<strong>$1 $2</strong>');
        return `<p>${html}</p>`;
      }
      
      return `<p>${translatedPlain}</p>`;
    };

    // Strip HTML if present
    const { plain: plainText, hasHtml } = stripHtml(text);
    
    console.log(`🔍 [TRANSLATE] Input has HTML: ${hasHtml}`);
    if (hasHtml) {
      console.log(`🔍 [TRANSLATE] Plain text extracted: "${plainText.substring(0, 100)}..."`);
    }

    const langMap = { vi: 'Vietnamese', en: 'English' };
    const sourceLangName = langMap[sourceLang];
    const targetLangName = langMap[targetLang];

    // Add AbortController with 15-second timeout per translation call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate from ${sourceLangName} to ${targetLangName}. Return ONLY the translation, no explanations. Keep the same tone and style. For marketing text, keep it concise and impactful. Preserve line breaks.`
          },
          {
            role: 'user',
            content: plainText // Translate plain text without HTML
          }
        ],
        temperature: 0.3,
        max_tokens: 800 // Increase for longer descriptions
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [TRANSLATE] DeepSeek API error (${response.status}):`, errorText);
      return text; // Fallback to original
    }

    const result = await response.json();
    const translated = result.choices?.[0]?.message?.content?.trim();

    if (!translated) {
      console.warn('⚠️ [TRANSLATE] Empty response from DeepSeek');
      return text;
    }

    // Reconstruct HTML if original had HTML tags
    const finalText = hasHtml ? reconstructHtml(text, translated) : translated;

    console.log(`✅ [TRANSLATE] "${plainText.substring(0, 50)}..." → "${translated.substring(0, 50)}..."`);
    if (hasHtml) {
      console.log(`🔧 [TRANSLATE] HTML reconstructed: "${finalText.substring(0, 100)}..."`);
    }
    
    return finalText;

  } catch (error: any) {
    console.error('❌ [TRANSLATE] Exception:', error.message);
    return text; // Fallback to original on error
  }
}

// POST: Save promotions to KV store (with auto-translation)
settingsApp.post("/make-server-84f9c112/admin/settings/promotions", async (c) => {
  try {
    const { promotions } = await c.req.json();
    
    if (!Array.isArray(promotions)) {
      return c.json({ success: false, error: "Invalid promotions data" }, 400);
    }
    
    console.log(`🔄 [PROMOTIONS SAVE] Processing ${promotions.length} promotions with auto-translation...`);
    
    // Helper function to detect if text is Vietnamese
    const isVietnamese = (text: string): boolean => {
      // Check for Vietnamese characters
      const vietnameseChars = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;
      return vietnameseChars.test(text);
    };
    
    // 🤖 Auto-translate promotions based on input language
    const translatedPromotions = await Promise.all(
      promotions.map(async (promo: any) => {
        const input = promo.input;
        
        // Detect language from title (most reliable field)
        const isVi = isVietnamese(input.title || input.description || "");
        
        console.log(`🌐 [LANGUAGE DETECT] Promotion "${promo.id}": ${isVi ? "Vietnamese" : "English"}`);
        
        try {
          if (isVi) {
            // Input is Vietnamese → Generate English translation
            console.log(`🤖 [TRANSLATE] VI→EN for promotion "${promo.id}"`);
            
            const enData: any = {};
            const fieldsToTranslate = ['badge', 'title', 'subtitle', 'discount', 'description', 'days', 'buttonText'];
            
            // Translate all fields in parallel for speed
            const translationResults = await Promise.all(
              fieldsToTranslate.map(async (field) => {
                if (input[field]) {
                  const translated = await translateText(input[field], 'vi', 'en');
                  return { field, value: translated };
                }
                return { field, value: undefined };
              })
            );
            
            for (const { field, value } of translationResults) {
              if (value !== undefined) {
                enData[field] = value;
              }
            }
            
            // Preserve non-translatable fields
            enData.buttonLink = input.buttonLink;
            enData.time = input.time;
            enData.backgroundImage = input.backgroundImage;
            enData.backgroundImagePath = input.backgroundImagePath;
            enData.iconImage = input.iconImage;
            enData.iconImagePath = input.iconImagePath;
            enData.videoUrl = input.videoUrl;
            
            console.log(`✅ [TRANSLATE] Promotion "${promo.id}" VI→EN completed`);
            
            return {
              ...promo,
              vi: { ...input }, // VI = input data
              en: enData,       // EN = translated
            };
          } else {
            // Input is English → Generate Vietnamese translation
            console.log(`🤖 [TRANSLATE] EN→VI for promotion "${promo.id}"`);
            
            const viData: any = {};
            const fieldsToTranslate = ['badge', 'title', 'subtitle', 'discount', 'description', 'days', 'buttonText'];
            
            // Translate all fields in parallel for speed
            const translationResults = await Promise.all(
              fieldsToTranslate.map(async (field) => {
                if (input[field]) {
                  const translated = await translateText(input[field], 'en', 'vi');
                  return { field, value: translated };
                }
                return { field, value: undefined };
              })
            );
            
            for (const { field, value } of translationResults) {
              if (value !== undefined) {
                viData[field] = value;
              }
            }
            
            // Preserve non-translatable fields
            viData.buttonLink = input.buttonLink;
            viData.time = input.time;
            viData.backgroundImage = input.backgroundImage;
            viData.backgroundImagePath = input.backgroundImagePath;
            viData.iconImage = input.iconImage;
            viData.iconImagePath = input.iconImagePath;
            viData.videoUrl = input.videoUrl;
            
            console.log(`✅ [TRANSLATE] Promotion "${promo.id}" EN→VI completed`);
            
            return {
              ...promo,
              vi: viData,       // VI = translated
              en: { ...input }, // EN = input data
            };
          }
        } catch (translateError: any) {
          console.error(`❌ [TRANSLATE] Failed for promotion "${promo.id}":`, translateError);
          
          // Fallback: use input for both languages
          return {
            ...promo,
            vi: { ...input },
            en: { ...input },
          };
        }
      })
    );
    
    await kv.set("settings:promotions", translatedPromotions);
    
    console.log(`✅ [PROMOTIONS SETTING] ${translatedPromotions.length} promotions saved with auto-translation`);
    return c.json({ success: true, data: { promotions: translatedPromotions } });
  } catch (error: any) {
    console.error("❌ [PROMOTIONS SETTING] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET: Fetch promotions from KV store
settingsApp.get("/make-server-84f9c112/settings/promotions", async (c) => {
  try {
    const promotions = await kv.get("settings:promotions") || [];
    
    // Generate fresh signed URLs for images
    const promotionsWithSignedUrls = await Promise.all(
      (promotions as any[]).map(async (promo: any) => {
        const updatedPromo = { ...promo };
        
        // 🔄 MIGRATION: Add default buttonText if missing
        if (updatedPromo.input && !updatedPromo.input.buttonText) {
          console.log(`⚠️ [MIGRATION] Adding default buttonText to promotion ${promo.id}`);
          updatedPromo.input.buttonText = "Tìm hiểu thêm";
        }
        
        // Also migrate vi & en translations
        if (updatedPromo.vi && !updatedPromo.vi.buttonText) {
          updatedPromo.vi.buttonText = "Tìm hiểu thêm";
        }
        if (updatedPromo.en && !updatedPromo.en.buttonText) {
          updatedPromo.en.buttonText = "Learn More";
        }
        
        // 🔄 FIX: Detect Vietnamese text in English translation and fix it
        if (updatedPromo.en && updatedPromo.en.buttonText) {
          const vietnameseChars = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;
          if (vietnameseChars.test(updatedPromo.en.buttonText)) {
            console.log(`⚠️ [MIGRATION] Fixing Vietnamese buttonText in EN translation for promotion ${promo.id}`);
            updatedPromo.en.buttonText = "Register Now";
          }
        }
        
        // Process input field for frontend editing
        if (updatedPromo.input) {
          // Background Image
          if (updatedPromo.input.backgroundImagePath) {
            try {
              const { data: signedData } = await supabase.storage
                .from('make-84f9c112-promotions')
                .createSignedUrl(updatedPromo.input.backgroundImagePath, 86400);
              
              if (signedData?.signedUrl) {
                updatedPromo.input.backgroundImage = signedData.signedUrl;
              }
            } catch (err) {
              console.error(`❌ Error signing input background image:`, err);
            }
          }
          
          // Icon Image
          if (updatedPromo.input.iconImagePath) {
            try {
              const { data: signedData } = await supabase.storage
                .from('make-84f9c112-promotions')
                .createSignedUrl(updatedPromo.input.iconImagePath, 86400);
              
              if (signedData?.signedUrl) {
                updatedPromo.input.iconImage = signedData.signedUrl;
              }
            } catch (err) {
              console.error(`❌ Error signing input icon image:`, err);
            }
          }
        }
        
        // Process vi & en translations (for display)
        for (const lang of ['vi', 'en']) {
          if (!updatedPromo[lang]) continue;
          
          // Background Image
          if (updatedPromo[lang].backgroundImagePath) {
            try {
              const { data: signedData } = await supabase.storage
                .from('make-84f9c112-promotions')
                .createSignedUrl(updatedPromo[lang].backgroundImagePath, 86400);
              
              if (signedData?.signedUrl) {
                updatedPromo[lang].backgroundImage = signedData.signedUrl;
              }
            } catch (err) {
              console.error(`❌ Error signing ${lang} background image:`, err);
            }
          }
          
          // Icon Image
          if (updatedPromo[lang].iconImagePath) {
            try {
              const { data: signedData } = await supabase.storage
                .from('make-84f9c112-promotions')
                .createSignedUrl(updatedPromo[lang].iconImagePath, 86400);
              
              if (signedData?.signedUrl) {
                updatedPromo[lang].iconImage = signedData.signedUrl;
              }
            } catch (err) {
              console.error(`❌ Error signing ${lang} icon image:`, err);
            }
          }
        }
        
        return updatedPromo;
      })
    );
    
    console.log(`✅ [PROMOTIONS GET] Fetched ${promotionsWithSignedUrls.length} promotions with fresh signed URLs`);
    return c.json({ success: true, data: { promotions: promotionsWithSignedUrls } });
  } catch (error: any) {
    console.error("❌ [PROMOTIONS GET] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 🔍 DEBUG: Get raw promotions data from KV store (without signed URLs)
settingsApp.get("/make-server-84f9c112/debug/promotions-raw", async (c) => {
  try {
    const promotions = await kv.get("settings:promotions") || [];
    
    console.log(`🔍 [DEBUG] Raw promotions from KV store:`, JSON.stringify(promotions, null, 2));
    
    return c.json({ 
      success: true, 
      data: { 
        promotions,
        count: Array.isArray(promotions) ? promotions.length : 0,
        kvKey: "settings:promotions"
      } 
    });
  } catch (error: any) {
    console.error("❌ [DEBUG] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

console.log('✅ Settings module initialized with 17 routes');