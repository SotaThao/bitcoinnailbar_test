// Test script to verify Resend API
// Run this to check if your API key and domain are working

import { Resend } from 'npm:resend';

const apiKey = Deno.env.get("RESEND_API_KEY");
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || 'Bitcoin Nail Bar <bookings@tnsthao94.online>';

console.log("=== RESEND TEST SCRIPT ===");
console.log("API Key exists:", !!apiKey);
console.log("API Key preview:", apiKey ? `${apiKey.substring(0, 7)}...` : 'MISSING');
console.log("From Email:", fromEmail);
console.log("==========================");

if (!apiKey) {
  console.error("ERROR: RESEND_API_KEY not found in environment variables!");
  Deno.exit(1);
}

try {
  const resend = new Resend(apiKey);
  
  console.log("\nAttempting to send test email...");
  
  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: ['thaob1203247@gmail.com'], // Array format as per Resend docs
    subject: 'Test Email from Bitcoin Nail Bar',
    html: '<p>This is a test email. If you receive this, Resend integration is working! 🎉</p>',
  });

  console.log("\n=== RESULT ===");
  if (error) {
    console.error("❌ ERROR:");
    console.error("Error object:", error);
    console.error("Error JSON:", JSON.stringify(error, null, 2));
  } else {
    console.log("✅ SUCCESS!");
    console.log("Email ID:", data?.id);
    console.log("Full response:", JSON.stringify(data, null, 2));
  }
  console.log("=================");

} catch (err) {
  console.error("\n❌ EXCEPTION CAUGHT:");
  console.error("Error:", err);
  console.error("Error message:", err.message);
  console.error("Error stack:", err.stack);
}
