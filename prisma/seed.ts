import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Beginning Zaria Atelier luxury database seeding...");

  // 1. Enforce PostgreSQL check constraint for non-negative inventory
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Inventory" DROP CONSTRAINT IF EXISTS check_inventory_non_negative;`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Inventory" ADD CONSTRAINT check_inventory_non_negative CHECK (quantity >= 0);`
    );
    console.log("✓ Enforced DB check constraint: Inventory.quantity >= 0");
  } catch (err) {
    console.warn("Notice: Check constraint application warning:", err);
  }

  // 2. Clean existing records in reverse dependency order
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.user.deleteMany();

  // 3. Seed Users (Admin & Customer)
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("Admin@1234", salt);
  const customerPassword = await bcrypt.hash("Customer@1234", salt);

  const admin = await prisma.user.create({
    data: {
      email: "admin@zaria.com",
      name: "Master Artisan",
      role: "ADMIN",
      passwordHash: adminPassword,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "ananya@luxury.com",
      name: "Ananya Singhania",
      role: "CUSTOMER",
      passwordHash: customerPassword,
    },
  });

  console.log("✓ Seeded users: admin@zaria.com & ananya@luxury.com");

  // 4. Seed Coupons
  const now = new Date();
  const futureExpiry = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000); // 180 days ahead
  const pastExpiry = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago

  await prisma.coupon.createMany({
    data: [
      {
        code: "ROYAL15",
        percentOff: 15,
        minOrderValue: 4999,
        maxDiscount: 2500,
        expiresAt: futureExpiry,
        active: true,
      },
      {
        code: "FESTIVE25",
        percentOff: 25,
        minOrderValue: 12000,
        maxDiscount: 5000,
        expiresAt: futureExpiry,
        active: true,
      },
      {
        code: "ATELIER10",
        percentOff: 10,
        minOrderValue: 2999,
        expiresAt: futureExpiry,
        active: true,
      },
      {
        code: "EXPIRED20",
        percentOff: 20,
        minOrderValue: 3000,
        expiresAt: pastExpiry,
        active: true, // will fail in API validation due to expired date
      },
    ],
  });
  console.log("✓ Seeded active and expired coupons");

  // 5. Seed Categories
  const catLehengas = await prisma.category.create({
    data: {
      name: "Lehengas & Couture",
      slug: "lehengas-couture",
      description: "Heirloom bridal and festive lehengas intricately cut from raw silks and brocades.",
      imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop",
    },
  });

  const catSarees = await prisma.category.create({
    data: {
      name: "Heritage Sarees",
      slug: "heritage-sarees",
      description: "Handwoven Varanasi Katan, Chanderi tissue, and gilded organza drapes.",
      imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
    },
  });

  const catAnarkalis = await prisma.category.create({
    data: {
      name: "Anarkalis & Ensembles",
      slug: "anarkalis-ensembles",
      description: "Voluminous silhouettes adorned with dabka, gota patti, and hand-beaded borders.",
      imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop",
    },
  });

  const catPret = await prisma.category.create({
    data: {
      name: "Festive Pret",
      slug: "festive-pret",
      description: "Effortless, small-batch silk tunic and trouser sets for intimate celebrations.",
      imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop",
    },
  });

  const catMenswear = await prisma.category.create({
    data: {
      name: "Regal Menswear",
      slug: "regal-menswear",
      description: "Tailored achkans, bandhgalas, and embroidered silk sherwanis.",
      imageUrl: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=1000&auto=format&fit=crop",
    },
  });

  // 6. Seed Detailed Products with Multiple Variants & Stock Quantities
  const productsData = [
    {
      name: "The Noor Mahal Velvet Lehenga",
      slug: "noor-mahal-velvet-lehenga",
      description:
        "Crafted from deep jewel-toned mulberry velvet, this heirloom lehenga features 18 hand-embroidered panels depicting Mughal arches, gold dabka, and pearl florets. Paired with a tissue dupatta.",
      story:
        "Over 340 artisan hours in Varanasi were devoted to rendering the scalloped jaal borders with fine metallic zari thread.",
      fabric: "Silk Velvet with Pure Metallic Zari & Seed Pearl Trims",
      basePrice: 28500,
      categoryId: catLehengas.id,
      featured: true,
      images: [
        {
          url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop",
          altText: "Noor Mahal Lehenga in Crimson Wine front view",
          color: "Crimson Wine",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop",
          altText: "Noor Mahal Lehenga embroidery close-up",
          color: "Crimson Wine",
          order: 1,
          isPrimary: false,
        },
        {
          url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop",
          altText: "Noor Mahal Lehenga in Emerald Forest",
          color: "Emerald Forest",
          order: 2,
          isPrimary: false,
        },
      ],
      variants: [
        { color: "Crimson Wine", colorHex: "#4A0E17", size: "XS", sku: "ZR-NML-CRM-XS", stock: 3 },
        { color: "Crimson Wine", colorHex: "#4A0E17", size: "S", sku: "ZR-NML-CRM-S", stock: 5 },
        { color: "Crimson Wine", colorHex: "#4A0E17", size: "M", sku: "ZR-NML-CRM-M", stock: 4 },
        { color: "Crimson Wine", colorHex: "#4A0E17", size: "L", sku: "ZR-NML-CRM-L", stock: 2 },
        { color: "Emerald Forest", colorHex: "#0B3B24", size: "S", sku: "ZR-NML-EMR-S", stock: 3 },
        { color: "Emerald Forest", colorHex: "#0B3B24", size: "M", sku: "ZR-NML-EMR-M", stock: 0 }, // Out of stock to test UI
        { color: "Emerald Forest", colorHex: "#0B3B24", size: "L", sku: "ZR-NML-EMR-L", stock: 2 },
      ],
    },
    {
      name: "The Varanasi Katan Brocade Saree",
      slug: "varanasi-katan-brocade-saree",
      description:
        "Woven on traditional pit looms in Varanasi, this pure Katan silk saree presents dense antique gold kadhwa motifs on an opulent ground. Includes an unstitched brocade blouse piece.",
      story:
        "The master weavers of Chowk, Varanasi interlace real silver and gold gilded wire using the centuries-old kadhwa technique.",
      fabric: "100% Handloom Katan Silk with Tested Zari",
      basePrice: 14800,
      categoryId: catSarees.id,
      featured: true,
      images: [
        {
          url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop",
          altText: "Varanasi Saree in Royal Plum",
          color: "Royal Plum",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop",
          altText: "Varanasi Saree Pallu detail",
          color: "Royal Plum",
          order: 1,
          isPrimary: false,
        },
        {
          url: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=1200&auto=format&fit=crop",
          altText: "Varanasi Saree in Antique Gold",
          color: "Antique Gold",
          order: 2,
          isPrimary: false,
        },
      ],
      variants: [
        { color: "Royal Plum", colorHex: "#351229", size: "Free Size", sku: "ZR-VKS-PLM-FS", stock: 6 },
        { color: "Antique Gold", colorHex: "#C9A050", size: "Free Size", sku: "ZR-VKS-GLD-FS", stock: 4 },
        { color: "Verdant Emerald", colorHex: "#0B3B24", size: "Free Size", sku: "ZR-VKS-EMR-FS", stock: 1 }, // Low stock
      ],
    },
    {
      name: "The Mehrunnisa Anarkali Ensemble",
      slug: "mehrunnisa-anarkali-ensemble",
      description:
        "A floor-sweeping Kalidar silhouette cut from 48 meters of pleated tissue organza, framed with antique marodi hand-embroidery and a sheer Banarasi dupatta.",
      story:
        "Inspired by Mughal court portraiture, the yoke features miniature paisley cartouches hand-filled with gilded cord.",
      fabric: "Luminous Tissue Organza with Silk Lining",
      basePrice: 18900,
      categoryId: catAnarkalis.id,
      featured: true,
      images: [
        {
          url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop",
          altText: "Mehrunnisa Anarkali in Sand Ivory",
          color: "Sand Ivory",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
          altText: "Mehrunnisa Anarkali drape movement",
          color: "Sand Ivory",
          order: 1,
          isPrimary: false,
        },
        {
          url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1200&auto=format&fit=crop",
          altText: "Mehrunnisa Anarkali in Rose Quartz",
          color: "Rose Quartz",
          order: 2,
          isPrimary: false,
        },
      ],
      variants: [
        { color: "Sand Ivory", colorHex: "#F4EFE6", size: "S", sku: "ZR-MNA-IVR-S", stock: 4 },
        { color: "Sand Ivory", colorHex: "#F4EFE6", size: "M", sku: "ZR-MNA-IVR-M", stock: 3 },
        { color: "Sand Ivory", colorHex: "#F4EFE6", size: "L", sku: "ZR-MNA-IVR-L", stock: 2 },
        { color: "Rose Quartz", colorHex: "#A85D6A", size: "S", sku: "ZR-MNA-RSQ-S", stock: 2 },
        { color: "Rose Quartz", colorHex: "#A85D6A", size: "M", sku: "ZR-MNA-RSQ-M", stock: 1 },
      ],
    },
    {
      name: "The Gulrukh Chanderi Kurta Set",
      slug: "gulrukh-chanderi-kurta-set",
      description:
        "Straight-cut silk chanderi kurta adorned with fine threadwork and gota borders, matched with tapered farshi trousers and a scallop-edged organza dupatta.",
      story:
        "Chanderi's legendary sheer gossamer weave is blended here with pure mulberry silk for a regal drape that breathes effortlessly.",
      fabric: "Silk Chanderi with Hand-Block Gota Accents",
      basePrice: 8400,
      categoryId: catPret.id,
      featured: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=1200&auto=format&fit=crop",
          altText: "Gulrukh Kurta Set in Saffron Ochre",
          color: "Saffron Ochre",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop",
          altText: "Gulrukh Kurta Set in Midnight Teal",
          color: "Midnight Teal",
          order: 1,
          isPrimary: false,
        },
      ],
      variants: [
        { color: "Saffron Ochre", colorHex: "#D99B26", size: "S", sku: "ZR-GKS-OCH-S", stock: 8 },
        { color: "Saffron Ochre", colorHex: "#D99B26", size: "M", sku: "ZR-GKS-OCH-M", stock: 6 },
        { color: "Saffron Ochre", colorHex: "#D99B26", size: "L", sku: "ZR-GKS-OCH-L", stock: 5 },
        { color: "Midnight Teal", colorHex: "#0D3836", size: "M", sku: "ZR-GKS-TEA-M", stock: 4 },
        { color: "Midnight Teal", colorHex: "#0D3836", size: "L", sku: "ZR-GKS-TEA-L", stock: 0 },
      ],
    },
    {
      name: "The Darbar Silk Sherwani",
      slug: "darbar-silk-sherwani",
      description:
        "Structured achkan sherwani hand-tailored from textured raw silk, featuring concealed placket closure, French knot cuffs, and a jewel-toned silk lining.",
      story:
        "Cut with architectural precision for celebratory occasions, each button is individually hand-cast in antique brass.",
      fabric: "Matka Raw Silk with Hand-Woven Brocade Lining",
      basePrice: 22500,
      categoryId: catMenswear.id,
      featured: true,
      images: [
        {
          url: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=1200&auto=format&fit=crop",
          altText: "Darbar Sherwani in Antique Sand",
          color: "Antique Sand",
          order: 0,
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
          altText: "Darbar Sherwani collar craft",
          color: "Antique Sand",
          order: 1,
          isPrimary: false,
        },
      ],
      variants: [
        { color: "Antique Sand", colorHex: "#DDD2BF", size: "38", sku: "ZR-DSS-SND-38", stock: 3 },
        { color: "Antique Sand", colorHex: "#DDD2BF", size: "40", sku: "ZR-DSS-SND-40", stock: 4 },
        { color: "Antique Sand", colorHex: "#DDD2BF", size: "42", sku: "ZR-DSS-SND-42", stock: 2 },
        { color: "Antique Sand", colorHex: "#DDD2BF", size: "44", sku: "ZR-DSS-SND-44", stock: 1 },
      ],
    },
    {
      name: "The Sitara Tissue Silk Drape",
      slug: "sitara-tissue-silk-drape",
      description:
        "Woven with ultra-fine metallic yarn in warp and weft, creating a liquid gold iridescence that catches the warm evening light. Finished with hand-knotted silk tassels.",
      story:
        "Lightweight yet sculptural, the tissue drape has been handcrafted for contemporary festive dressing.",
      fabric: "Liquid Gold Tissue Silk with Zari Border",
      basePrice: 11200,
      categoryId: catSarees.id,
      featured: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop",
          altText: "Sitara Tissue Drape in Liquid Gold",
          color: "Liquid Gold",
          order: 0,
          isPrimary: true,
        },
      ],
      variants: [
        { color: "Liquid Gold", colorHex: "#E6CA85", size: "Free Size", sku: "ZR-STD-GLD-FS", stock: 7 },
        { color: "Rose Copper", colorHex: "#B87063", size: "Free Size", sku: "ZR-STD-COP-FS", stock: 3 },
      ],
    },
  ];

  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        story: p.story,
        fabric: p.fabric,
        basePrice: p.basePrice,
        categoryId: p.categoryId,
        featured: p.featured,
        images: {
          create: p.images.map((img) => ({
            url: img.url,
            altText: img.altText,
            color: img.color,
            order: img.order,
            isPrimary: img.isPrimary,
          })),
        },
      },
    });

    for (const v of p.variants) {
      const variant = await prisma.variant.create({
        data: {
          productId: product.id,
          color: v.color,
          colorHex: v.colorHex,
          size: v.size,
          sku: v.sku,
          inventory: {
            create: {
              quantity: v.stock,
            },
          },
        },
      });
    }
  }

  console.log(`✓ Seeded ${productsData.length} luxury products with full variant matrices and inventory`);

  // 7. Seed Sample Historical Order for Customer with state machine history
  const firstVariant = await prisma.variant.findFirst({
    include: { product: true },
  });

  if (firstVariant) {
    const order = await prisma.order.create({
      data: {
        orderNumber: "ZR-2026-8819",
        userId: customer.id,
        customerName: customer.name,
        email: customer.email,
        phone: "+91 98200 12345",
        shippingAddress: {
          line1: "Haveli 14, Civil Lines",
          city: "Jaipur",
          state: "Rajasthan",
          postalCode: "302006",
          country: "India",
        },
        subtotal: firstVariant.product.basePrice,
        discount: 0,
        shipping: 0,
        total: firstVariant.product.basePrice,
        status: "PROCESSING",
        paymentMethod: "SIMULATED_CARD",
        paymentStatus: "PAID",
        items: {
          create: [
            {
              variantId: firstVariant.id,
              sku: firstVariant.sku,
              title: firstVariant.product.name,
              color: firstVariant.color,
              size: firstVariant.size,
              qty: 1,
              unitPriceAtPurchase: firstVariant.product.basePrice,
              subtotal: firstVariant.product.basePrice,
            },
          ],
        },
        statusHistory: {
          create: [
            { status: "PENDING", note: "Order placed by customer via simulated checkout" },
            { status: "CONFIRMED", note: "Payment verified successfully" },
            { status: "PROCESSING", note: "Atelier master craftsman preparing garment cut" },
          ],
        },
      },
    });
    console.log(`✓ Seeded sample customer order: ${order.orderNumber}`);
  }

  console.log("✓ Zaria Atelier database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
