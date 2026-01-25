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

// POST: Save promotions to KV store
settingsApp.post("/make-server-84f9c112/admin/settings/promotions", async (c) => {
  try {
    const { promotions } = await c.req.json();
    
    if (!Array.isArray(promotions)) {
      return c.json({ success: false, error: "Invalid promotions data" }, 400);
    }
    
    await kv.set("settings:promotions", promotions);
    
    console.log(`✅ [PROMOTIONS SETTING] ${promotions.length} promotions saved`);
    return c.json({ success: true, data: { promotions } });
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
        
        // Process both languages
        for (const lang of ['vi', 'en']) {
          if (!updatedPromo[lang]) continue;
          
          // Background Image
          if (updatedPromo[lang].backgroundImagePath) {
            try {
              const { data: signedData, error: signError } = await supabase.storage
                .from('make-84f9c112-promotions')
                .createSignedUrl(updatedPromo[lang].backgroundImagePath, 86400); // 24 hours
              
              if (signError) {
                console.warn(`⚠️ Failed to sign background image for ${promo.id} (${lang}):`, signError);
              } else if (signedData?.signedUrl) {
                updatedPromo[lang].backgroundImage = signedData.signedUrl;
              }
            } catch (err) {
              console.error(`❌ Error signing background image for ${promo.id} (${lang}):`, err);
            }
          }
          
          // Icon Image
          if (updatedPromo[lang].iconImagePath) {
            try {
              const { data: signedData, error: signError } = await supabase.storage
                .from('make-84f9c112-promotions')
                .createSignedUrl(updatedPromo[lang].iconImagePath, 86400); // 24 hours
              
              if (signError) {
                console.warn(`⚠️ Failed to sign icon image for ${promo.id} (${lang}):`, signError);
              } else if (signedData?.signedUrl) {
                updatedPromo[lang].iconImage = signedData.signedUrl;
              }
            } catch (err) {
              console.error(`❌ Error signing icon image for ${promo.id} (${lang}):`, err);
            }
          }
        }
        
        return updatedPromo;
      })
    );
    
    console.log(`✅ [PROMOTIONS SETTING] Fetched ${promotionsWithSignedUrls.length} promotions with fresh signed URLs`);
    return c.json({ success: true, data: { promotions: promotionsWithSignedUrls } });
  } catch (error: any) {
    console.error("❌ [PROMOTIONS SETTING] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

console.log('✅ Settings module initialized with 16 routes');