export const storeInfoConfig = {
  shipping: {
    title: "Atelier White-Glove Shipping",
    content:
      "All commissions are shipped in insured, archival velvet-lined keepsake boxes. Orders above ₹10,000 receive complimentary express shipping. Orders below ₹10,000 incur a standard insured fee of ₹500. Typical dispatch takes 2 to 4 business days.",
  },
  returns: {
    title: "Exchange & Return Policy",
    content:
      "Due to the rare small-batch nature of our hand-embroidered silks, we offer a 7-day exchange window for unworn items with security tags and hallmark certificates intact. Bespoke bridal commissions tailored to custom measurements are final sale.",
  },
  payment: {
    title: "Payment Protocols",
    content:
      "We accept all major credit/debit cards, Net Banking, and instant UPI. Cash on Delivery (COD) is not accepted due to the high value and insured security of pure silk couture.",
  },
  craftsmanship: {
    title: "Craft & Textile Artistry",
    content:
      "Every creation is handcrafted with care. We craft with genuine Mulberry raw silk, Varanasi pure Katan, and fine metallic zari threadwork from renowned heritage textile clusters. Each piece reflects meticulous attention to detail.",
  },
  custom_fit: {
    title: "Bespoke Fitting Services",
    content:
      "We provide bespoke tailoring consultations in-house or via virtual video appointment with our master cutting specialist.",
  },
};

export function getStorePolicy(topic: string): string {
  const normalized = topic.toLowerCase().trim();
  if (normalized.includes("ship") || normalized.includes("deliver")) {
    return storeInfoConfig.shipping.content;
  }
  if (normalized.includes("return") || normalized.includes("exchange") || normalized.includes("refund")) {
    return storeInfoConfig.returns.content;
  }
  if (normalized.includes("cod") || normalized.includes("pay") || normalized.includes("card")) {
    return storeInfoConfig.payment.content;
  }
  if (normalized.includes("craft") || normalized.includes("silk") || normalized.includes("zari") || normalized.includes("authentic")) {
    return storeInfoConfig.craftsmanship.content;
  }
  if (normalized.includes("fit") || normalized.includes("tailor") || normalized.includes("measure") || normalized.includes("size")) {
    return storeInfoConfig.custom_fit.content;
  }
  return "Zaria Atelier is an Indian luxury womenswear atelier celebrating heritage craftsmanship and contemporary silhouettes, creating small-batch hand-embroidered garments with fine zari embroidery and pure silks.";
}
