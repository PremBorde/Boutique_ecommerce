import { matchPrebuiltIntent, executeSmartFallback } from "../src/lib/ai/prebuilt-answers";
import prisma from "../src/lib/prisma";

async function testPrebuiltSystem() {
  console.log("=== TESTING PRE-BUILT ZERO-COST INTENT ENGINE ===");

  // 1. User's exact query from screenshot
  const navratriQuery = "Show me vibrant jewel-toned silks for Navratri and Durga Puja celebrations";
  const navratriResult = await matchPrebuiltIntent(navratriQuery);
  console.log("\n[Test 1] Navratri Query:", navratriQuery);
  console.log("Matched:", navratriResult?.matched);
  console.log("Message:", navratriResult?.message);
  console.log("Products Count:", navratriResult?.products.length);

  if (navratriResult?.products.length) {
    const products = await prisma.product.findMany({
      where: { id: { in: navratriResult.products } },
      select: { name: true, basePrice: true },
    });
    console.log("Real Garments Surfaced:", products.map(p => `${p.name} (₹${p.basePrice})`));
  }

  // 2. Return Policy
  const policyQuery = "What is your return & exchange policy?";
  const policyResult = await matchPrebuiltIntent(policyQuery);
  console.log("\n[Test 2] Return Policy Query:", policyQuery);
  console.log("Matched:", policyResult?.matched);
  console.log("Message:", policyResult?.message);

  // 3. Price under 45,000
  const priceQuery = "Show me festive lehengas under ₹45,000";
  const priceResult = await matchPrebuiltIntent(priceQuery);
  console.log("\n[Test 3] Price Query:", priceQuery);
  console.log("Matched:", priceResult?.matched);
  console.log("Message:", priceResult?.message);
  console.log("Products Count:", priceResult?.products.length);

  // 4. Smart Local Fallback for arbitrary query
  const arbitraryQuery = "Do you have midnight blue velvet sherwani for sangeet?";
  const fallbackResult = await executeSmartFallback(arbitraryQuery);
  console.log("\n[Test 4] Smart Fallback Query:", arbitraryQuery);
  console.log("Fallback Message:", fallbackResult.message);
  console.log("Fallback Products:", fallbackResult.products.length);
}

testPrebuiltSystem()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
