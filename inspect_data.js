
const projectId = "pwmrmcipniefewufwjjy";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bXJtY2lwbmllZmV3dWZ3amp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTgwMDEsImV4cCI6MjA4MjEzNDAwMX0.i8S8gaa2t3NNKq-BUz-600eRYa8tfJeW14Ydold-i9k";

async function fetchData() {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/settings/service-menu`,
      {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      }
    );
    const result = await response.json();
    
    // Inspect structure
    if (result.success && result.data) {
        console.log("Categories:", Object.keys(result.data));
        const pedicure = result.data['pedicure']; // Assuming 'pedicure' is the key based on screenshot
        if (pedicure) {
            console.log("Pedicure Groups:", pedicure.groups.map(g => g.name));
            console.log("Pedicure Group 1 Items count:", pedicure.groups[0].items.length);
            
            // Check for addons and compatibleServiceIds
            const allItems = Object.values(result.data).flatMap(cat => 
                cat.groups?.flatMap(g => g.items || []) || []
            );
            
            const addons = allItems.filter(s => s.serviceType === 'addon');
            console.log("Total Addons found:", addons.length);
            if(addons.length > 0) {
                console.log("Sample Addon:", JSON.stringify(addons[0], null, 2));
            }

            const regular = pedicure.groups[0].items.find(s => s.serviceType !== 'addon');
            if(regular) {
                console.log("Sample Regular Service:", JSON.stringify(regular, null, 2));
            }
        } else {
            console.log("Pedicure category not found. Keys:", Object.keys(result.data));
             // Just take the first category
             const firstKey = Object.keys(result.data)[0];
             const cat = result.data[firstKey];
             console.log(`Checking category ${firstKey}`);
             const regular = cat.groups[0]?.items.find(s => s.serviceType !== 'addon');
              if(regular) {
                console.log("Sample Regular Service:", JSON.stringify(regular, null, 2));
            }
        }
    } else {
        console.log("Failed or no data", result);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchData();
