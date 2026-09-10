import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STYLIST_NOTES_BY_KEYWORD: Array<{ match: string; note: string }> = [
  {
    match: "noor mahal",
    note: "Pair with antique uncut polki jewellery and an emerald organza veil to let the intricate zardozi floral vines command the pavilion.",
  },
  {
    match: "varanasi katan",
    note: "A timeless classic; pair with a contrasting deep emerald brocade blouse and fresh jasmine in your hair.",
  },
  {
    match: "mehrunnisa anarkali",
    note: "Floor-length royal grace that pairs exquisitely with emerald chandelier earrings and raw silk heels.",
  },
  {
    match: "gulrukh chanderi",
    note: "A festive daytime staple; pair with golden mojris and a crisp organza stole for pujas and celebrations.",
  },
  {
    match: "aria banarasi",
    note: "Sleek architectural elegance; pair with sculptural gold drop earrings and metallic stiletto heels for modern black-tie receptions.",
  },
  {
    match: "sitara tissue",
    note: "An arresting heirloom piece that shines brightest when framed by heirloom rubies and heritage kohl eyes.",
  },
  {
    match: "mehrunissa zardozi",
    note: "Drape with dual dupattas and antique gold jhumkas for the ultimate imperial crimson bridal statement.",
  },
  {
    match: "gul-e-bahar",
    note: "Effortless for day celebrations — complement with pearl drop jhumkas and soft rose-toned makeup.",
  },
  {
    match: "rajkumari emerald",
    note: "Style with champagne diamond solitaires and swept-back tresses for an unforgettable palace reception.",
  },
  {
    match: "shikargah",
    note: "A museum-calibre weave best accented with handcrafted temple gold and a structured vintage potli bag.",
  },
  {
    match: "chandrika organza",
    note: "Drape with sleek architectural pleats and a contemporary metallic clutch for evening gala soirées.",
  },
  {
    match: "mumtaz mahal",
    note: "An asymmetrical silhouette that shines with understated pearls and hand-embroidered velvet juttis.",
  },
  {
    match: "badshah begum",
    note: "Lends an imperial stature; complement with a velvet shawl and antique kundan passas.",
  },
  {
    match: "ruhaniyat silk",
    note: "Wear with delicate turquoise studs and a handwoven raw silk dupatta for breezy terrace soirées.",
  },
  {
    match: "niloufer tussar",
    note: "Effortlessly modern yet rooted; style with minimalist brass cuffs and tan leather mojaris.",
  },
  {
    match: "ruhani embroidered",
    note: "Empowered modern tailoring; style over an ivory slip or wide-leg silk trousers with minimalist gold ear cuffs for evening galas.",
  },
  {
    match: "zoya metallic",
    note: "Fluid evening glamour; accentuate the copper-gold sheen with champagne diamond studs and a sleek metallic box clutch.",
  },
];

async function main() {
  console.log("Populating authentic tailored stylist notes for all boutique garments...");
  const products = await prisma.product.findMany({
    select: { id: true, slug: true, name: true, category: { select: { name: true } } },
  });

  for (const p of products) {
    const lowered = (p.name + " " + p.slug).toLowerCase();
    const found = STYLIST_NOTES_BY_KEYWORD.find((item) => lowered.includes(item.match));
    const note =
      found?.note ||
      `A magnificent silhouette in ${p.category?.name || "couture"}, designed to be styled with heirloom accents and understated confidence.`;

    await prisma.product.update({
      where: { id: p.id },
      data: { stylistNote: note },
    });
    console.log(`✓ [${p.name}] -> "${note.substring(0, 60)}..."`);
  }

  console.log("\nAll stylist notes successfully populated in PostgreSQL!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
