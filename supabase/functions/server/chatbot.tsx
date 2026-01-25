import { Hono } from 'npm:hono@4.6.14';
import { kvAdmin as kv } from './_shared_kv.tsx';
import { createAppointment } from './appointments.tsx';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WAVE 7 - Chatbot Module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Extracted from index.tsx (lines 1826-2312, ~486 lines)
// POST /make-server-84f9c112/chat - DeepSeek AI Chatbot with Function Calling
// Dependencies: createAppointment from appointments.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const app = new Hono();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /make-server-84f9c112/chat - AI Chatbot with Booking
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post("/make-server-84f9c112/chat", async (c) => {
  try {
    const { messages, language } = await c.req.json();
    const apiKey = Deno.env.get("DEEPSEEK_API_KEY");

    if (!apiKey) {
      return c.json({ success: true, message: "Chatbot unavailable (Missing API Key)" });
    }

    // ========== UPDATED: Read from Admin Services (settings:service-menu) ==========
    // Fetch service menu data (nested structure with categories/groups)
    const serviceMenuData = await kv.get("settings:service-menu");
    
    if (!serviceMenuData) {
      console.warn("⚠️ [CHAT] No service menu data found");
      return c.json({ 
        success: true, 
        message: language === 'vi' 
          ? "Xin lỗi, hệ thống đang cập nhật dịch vụ. Vui lòng thử lại sau."
          : "Sorry, service data is being updated. Please try again later."
      });
    }

    // Fetch category metadata for display names
    const categoriesData = await kv.get("settings:categories") || [];
    const categoryMapping: Record<string, { name: string; displayOrder: number; status: string }> = {};
    categoriesData.forEach((cat: any) => {
      categoryMapping[cat.key] = { 
        name: cat.name, 
        displayOrder: cat.displayOrder || 999,
        status: cat.status || 'active'
      };
    });

    // Helper function to flatten nested service menu data
    const flattenServices = (data: any): any[] => {
      const flattened: any[] = [];
      
      Object.keys(data).forEach((categoryKey) => {
        // ⚠️ FILTER: Skip inactive categories
        const categoryInfo = categoryMapping[categoryKey];
        if (!categoryInfo || categoryInfo.status !== 'active') {
          console.log(`🚫 [CHAT] Skipping inactive category: ${categoryKey}`);
          return; // Skip this category entirely
        }
        
        const categoryData = data[categoryKey];
        const categoryName = categoryInfo.name || categoryKey;
        
        if (categoryData.groups) {
          categoryData.groups.forEach((group: any, groupIndex: number) => {
            if (group.items) {
              group.items.forEach((item: any, itemIndex: number) => {
                // Parse price (handle string/number/range formats)
                const parsePrice = (val: any): number => {
                  if (typeof val === 'number') return val;
                  if (!val) return 0;
                  const str = String(val).trim();
                  if (str.includes('-')) {
                    const parts = str.split('-');
                    const prices = parts.map((p: string) => parseFloat(p.trim())).filter((p: number) => !isNaN(p));
                    return prices.length > 0 ? Math.max(...prices) : 0;
                  }
                  if (str.includes('+')) {
                    return parseFloat(str.replace('+', '')) || 0;
                  }
                  return parseFloat(str) || 0;
                };

                const regularPrice = parsePrice(item.regular);
                const memberPrice = parsePrice(item.member);

                flattened.push({
                  id: `${categoryKey}-${groupIndex}-${itemIndex}`,
                  name: item.name,
                  category: categoryName,
                  categoryKey: categoryKey,
                  groupName: group.name,
                  regular_price: regularPrice,
                  member_price: memberPrice,
                  price: regularPrice,
                  description: item.description || '',
                  status: item.status || 'active',
                  serviceType: item.serviceType || 'regular',
                  compatibleServiceIds: item.compatibleServiceIds || [],
                  owner_recommended: item.owner_recommended === true,
                  displayOrder: categoryMapping[categoryKey]?.displayOrder || 999
                });
              });
            }
          });
        }
      });

      return flattened.filter((s: any) => s.status === 'active');
    };

    const allServices = flattenServices(serviceMenuData);

    // 🔍 DEBUG: Log actual service names to verify data source
    console.log("📊 [CHAT DEBUG] Total services loaded:", allServices.length);
    console.log("📋 [CHAT DEBUG] First 10 service names:", allServices.slice(0, 10).map((s: any) => s.name));
    console.log("🔥 [CHAT DEBUG] Service menu keys:", Object.keys(serviceMenuData));

    // Calculate booking count per service
    const allAppointments = await kv.getByPrefix("appointment:");
    const serviceBookingCount: Record<string, number> = {};
    
    allAppointments.forEach((appt: any) => {
      if (Array.isArray(appt.serviceIds)) {
        appt.serviceIds.forEach((serviceId: string) => {
          serviceBookingCount[serviceId] = (serviceBookingCount[serviceId] || 0) + 1;
        });
      }
    });

    // Enrich services with booking stats
    const servicesWithStats = allServices.map((s: any) => ({
      ...s,
      bookingCount: serviceBookingCount[s.id] || 0
    })).sort((a: any, b: any) => b.bookingCount - a.bookingCount);

    // Get owner recommended services (dynamically from database, no hardcoded names)
    const ownerRecommended = servicesWithStats.filter((s: any) => s.owner_recommended === true);
    
    // Sort Owner Recommended by booking count (most popular first)
    // This way the most recommended services naturally appear first
    ownerRecommended.sort((a: any, b: any) => b.bookingCount - a.bookingCount);
    
    // ⚠️ STRICT VALIDATION: Only show hot services if we have REAL booking data
    const totalBookings = allAppointments.length;
    const hotServices = totalBookings > 0 
      ? servicesWithStats.filter((s: any) => s.bookingCount > 0).slice(0, 5)
      : [];
    
    console.log("🔥 [CHAT DEBUG] Total bookings:", totalBookings);
    console.log("🔥 [CHAT DEBUG] Hot services count:", hotServices.length);

    // ========== FETCH MEMBERSHIP DATA ==========
    const membershipTiers = await kv.get('membership:tiers') || [];
    let membershipContext = '';
    
    if (Array.isArray(membershipTiers) && membershipTiers.length > 0) {
      membershipContext += '\n\n💎 MEMBERSHIP PROGRAM:\n';
      membershipContext += 'We offer a premium membership program with exclusive benefits and savings.\n\n';
      
      membershipTiers.forEach((tier: any) => {
        membershipContext += `📋 ${tier.name.toUpperCase()} TIER:\n`;
        membershipContext += `  💰 Price: $${tier.price} (${tier.duration})\n`;
        membershipContext += `  🎁 Benefits:\n`;
        
        if (tier.benefits && Array.isArray(tier.benefits)) {
          tier.benefits.forEach((benefit: string) => {
            membershipContext += `    ✓ ${benefit}\n`;
          });
        }
        
        if (tier.discount > 0) {
          membershipContext += `  💵 Discount: ${tier.discount}% OFF all services\n`;
        }
        
        if (tier.description) {
          membershipContext += `  ℹ️  ${tier.description}\n`;
        }
        
        membershipContext += '\n';
      });
      
      membershipContext += '🌟 WHEN TO RECOMMEND MEMBERSHIP:\n';
      membershipContext += '  - Customer asks about pricing for multiple services\n';
      membershipContext += '  - Customer is a frequent visitor or books regularly\n';
      membershipContext += '  - Customer shows interest in multiple treatments\n';
      membershipContext += '  - When member price shows significant savings (highlight the difference)\n';
      membershipContext += '  - ALWAYS mention membership benefits when discussing service prices\n';
    }
    
    // ========== FETCH PROMOTIONS DATA ==========
    const promotionsData = await kv.get('settings:promotions') || [];
    let promotionContext = '';
    
    if (Array.isArray(promotionsData) && promotionsData.length > 0) {
      promotionContext += '\n\n🎉 CURRENT PROMOTIONS & SPECIAL OFFERS:\n';
      
      promotionsData.forEach((promo: any, index: number) => {
        const promoLang = promo[language] || promo['en'];
        if (promoLang) {
          promotionContext += `\n${index + 1}. ${promoLang.title}\n`;
          if (promoLang.description) {
            promotionContext += `   📝 ${promoLang.description}\n`;
          }
          if (promoLang.buttonText) {
            promotionContext += `   🔗 Action: ${promoLang.buttonText}\n`;
          }
        }
      });
      
      promotionContext += '\n🎯 PROMOTION STRATEGY:\n';
      promotionContext += '  - Mention relevant promotions when customer inquires about specific services\n';
      promotionContext += '  - Use promotions to create urgency and encourage booking\n';
      promotionContext += '  - Always check if a promotion applies to customer\'s requested services\n';
      promotionContext += '  - Be enthusiastic but not pushy about promotions\n';
    }

    // ========== Build AI Context with Enhanced Structure ==========
    let serviceContext = "\n\n📋 AVAILABLE SERVICES:\n";
    serviceContext += `(Total Active Services: ${allServices.length})\n`;
    
    // 1. Owner Recommended (Best Value)
    if (ownerRecommended.length > 0) {
      serviceContext += "\n⭐ DỊCH VỤ ĐƯỢC ĐỀ XUẤT (Ưu tiên #1):\n";
      ownerRecommended.forEach((s: any) => {
        serviceContext += `- ${s.name} (${s.category} > ${s.groupName})\n`;
        // Only show member price if it exists and is different from regular price
        if (s.member_price && s.member_price !== s.regular_price) {
          const savings = s.regular_price - s.member_price;
          serviceContext += `  💰 Giá: $${s.regular_price} (Thường) / $${s.member_price} (Thành viên) [Tiết kiệm $${savings}]\n`;
        } else {
          serviceContext += `  💰 Giá: $${s.regular_price}\n`;
        }
        if (s.description) serviceContext += `  ℹ️  ${s.description}\n`;
      });
    }
    
    // 2. Hot Services (Most Popular) - ONLY IF WE HAVE REAL BOOKING DATA
    if (hotServices.length > 0) {
      serviceContext += "\n🔥 HOT SERVICES (Customer Favorites - Based on Real Booking Data):\n";
      hotServices.forEach((s: any) => {
        serviceContext += `- ${s.name}: $${s.regular_price} (${s.bookingCount} bookings)\n`;
        serviceContext += `  📍 ${s.category} > ${s.groupName}\n`;
      });
    } else {
      // Explicitly tell AI that hot services are NOT available yet
      serviceContext += "\n⚠️ HOT SERVICES: Not available yet (no booking data). Do NOT mention 'hot services' or 'most popular'.\n";
    }
    
    // 3. Services by Category
    serviceContext += "\n📂 ALL SERVICES BY CATEGORY:\n";
    
    const servicesByCategory: Record<string, any[]> = {};
    servicesWithStats.forEach((s: any) => {
      if (!servicesByCategory[s.category]) {
        servicesByCategory[s.category] = [];
      }
      servicesByCategory[s.category].push(s);
    });

    const sortedCategories = Object.keys(servicesByCategory).sort((a, b) => {
      const orderA = servicesWithStats.find((s: any) => s.category === a)?.displayOrder || 999;
      const orderB = servicesWithStats.find((s: any) => s.category === b)?.displayOrder || 999;
      return orderA - orderB;
    });

    sortedCategories.forEach((categoryName) => {
      const categoryServices = servicesByCategory[categoryName];
      serviceContext += `\n${categoryName}:\n`;
      
      const byGroup: Record<string, any[]> = {};
      categoryServices.forEach((s: any) => {
        if (!byGroup[s.groupName]) {
          byGroup[s.groupName] = [];
        }
        byGroup[s.groupName].push(s);
      });

      Object.keys(byGroup).forEach((groupName) => {
        serviceContext += `  ${groupName}:\n`;
        byGroup[groupName].forEach((s: any) => {
          // Only show member price if it exists and is different from regular price
          const priceInfo = (s.member_price && s.member_price !== s.regular_price)
            ? `$${s.regular_price} (Thường) / $${s.member_price} (Thành viên)`
            : `$${s.regular_price}`;
          const typeLabel = s.serviceType === 'addon' ? ' [ADD-ON]' : '';
          serviceContext += `    - ${s.name}: ${priceInfo}${typeLabel}\n`;
        });
      });
    });

    // 4. Add-ons Info
    const addons = servicesWithStats.filter((s: any) => s.serviceType === 'addon');
    if (addons.length > 0) {
      serviceContext += "\n➕ AVAILABLE ADD-ONS:\n";
      serviceContext += "Note: Add-ons enhance main services.\n";
      addons.forEach((s: any) => {
        serviceContext += `- ${s.name}: $${s.regular_price}\n`;
      });
    }

    // 🛡️ WHITELIST: Create exact list of valid service names for AI to cross-check
    const validServiceNames = allServices.map((s: any) => s.name);
    serviceContext += `\n\n🔒 VALID SERVICE NAMES (${validServiceNames.length} total):\n`;
    serviceContext += validServiceNames.join(', ') + '\n';
    serviceContext += '\n⚠️ IMPORTANT: If customer asks about a service NOT in this list, politely say it\'s not available.\n';
    
    const systemPrompt = `You are the AI receptionist for "Bitcoin Nail Bar" - an intelligent, helpful, and knowledgeable assistant.
    
    CURRENT DATE/TIME: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} (Central Time - Houston, TX)
    
    📍 BUSINESS INFORMATION:
    - Address: 9793 Westheimer Rd, Houston, TX 77042
    - Store Phone: (346) 802-4906
    - Sales Phone: (832) 799-3990
    - Email: customerbitcoinnailbar@gmail.com
    - Payment Methods: Cash, Credit Card, Bitcoin, VLINKPAY (crypto payment)
    - Special Feature: We are the first nail salon in Houston accepting Bitcoin payments
    
    ${serviceContext}
    ${membershipContext}
    ${promotionContext}
    
    🚨 CRITICAL ACCURACY RULES (MUST FOLLOW):
    1. ✅ ONLY mention services listed above in "AVAILABLE SERVICES"
    2. ✅ ONLY quote prices exactly as shown (do NOT estimate or guess)
    3. ✅ ONLY mention promotions listed in "CURRENT PROMOTIONS" section
    4. ✅ ONLY mention membership tiers shown in "MEMBERSHIP PROGRAM" section
    5. ✅ If a service is NOT listed above, say "I don't have that service in our menu"
    6. ✅ If you're unsure about ANY information, ask customer to check with staff
    7. ❌ NEVER invent service names, prices, promotions, or membership details
    8. ❌ NEVER mention "Hot Services" unless explicitly shown above with booking data
    9. ❌ NEVER make assumptions about services not in the list
    
    🎯 ADVANCED CAPABILITIES & INTELLIGENCE:
    
    1. 💬 CONVERSATIONAL INTELLIGENCE:
       - Understand context from previous messages in the conversation
       - Remember customer preferences mentioned earlier in the chat
       - Ask clarifying questions when customer intent is unclear
       - Provide personalized recommendations based on customer needs
    
    2. 🎨 SERVICE RECOMMENDATIONS (Smart Upselling):
       - ⭐ FIRST: Recommend "Dịch vụ được đề xuất" (Owner Recommended) - HIGHEST PRIORITY
       - 💰 SECOND: Highlight membership savings when applicable (show exact $ amount saved)
       - 🔥 THIRD: Suggest hot services (if shown with booking data)
       - 📂 FOURTH: Category-based recommendations matching customer needs
       - ➕ ALWAYS: Suggest relevant add-ons to enhance the main service
       
    3. 💎 MEMBERSHIP UPSELLING STRATEGY:
       - When customer asks about pricing: Compare regular vs member prices
       - When booking multiple services: Calculate total savings with membership
       - When customer is repeat visitor: Mention long-term value of membership
       - EXAMPLE: "As a member, you'd save $15 on this service alone! Over 6 months, that's $90+ in savings."
       
    4. 🎉 PROMOTION AWARENESS:
       - Match promotions to customer's requested services
       - Create urgency: "We have a special offer this month!"
       - Be enthusiastic but natural: "Great timing! This service is currently on promotion."
       - If multiple promotions apply, mention the best value one first
       
    5. 📅 APPOINTMENT BOOKING INTELLIGENCE:
       - Ask for: Name, Phone Number, Service(s), Date/Time
       - Optional but recommended: Email address
       - FIRST: Show clear summary of booking details
       - SECOND: Ask confirmation: "Should I confirm this booking for you?"
       - THIRD: ONLY after explicit confirmation ("yes", "confirm", "ok", "đúng rồi"), use 'create_booking' tool
       - Convert natural language time to ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
       - Handle multiple services in one booking
       - YOU CANNOT create bookings by text alone - MUST use 'create_booking' tool
       
    6. 🧠 CONTEXT AWARENESS:
       - Track conversation history to avoid repeating information
       - Remember if customer already knows about membership/promotions
       - Adapt tone based on customer's communication style (formal/casual)
       - Handle multi-turn conversations naturally
       
    7. 💡 PROACTIVE ASSISTANCE:
       - Suggest booking during less busy hours if customer is flexible
       - Recommend service packages that complement each other
       - Inform about preparation needed for certain services
       - Mention parking, payment options, or other practical details when relevant
    
    🎭 COMMUNICATION STYLE:
    - LANGUAGE: ${language === 'vi' ? 'Vietnamese (Quý khách - polite, respectful form)' : 'English (Professional yet warm)'}
    - TONE: Professional, luxury salon experience, friendly and welcoming
    - PERSONALITY: Knowledgeable expert who genuinely cares about customer satisfaction
    - EMPATHY: Show understanding of customer needs and concerns
    - ENTHUSIASM: Be genuinely excited about services and promotions (but not pushy)
    
    🎯 GOAL: Make every customer feel valued, informed, and excited to visit Bitcoin Nail Bar.
    `;

    const tools = [
      {
        type: "function",
        function: {
          name: "create_booking",
          description: "Book an appointment when user provides all details",
          parameters: {
            type: "object",
            properties: {
              customerName: { type: "string" },
              customerPhone: { type: "string" },
              customerEmail: { type: "string" },
              serviceNames: { type: "string", description: "Comma separated service names" },
              appointmentTime: { type: "string", description: "ISO 8601 date string (YYYY-MM-DDTHH:mm:ss)" },
              notes: { type: "string" }
            },
            required: ["customerName", "customerPhone", "serviceNames", "appointmentTime"]
          }
        }
      }
    ];

    // 1. Call DeepSeek with Tools
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        tools: tools,
        temperature: 0 // Deterministic output - no creativity, no hallucination
      })
    });

    const data = await response.json();
    if (!data.choices) throw new Error(JSON.stringify(data));
    
    const choice = data.choices[0];
    const message = choice.message;

    // 2. Handle Tool Call
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      if (toolCall.function.name === "create_booking") {
        const bookingArgs = JSON.parse(toolCall.function.arguments);
        
        // Execute booking logic
        console.log("🤖 Chatbot creating booking:", bookingArgs);
        const bookingResult = await createAppointment(bookingArgs);
        
        // 3. Send result back to LLM for final confirmation
        const toolOutputMessage = {
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({ 
            success: true, 
            appointmentId: bookingResult.appointment.id,
            status: "Booked successfully. Email sent." 
          })
        };

        const finalResponse = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages,
              message, // The assistant message with tool_calls
              toolOutputMessage // The result of the tool
            ]
          })
        });
        
        const finalData = await finalResponse.json();
        
        console.log("🎫 [CHATBOT] Booking completed, returning ticketData with qrCodeUrl:", bookingResult.qrCodeUrl ? "✅ Has URL" : "⚠️ No URL (will use fallback)");
        
        // Return with ticket data for frontend to display
        return c.json({ 
          success: true, 
          message: finalData.choices[0].message.content,
          ticketData: {
            id: bookingResult.appointment.id,
            customerName: bookingResult.appointment.customerName,
            customerPhone: bookingResult.appointment.customerPhone,
            appointmentTime: bookingResult.appointment.appointmentTime,
            serviceNames: Array.isArray(bookingResult.appointment.serviceNames) 
              ? bookingResult.appointment.serviceNames.join(', ') 
              : bookingResult.appointment.serviceNames || 'Services',
            branchName: "Bitcoin Nail Bar - Houston, TX",
            qrCodeUrl: bookingResult.qrCodeUrl
          }
        });
      }
    }

    return c.json({ success: true, message: message.content });

  } catch (error: any) {
    console.log("Error in chat:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export const chatbotApp = app;
