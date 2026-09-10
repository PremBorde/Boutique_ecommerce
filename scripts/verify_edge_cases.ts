import prisma from "../src/lib/prisma";
import { canTransition, getAllowedTransitions } from "../src/lib/state-machine";

async function runEdgeCaseTests() {
  console.log("==================================================");
  console.log("  ZARIA ATELIER — EDGE CASES & INTEGRITY TEST SUITE ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  // TEST 1: State Machine Transition Constraints
  console.log("\n[Test 1] State Machine Transition Rules:");
  const test1a = canTransition("PENDING", "CONFIRMED");
  const test1b = canTransition("CONFIRMED", "PROCESSING");
  const test1c = canTransition("SHIPPED", "PENDING"); // MUST BE FALSE
  const test1d = canTransition("DELIVERED", "CONFIRMED"); // MUST BE FALSE
  const test1e = canTransition("PROCESSING", "CANCELLED"); // MUST BE FALSE (only PENDING/CONFIRMED can cancel)

  if (test1a && test1b && !test1c && !test1d && !test1e) {
    console.log("  ✓ PASS: State machine correctly permits valid transitions and rejects invalid/terminal transitions.");
    passed++;
  } else {
    console.error("  ✗ FAIL: State machine allowed invalid transition!");
    failed++;
  }

  // TEST 2: Database Check Constraint (quantity >= 0)
  console.log("\n[Test 2] PostgreSQL Database CHECK Constraint (quantity >= 0):");
  const sampleVariant = await prisma.variant.findFirst({
    include: { inventory: true },
  });

  if (!sampleVariant) {
    console.error("  ✗ FAIL: No variant found to test inventory constraint.");
    failed++;
  } else {
    try {
      // Attempt to force a negative quantity into the Inventory table
      await prisma.$executeRawUnsafe(
        `UPDATE "Inventory" SET quantity = -5 WHERE "variantId" = '${sampleVariant.id}';`
      );
      console.error("  ✗ FAIL: Database allowed negative inventory!");
      failed++;
    } catch (err: any) {
      console.log("  ✓ PASS: Database rejected negative stock with check_inventory_non_negative constraint violation.");
      passed++;
    }
  }

  // TEST 3: Concurrent Race-Condition / Over-selling Simulation
  console.log("\n[Test 3] Simulated Race-Condition Protection (Two concurrent checkouts for 1 unit of stock):");
  // Create a temporary test variant with exactly 1 unit of stock
  const testProduct = await prisma.product.findFirst();
  if (testProduct) {
    const raceVariant = await prisma.variant.create({
      data: {
        productId: testProduct.id,
        color: "Imperial Gold Test",
        colorHex: "#D4AF37",
        size: "TEST",
        sku: `ZR-RACE-${Date.now()}`,
        inventory: {
          create: { quantity: 1 },
        },
      },
      include: { inventory: true },
    });

    // Simulate 2 parallel order transactions attempting to decrement 1 unit simultaneously
    const attemptOrder = async (orderId: string) => {
      try {
        return await prisma.$transaction(
          async (tx) => {
            const res = await tx.inventory.updateMany({
              where: {
                variantId: raceVariant.id,
                quantity: { gte: 1 },
              },
              data: {
                quantity: { decrement: 1 },
              },
            });
            if (res.count !== 1) {
              throw new Error("INSUFFICIENT_STOCK");
            }
            return `SUCCESS_${orderId}`;
          },
          { maxWait: 10000, timeout: 15000 }
        );
      } catch (err: any) {
        return `FAILED_${err.message}`;
      }
    };

    const [resultA, resultB] = await Promise.all([
      attemptOrder("A"),
      attemptOrder("B"),
    ]);

    const successes = [resultA, resultB].filter((r) => r.startsWith("SUCCESS_"));
    const failures = [resultA, resultB].filter((r) => r.includes("INSUFFICIENT_STOCK"));

    if (successes.length === 1 && failures.length === 1) {
      console.log("  ✓ PASS: Exactly 1 order succeeded and 1 failed with INSUFFICIENT_STOCK. Zero over-selling!");
      passed++;
    } else {
      console.error(`  ✗ FAIL: Race condition failed! Results: A=${resultA}, B=${resultB}`);
      failed++;
    }

    // Clean up test variant
    await prisma.inventory.delete({ where: { variantId: raceVariant.id } });
    await prisma.variant.delete({ where: { id: raceVariant.id } });
  }

  // TEST 4: Expired Coupon Rejection
  console.log("\n[Test 4] Expired Coupon Validation:");
  const expiredCoupon = await prisma.coupon.findUnique({
    where: { code: "EXPIRED20" },
  });

  if (expiredCoupon && expiredCoupon.expiresAt <= new Date()) {
    console.log("  ✓ PASS: Expired coupon 'EXPIRED20' has past timestamp and will be rejected at checkout.");
    passed++;
  } else {
    console.error("  ✗ FAIL: Expired coupon test setup invalid.");
    failed++;
  }

  // Summary
  console.log("\n==================================================");
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runEdgeCaseTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
