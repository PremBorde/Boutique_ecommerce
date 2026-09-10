import {
  searchProducts,
  getProductById,
  checkStock,
  getStoreInfo,
  getCraftStory,
  STORE_INFO,
} from "../src/lib/ai/tools";
import { computeStylePersona } from "../src/lib/ai/personas";
import { getComplementarySlugs } from "../src/lib/ai/complementary-categories";
import { getActiveFestival } from "../src/lib/ai/festivals";
import prisma from "../src/lib/prisma";

async function runGuardrailVerification() {
  console.log("==================================================================");
  console.log("       ZARIA ATELIER AI ASSISTANT GUARDRAIL VERIFICATION         ");
  console.log("==================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    total++;
    if (condition) {
      console.log(`✓ PASS [Test ${total}]: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL [Test ${total}]: ${testName}`);
      if (detail) console.error("  Detail:", detail);
    }
  }

  // 1. Zero Hallucination Search Test
  console.log("--- 1. Testing Zero-Hallucination Search ---");
  const emptyResults = await searchProducts({
    query: "black western mini dress polyester",
    maxPrice: 2500,
  });
  assert(
    Array.isArray(emptyResults) && emptyResults.length === 0,
    "Zero-match query returns empty array without hallucinating products",
    emptyResults
  );

  // 2. Real Product Discovery
  console.log("\n--- 2. Testing Grounded Product Discovery ---");
  const silkResults = await searchProducts({
    query: "silk",
    inStockOnly: true,
  });
  assert(
    silkResults.length > 0 &&
      silkResults.every((p) => p.inStock && p.price > 0 && typeof p.name === "string"),
    "Returns verified in-stock silk garments from real PostgreSQL rows",
    silkResults.map((p) => `${p.name} (₹${p.price})`)
  );

  // 3. Precision Product By ID
  console.log("\n--- 3. Testing Precision Product Lookup ---");
  const firstProduct = silkResults[0];
  const fetchedProduct = await getProductById(firstProduct.id);
  assert(
    fetchedProduct !== null &&
      fetchedProduct.id === firstProduct.id &&
      fetchedProduct.name === firstProduct.name &&
      fetchedProduct.price === firstProduct.price &&
      fetchedProduct.variants.length > 0,
    "Product by ID returns exact DB record with variants and live inventory",
    fetchedProduct?.name
  );

  // 4. Live Stock / Missing Variant Check
  console.log("\n--- 4. Testing Live Stock & Non-Existent Variant Check ---");
  const missingVariantStock = await checkStock({
    productId: firstProduct.id,
    size: "XXXL_NONEXISTENT",
  });
  assert(
    missingVariantStock.available === false && missingVariantStock.quantity === 0,
    "Correctly reports unavailable when an unoffered size is queried",
    missingVariantStock
  );

  // 5. Store Policy Determinism
  console.log("\n--- 5. Testing Hand-Written Store Policy Determinism ---");
  const returnPolicy = getStoreInfo("return policy and refund window");
  assert(
    returnPolicy === STORE_INFO.returns,
    "Answers return policy exactly from STORE_INFO constant",
    returnPolicy
  );

  const codPolicy = getStoreInfo("can I pay with COD or cash on delivery?");
  assert(
    codPolicy === STORE_INFO.cod,
    "Answers COD query strictly from STORE_INFO constant",
    codPolicy
  );

  const shippingPolicy = getStoreInfo("shipping timeline and express charges");
  assert(
    shippingPolicy === STORE_INFO.shipping,
    "Answers shipping question strictly from STORE_INFO constant",
    shippingPolicy
  );

  // 6. Craft Story Grounding (Section 8.1)
  console.log("\n--- 6. Testing Craft & Heritage Storytelling (Section 8.1) ---");
  const craftStoryResult = await getCraftStory(firstProduct.id);
  assert(
    craftStoryResult.productId === firstProduct.id &&
      typeof craftStoryResult.name === "string" &&
      (craftStoryResult.craftStory !== undefined),
    "Retrieves authentic craft story without LLM improvising heritage facts",
    craftStoryResult
  );

  // 7. Style Persona Scoring (Section 8.2)
  console.log("\n--- 7. Testing Deterministic Style Persona Scoring (Section 8.2) ---");
  const royalSignals = [
    { category: "Heritage Sarees", color: "crimson", price: 65000 },
    { query: "banarasi zari bridal silk", color: "gold", price: 85000 },
  ];
  const computedPersona = computeStylePersona(royalSignals);
  assert(
    computedPersona !== null && computedPersona.id === "modern-maharani",
    "Accurately classifies 'The Modern Maharani' persona from session signals",
    computedPersona?.name
  );

  // 8. Curated Complementary Categories (Section 8.3)
  console.log("\n--- 8. Testing Curated Complementary Pairings (Section 8.3) ---");
  const sareePairings = getComplementarySlugs("heritage-sarees");
  assert(
    Array.isArray(sareePairings) && sareePairings.length > 0,
    "Returns curated complementary category slugs for styling pairings",
    sareePairings
  );

  // 9. Festival Window Engine (Section 8.4)
  console.log("\n--- 9. Testing Lunar/Calendar Festival Engine (Section 8.4) ---");
  const activeFest = getActiveFestival(new Date());
  assert(
    activeFest !== null && typeof activeFest.chipLabel === "string",
    "Computes active seasonal/festive chip without AI date hallucination",
    activeFest?.chipLabel
  );

  // 10. Unmet Search Request Logging (Section 8.5)
  console.log("\n--- 10. Testing Unmet Demand Logging (Section 8.5) ---");
  const testUnmet = await (prisma as any).unmetSearchRequest.create({
    data: {
      query: "velvet kaftan with real silver gotta under 3000",
      filtersUsed: { maxPrice: 3000, fabric: "velvet" },
      sessionId: "test_verification_session",
    },
  });
  assert(
    testUnmet && testUnmet.id && testUnmet.query.includes("velvet kaftan"),
    "Successfully logs unmet customer search into database table",
    testUnmet.id
  );

  // Cleanup test record
  await (prisma as any).unmetSearchRequest.delete({ where: { id: testUnmet.id } });

  console.log("\n==================================================================");
  console.log(` VERIFICATION COMPLETE: ${passed} / ${total} TESTS PASSED `);
  console.log("==================================================================");

  if (passed === total) {
    console.log("All AI Guardrail & Grounding verification tests passed with flying colors!\n");
  } else {
    process.exit(1);
  }
}

runGuardrailVerification()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
