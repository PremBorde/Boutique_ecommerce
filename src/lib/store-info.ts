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
    title: "Craft & Authenticity Hallmark",
    content:
      "Every creation is certified by the Master Artisan Guild. We weave with genuine Mulberry raw silk, Varanasi pure Katan, and lab-tested gold/silver zari thread from heritage clusters all over India. Each piece takes between 80 to 350 artisan hours.",
  },
  custom_fit: {
    title: "Bespoke Fitting Services",
    content:
      "We provide bespoke tailoring consultations across all over India or via virtual video appointment with our master cutting master.",
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
  return "Zaria Atelier is an Indian luxury pret and couture house celebrating master artisan clusters all over India, creating small-batch hand-embroidered garments with certified pure zari and raw silks.";
}
