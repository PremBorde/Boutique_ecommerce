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
      imageUrl: "/products/lehenga_crimson_bridal.jpg",
    },
  });

  const catSarees = await prisma.category.create({
    data: {
      name: "Heritage Sarees",
      slug: "heritage-sarees",
      description: "Handwoven Varanasi Katan, Chanderi tissue, and gilded organza drapes.",
      imageUrl: "/products/saree_varanasi_katan.jpg",
    },
  });

  const catAnarkalis = await prisma.category.create({
    data: {
      name: "Anarkalis & Ensembles",
      slug: "anarkalis-ensembles",
      description: "Voluminous silhouettes adorned with dabka, gota patti, and hand-beaded borders.",
      imageUrl: "/products/anarkali_ivory.jpg",
    },
  });

  const catPret = await prisma.category.create({
    data: {
      name: "Festive Pret",
      slug: "festive-pret",
      description: "Effortless, small-batch silk tunic and trouser sets for intimate celebrations.",
      imageUrl: "/products/pret_saffron_kurta.jpg",
    },
  });

  const catMenswear = await prisma.category.create({
    data: {
      name: "Regal Menswear",
      slug: "regal-menswear",
      description: "Tailored achkans, bandhgalas, and embroidered silk sherwanis.",
      imageUrl: "/products/menswear_sherwani.jpg",
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
          url: "/products/lehenga_crimson_bridal.jpg",
          altText: "Noor Mahal Lehenga in Crimson Wine front view",
          color: "Crimson Wine",
          order: 0,
          isPrimary: true,
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
          url: "/products/saree_varanasi_katan.jpg",
          altText: "Varanasi Saree in Royal Plum",
          color: "Royal Plum",
          order: 0,
          isPrimary: true,
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
          url: "/products/anarkali_ivory.jpg",
          altText: "Mehrunnisa Anarkali in Sand Ivory",
          color: "Sand Ivory",
          order: 0,
          isPrimary: true,
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
          url: "/products/pret_saffron_kurta.jpg",
          altText: "Gulrukh Kurta Set in Saffron Ochre",
          color: "Saffron Ochre",
          order: 0,
          isPrimary: true,
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
          url: "/products/menswear_sherwani.jpg",
          altText: "Darbar Sherwani in Cream and Antique Gold",
          color: "Antique Cream",
          order: 0,
          isPrimary: true,
        },
      ],
      variants: [
        { color: "Antique Cream", colorHex: "#EFE8D8", size: "38", sku: "ZR-DSS-SND-38", stock: 3 },
        { color: "Antique Cream", colorHex: "#EFE8D8", size: "40", sku: "ZR-DSS-SND-40", stock: 4 },
        { color: "Antique Cream", colorHex: "#EFE8D8", size: "42", sku: "ZR-DSS-SND-42", stock: 2 },
        { color: "Antique Cream", colorHex: "#EFE8D8", size: "44", sku: "ZR-DSS-SND-44", stock: 1 },
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
          url: "/products/saree_sitara_gold.jpg",
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
    // --- ADDITIONAL COUTURE PRODUCTS ---
    {
      name: "The Mehrunissa Zardozi Bridal Lehenga",
      slug: "mehrunissa-zardozi-bridal-lehenga",
      description:
        "Hand-spun crimson raw silk kalidar embellished with 24-karat gold dipped zardozi embroidery, peacock medallion motifs, and semi-precious quartz crystals. Complemented by an antique tissue veil.",
      story:
        "Master karigars in Old Delhi spent 420 hours hand-couching real gold wire onto heavy Bangalore silk to sculpt this royal heirloom.",
      fabric: "Pure Raw Silk with 24k Gold Zardozi & Hand-Embroidered Resham",
      basePrice: 42000,
      categoryId: catLehengas.id,
      featured: true,
      images: [
        {
          url: "/products/lehenga_crimson_bridal.jpg",
          altText: "Mehrunissa Bridal Lehenga in Imperial Crimson",
          color: "Imperial Crimson",
          order: 0,
          isPrimary: true,
        },
      ],
      variants: [
        { color: "Imperial Crimson", colorHex: "#5E0B1B", size: "XS", sku: "ZR-MZL-CRM-XS", stock: 2 },
        { color: "Imperial Crimson", colorHex: "#5E0B1B", size: "S", sku: "ZR-MZL-CRM-S", stock: 4 },
        { color: "Imperial Crimson", colorHex: "#5E0B1B", size: "M", sku: "ZR-MZL-CRM-M", stock: 3 },
        { color: "Imperial Crimson", colorHex: "#5E0B1B", size: "L", sku: "ZR-MZL-CRM-L", stock: 2 },
        { color: "Imperial Crimson", colorHex: "#5E0B1B", size: "XL", sku: "ZR-MZL-CRM-XL", stock: 1 },
      ],
    },
    {
      name: "The Gul-e-Bahar Ivory Organza Lehenga",
      slug: "gul-e-bahar-ivory-organza-lehenga",
      description:
        "A diaphanous ivory organza skirt adorned with pastel Kashmiri threadwork, lustrous pearl borders, and silver gota ribbons. Paired with a sweetheart neckline corset blouse.",
      story:
        "Conceived for moonlit summer soirées, this silhouette pairs Persian floral creepers with gossamer organza that floats with every step.",
      fabric: "Triple-Layered Gossamer Silk Organza with Fine Pearl Beading",
      basePrice: 31500,
      categoryId: catLehengas.id,
      featured: true,
      images: [
        {
          url: "/products/lehenga_ivory_organza.jpg",
          altText: "Gul-e-Bahar Organza Lehenga in Moonlit Ivory",
          color: "Moonlit Ivory",
          order: 0,
          isPrimary: true,
        },
      ],
      variants: [
        { color: "Moonlit Ivory", colorHex: "#FBF9F4", size: "XS", sku: "ZR-GBL-IVR-XS", stock: 3 },
        { color: "Moonlit Ivory", colorHex: "#FBF9F4", size: "S", sku: "ZR-GBL-IVR-S", stock: 5 },
        { color: "Moonlit Ivory", colorHex: "#FBF9F4", size: "M", sku: "ZR-GBL-IVR-M", stock: 4 },
        { color: "Moonlit Ivory", colorHex: "#FBF9F4", size: "L", sku: "ZR-GBL-IVR-L", stock: 2 },
      ],
    },
    {
      name: "The Rajkumari Emerald Kalidar Lehenga",
      slug: "rajkumari-emerald-kalidar-lehenga",
      description:
        "Deep forest emerald silk brocade crafted with 24 tiered kalis, antique marodi border work, and an embroidered velvet choli.",
      story:
        "Inspired by Rajasthani royal wedding archives, the borders feature hand-beaten gold leaf appliqués.",
      fabric: "Heritage Brocade Silk with Antique Marodi & Zari",
      basePrice: 36000,
      categoryId: catLehengas.id,
      featured: false,
      images: [
        {
          url: "/products/lehenga_emerald_green.jpg",
          altText: "Rajkumari Kalidar Lehenga in Royal Emerald",
          color: "Royal Emerald",
          order: 0,
          isPrimary: true,
        },
      ],
      variants: [
        { color: "Royal Emerald", colorHex: "#0D3822", size: "S", sku: "ZR-RKL-EMR-S", stock: 3 },
        { color: "Royal Emerald", colorHex: "#0D3822", size: "M", sku: "ZR-RKL-EMR-M", stock: 4 },
        { color: "Royal Emerald", colorHex: "#0D3822", size: "L", sku: "ZR-RKL-EMR-L", stock: 2 },
        { color: "Royal Emerald", colorHex: "#0D3822", size: "XL", sku: "ZR-RKL-EMR-XL", stock: 1 },
      ],
    },
    {
      name: "The Shikargah Antique Banarasi Saree",
      slug: "shikargah-antique-banarasi-saree",
      description:
        "Museum-grade pure silk Banarasi saree exhibiting the legendary Shikargah weave — depicting royal hunting fauna, flora, and galloping deer in liquid silver and gold kadhwa zari.",
      story:
        "Taking over three months on jacquard pit looms, Shikargah is considered the crown jewel of Varanasi weaving.",
      fabric: "Pure Handspun Mulberry Silk with Certified Tested Zari",
      basePrice: 24000,
      categoryId: catSarees.id,
      featured: true,
      images: [
        {
          url: "/products/saree_shikargah_wine.jpg",
          altText: "Shikargah Banarasi Saree in Midnight Wine",
          color: "Midnight Wine",
          order: 0,
          isPrimary: true,
        },
      ],
      variants: [
        { color: "Midnight Wine", colorHex: "#3B0813", size: "Free Size", sku: "ZR-SKS-WIN-FS", stock: 4 },
        { color: "Antique Bronze", colorHex: "#8C6239", size: "Free Size", sku: "ZR-SKS-BRZ-FS", stock: 2 },
      ],
    },
    {
      name: "The Chandrika Organza Tissue Saree",
      slug: "chandrika-organza-tissue-saree",
      description:
        "Subtle rose-gold metallic organza saree finished with hand-scalloped pearl borders, cutwork lace pallu, and unstitched brocade blouse fabric.",
      story:
        "An ultra-modern interpretation of vintage royalty, reflecting gentle candlelight in evening settings.",
      fabric: "Rose Gold Metallic Organza Silk with Pearl Scallops",
      basePrice: 13500,
      categoryId: catSarees.id,
      featured: false,
      images: [
        {
          url: "/products/saree_chandrika_rose_gold.jpg",
          altText: "Chandrika Organza Saree in Rose Gold",
          color: "Rose Gold",
          order: 0,
          isPrimary: true,
        },
      ],
      variants: [
        { color: "Rose Gold", colorHex: "#B76E79", size: "Free Size", sku: "ZR-COS-RSG-FS", stock: 6 },
        { color: "Champagne Shimmer", colorHex: "#E7D3A6", size: "Free Size", sku: "ZR-COS-CHP-FS", stock: 3 },
      ],
    },
    {
      name: "The Mumtaz Mahal Angrakha Suit",
      slug: "mumtaz-mahal-angrakha-suit",
      description:
        "Cross-over angrakha silhouette in dusty cedar rose georgette, accented with dabka embroidery along the neckline, hand-knotted pearl latkans, and a crinkled silk sharara.",
      story:
        "Tailored to recall the court garments of Agra, each latkan is assembled bead by bead by women artisans.",
      fabric: "Pure Viscose Georgette with Pure Silk Lining",
      basePrice: 16500,
      categoryId: catAnarkalis.id,
      featured: true,
      images: [
        {
          url: "/products/anarkali_ivory.jpg",
          altText: "Mumtaz Mahal Angrakha Suit in Dusty Cedar",
          color: "Dust Cedar",
          order: 0,
          isPrimary: true,
        },
      ],
      variants: [
        { color: "Dust Cedar", colorHex: "#A05A61", size: "XS", sku: "ZR-MMA-DCS-XS", stock: 3 },
        { color: "Dust Cedar", colorHex: "#A05A61", size: "S", sku: "ZR-MMA-DCS-S", stock: 5 },
        { color: "Dust Cedar", colorHex: "#A05A61", size: "M", sku: "ZR-MMA-DCS-M", stock: 4 },
        { color: "Dust Cedar", colorHex: "#A05A61", size: "L", sku: "ZR-MMA-DCS-L", stock: 2 },
      ],
    },
    {
      name: "The Badshah Begum Velvet Peshwas",
      slug: "badshah-begum-velvet-peshwas",
      description:
        "Heavy mulberry silk velvet long tunic featuring high side slits, antique tilla threadwork, and an intricate bullion fringe hemline.",
      story:
        "Peshwas silhouettes date back to imperial Awadh, offering regal stature and warm winter elegance.",
      fabric: "Heavy Silk Velvet with Gilded Tilla Work",
      basePrice: 22000,
      categoryId: catAnarkalis.id,
      featured: false,
      images: [
        {
          url: "/products/saree_shikargah_wine.jpg",
          altText: "Badshah Begum Velvet Peshwas in Royal Plum",
          color: "Royal Plum",
          order: 0,
          isPrimary: true,
        },
      ],
      variants: [
        { color: "Royal Plum", colorHex: "#351229", size: "S", sku: "ZR-BBP-PLM-S", stock: 3 },
        { color: "Royal Plum", colorHex: "#351229", size: "M", sku: "ZR-BBP-PLM-M", stock: 4 },
        { color: "Royal Plum", colorHex: "#351229", size: "L", sku: "ZR-BBP-PLM-L", stock: 2 },
      ],
    },
    {
      name: "The Ruhaniyat Silk Sharara Set",
      slug: "ruhaniyat-silk-sharara-set",
      description:
        "Short tailored silk kurta with gota patti neck embroidery, paired with a flared tiered sharara and a gold-speckled organza dupatta.",
      story:
        "Designed for effortless sangeet celebrations, the tiered sharara has 8 meters of dramatic flare.",
      fabric: "Handloom Tussar Silk with Chiffon Sharara",
      basePrice: 12800,
      categoryId: catPret.id,
      featured: true,
      images: [
        {
          url: "/products/pret_saffron_kurta.jpg",
          altText: "Ruhaniyat Silk Sharara Set in Saffron Turmeric",
          color: "Saffron Turmeric",
          order: 0,
          isPrimary: true,
        },
      ],
      variants: [
        { color: "Saffron Turmeric", colorHex: "#D98E1A", size: "S", sku: "ZR-RSS-TRM-S", stock: 5 },
        { color: "Saffron Turmeric", colorHex: "#D98E1A", size: "M", sku: "ZR-RSS-TRM-M", stock: 6 },
        { color: "Saffron Turmeric", colorHex: "#D98E1A", size: "L", sku: "ZR-RSS-TRM-L", stock: 3 },
      ],
    },
    {
      name: "The Niloufer Tussar Silk Co-ord",
      slug: "niloufer-tussar-silk-coord",
      description:
        "A contemporary fusion ensemble featuring a relaxed asymmetric silk tunic, tailored cigarette trousers, and a handcrafted metallic cord belt.",
      story:
        "Blending heritage handloom texture with sharp modern tailoring for the modern Indian connoisseur.",
      fabric: "100% Wild Tussar Handloom Silk",
      basePrice: 9600,
      categoryId: catPret.id,
      featured: false,
      images: [
        {
          url: "/products/lehenga_ivory_organza.jpg",
          altText: "Niloufer Tussar Silk Co-ord in Powder Blue",
          color: "Powder Blue",
          order: 0,
          isPrimary: true,
        },
      ],
      variants: [
        { color: "Powder Blue", colorHex: "#7D9BB3", size: "XS", sku: "ZR-NTC-BLU-XS", stock: 4 },
        { color: "Powder Blue", colorHex: "#7D9BB3", size: "S", sku: "ZR-NTC-BLU-S", stock: 5 },
        { color: "Powder Blue", colorHex: "#7D9BB3", size: "M", sku: "ZR-NTC-BLU-M", stock: 4 },
        { color: "Powder Blue", colorHex: "#7D9BB3", size: "L", sku: "ZR-NTC-BLU-L", stock: 2 },
      ],
    },
    {
      name: "The Jodhpur Bandhgala Jacket",
      slug: "jodhpur-bandhgala-jacket",
      description:
        "Structured royal Bandhgala jacket cut from deep obsidian raw silk with tailored shoulder definition, hand-enameled crested buttons, and a pocket square.",
      story:
        "First tailored in the royal court of Jodhpur, this clean masculine silhouette represents modern Indian formalwear at its finest.",
      fabric: "Structured Raw Silk with Pure Cupro Lining",
      basePrice: 18500,
      categoryId: catMenswear.id,
      featured: true,
      images: [
        {
          url: "/products/menswear_bandhgala.jpg",
          altText: "Jodhpur Bandhgala in Obsidian Black",
          color: "Obsidian Black",
          order: 0,
          isPrimary: true,
        },
      ],
      variants: [
        { color: "Obsidian Black", colorHex: "#111111", size: "38", sku: "ZR-JBG-BLK-38", stock: 4 },
        { color: "Obsidian Black", colorHex: "#111111", size: "40", sku: "ZR-JBG-BLK-40", stock: 5 },
        { color: "Obsidian Black", colorHex: "#111111", size: "42", sku: "ZR-JBG-BLK-42", stock: 3 },
        { color: "Obsidian Black", colorHex: "#111111", size: "44", sku: "ZR-JBG-BLK-44", stock: 2 },
      ],
    },
    {
      name: "The Shahi Jamawar Silk Kurta & Bundi",
      slug: "shahi-jamawar-silk-kurta-bundi",
      description:
        "Pure raw silk kurta in antique sand paired with a woven Jamawar Nehru jacket (bundi) featuring Kashmiri paisley tapestries.",
      story:
        "Jamawar weaving takes its name from ancient royal robes woven for emperors across the Himalayas.",
      fabric: "Raw Silk Kurta with Jacquard Jamawar Bundi",
      basePrice: 15200,
      categoryId: catMenswear.id,
      featured: false,
      images: [
        {
          url: "/products/menswear_kurta_bundi.jpg",
          altText: "Shahi Jamawar Silk Kurta and Bundi",
          color: "Antique Sand & Ruby",
          order: 0,
          isPrimary: true,
        },
      ],
      variants: [
        { color: "Antique Sand & Ruby", colorHex: "#DDD2BF", size: "38", sku: "ZR-SJK-SND-38", stock: 3 },
        { color: "Antique Sand & Ruby", colorHex: "#DDD2BF", size: "40", sku: "ZR-SJK-SND-40", stock: 4 },
        { color: "Antique Sand & Ruby", colorHex: "#DDD2BF", size: "42", sku: "ZR-SJK-SND-42", stock: 2 },
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
