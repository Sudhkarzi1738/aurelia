export type Category = "necklace" | "bracelet" | "ring" | "earrings" | "headpiece";

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: Category;
  tag: string;
  material?: string;
  priceInr: number;
  image: string;
  imageVerified: boolean;
  specsVerified: boolean;
  needsSize?: boolean;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  necklace: "Necklaces",
  bracelet: "Bracelets",
  ring: "Rings",
  earrings: "Earrings",
  headpiece: "Bridal & Hair",
};

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export function displayProductName(name: string, max = 48): string {
  if (name.length <= max) return name;
  const cut = name.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return (sp > 20 ? cut.slice(0, sp) : cut).trimEnd() + "…";
}

export const RING_SIZES = ["5", "6", "7", "8", "9", "10", "11", "12", "Adjustable"] as const;

export const products: Product[] = [
  { id: "necklace-layered", sku: "AUR-NEC-001", name: "Layered Gold Chains with Baroque Pearl", category: "necklace", tag: "Best Seller", material: "Gold-plated · pearl", priceInr: 42000, image: "/assets/necklace-pearl.webp", imageVerified: true, specsVerified: false },
  { id: "necklace-mesh", sku: "AUR-NEC-002", name: "Delicate Mesh Designer Pendant — Garnet Drop", category: "necklace", tag: "New", material: "Gold-tone · garnet", priceInr: 28500, image: "/assets/necklace-mesh.webp", imageVerified: true, specsVerified: false },
  { id: "necklace-mangalsutra", sku: "AUR-NEC-003", name: "Classic Elegance 9kt Gold Mangalsutra", category: "necklace", tag: "Classic", material: "9kt gold", priceInr: 36900, image: "/assets/necklace-mangalsutra.webp", imageVerified: true, specsVerified: false },
  { id: "necklace-choker", sku: "AUR-NEC-004", name: "Maharani Diamond & Sapphire Choker", category: "necklace", tag: "High Jewellery", material: "18K gold · diamonds · sapphire", priceInr: 840000, image: "/assets/necklace-choker.webp", imageVerified: true, specsVerified: false },
  { id: "necklace-traditional", sku: "AUR-NEC-005", name: "Traditional Rajwadi Necklace Set", category: "necklace", tag: "Heritage", material: "Gold-plated · heritage set", priceInr: 115000, image: "/assets/necklace-traditional.webp", imageVerified: true, specsVerified: false },
  { id: "necklace-kundan", sku: "AUR-NEC-006", name: "Handmade Kundan Bridal Necklace Set", category: "necklace", tag: "Bridal", material: "Kundan · gold-tone", priceInr: 260000, image: "/assets/necklace-kundan.webp", imageVerified: true, specsVerified: false },
  { id: "necklace-polki", sku: "AUR-NEC-007", name: "Pink Polki Bridal Necklace — Rose Quartz", category: "necklace", tag: "Bridal", material: "Polki · rose quartz", priceInr: 195000, image: "/assets/necklace-polki.webp", imageVerified: true, specsVerified: false },
  { id: "necklace-temple", sku: "AUR-NEC-008", name: "Traditional Temple Design Necklace Set", category: "necklace", tag: "Temple", material: "Temple · gold-tone", priceInr: 88000, image: "/assets/necklace-temple.webp", imageVerified: true, specsVerified: false },
  { id: "necklace-pearl", sku: "AUR-NEC-009", name: "Elegant Pearl Necklace Set for Women", category: "necklace", tag: "Pearls", material: "Pearl · gold-tone", priceInr: 54000, image: "/assets/necklace-pearl.webp", imageVerified: true, specsVerified: false },
  { id: "necklace-peacock", sku: "AUR-NEC-010", name: "Peacock Pendant Pearl Mala", category: "necklace", tag: "Heritage", material: "Pearl · gold-tone", priceInr: 98000, image: "/assets/necklace-peacock.webp", imageVerified: true, specsVerified: false },
  { id: "bracelet-kundan", sku: "AUR-BRA-001", name: "Bridal Kundan Bangles Set — Antique Gold", category: "bracelet", tag: "Bridal", material: "Kundan · antique gold-tone", priceInr: 64000, image: "/assets/bracelet-kundan.webp", imageVerified: true, specsVerified: false },
  { id: "bracelet-hathphool", sku: "AUR-BRA-002", name: "Bridal Haath Phool Hand Harness", category: "bracelet", tag: "Bridal", material: "Gold-plated", priceInr: 46000, image: "/assets/bracelet-hathphool.webp", imageVerified: true, specsVerified: false },
  { id: "bracelet-wave", sku: "AUR-BRA-003", name: "Wave Gold Cuff Bracelet", category: "bracelet", tag: "Minimal", material: "Gold-tone cuff", priceInr: 32000, image: "/assets/bracelet-wave.webp", imageVerified: true, specsVerified: false },
  { id: "bracelet-panja", sku: "AUR-BRA-004", name: "Rajawadi Hath Panja — Gold Plated", category: "bracelet", tag: "Heritage", material: "Gold-plated", priceInr: 38500, image: "/assets/bracelet-panja.webp", imageVerified: true, specsVerified: false },
  { id: "bracelet-kada", sku: "AUR-BRA-005", name: "18K Gold Plated Men's Kada Bracelet", category: "bracelet", tag: "Gents", material: "18K gold plated", priceInr: 29000, image: "/assets/bracelet-kada.webp", imageVerified: true, specsVerified: false },
  { id: "bracelet-diamond", sku: "AUR-BRA-006", name: "Mixed-Shape Diamond Bracelet, 14K", category: "bracelet", tag: "Diamond", material: "14K gold · diamonds", priceInr: 675000, image: "/assets/bracelet-diamond.webp", imageVerified: true, specsVerified: false },
  { id: "bracelet-cuff", sku: "AUR-BRA-007", name: "Isabella Gold Cuff", category: "bracelet", tag: "Stack", material: "Gold-tone", priceInr: 41000, image: "/assets/bracelet-cuff.webp", imageVerified: true, specsVerified: false },
  { id: "bracelet-tennis", sku: "AUR-BRA-008", name: "Diamond Tennis Bracelet in 14K White Gold", category: "bracelet", tag: "Iconic", material: "14K white gold · diamonds", priceInr: 320000, image: "/assets/bracelet-tennis.webp", imageVerified: true, specsVerified: false },
  { id: "bracelet-hira", sku: "AUR-BRA-009", name: "Hira Kundan Hand Harness with Pearls", category: "bracelet", tag: "Kundan", material: "Kundan · pearls", priceInr: 52000, image: "/assets/bracelet-hira.webp", imageVerified: true, specsVerified: false },
  { id: "bracelet-bridal", sku: "AUR-BRA-010", name: "Complete Bridal Hand Adornment", category: "bracelet", tag: "Bridal", material: "Bridal set · gold-tone", priceInr: 78000, image: "/assets/bracelet-bridal.webp", imageVerified: true, specsVerified: false },
  { id: "ring-signet", sku: "AUR-RNG-001", name: "Men's 9ct Gold Embossed Signet Ring", category: "ring", tag: "Gents", material: "9ct gold", priceInr: 26000, image: "/assets/ring-signet.webp", imageVerified: true, specsVerified: false, needsSize: true },
  { id: "ring-initial", sku: "AUR-RNG-002", name: "Clara 925 Silver Initial Ring — Pavé", category: "ring", tag: "Personal", material: "925 silver", priceInr: 9800, image: "/assets/ring-initial.webp", imageVerified: true, specsVerified: false, needsSize: true },
  { id: "ring-gemmy", sku: "AUR-RNG-003", name: "No-Heat Ruby, Diamond & Sapphire Gypsy Ring", category: "ring", tag: "Rare", material: "Fine jewellery · gemstones", priceInr: 490000, image: "/assets/ring-gemmy.webp", imageVerified: true, specsVerified: false, needsSize: true },
  { id: "ring-wedding", sku: "AUR-RNG-004", name: "Platinum Wedding Band Pair", category: "ring", tag: "Wedding", material: "Platinum", priceInr: 88000, image: "/assets/ring-wedding.webp", imageVerified: true, specsVerified: false, needsSize: true },
  { id: "ring-eternity", sku: "AUR-RNG-005", name: "Diamond Eternity Band — Emerald & Round Cuts", category: "ring", tag: "Iconic", material: "Diamonds", priceInr: 145000, image: "/assets/ring-eternity.webp", imageVerified: true, specsVerified: false, needsSize: true },
  { id: "ring-stack", sku: "AUR-RNG-006", name: "Rose Gold Stacking Ring Set", category: "ring", tag: "Trend", material: "Rose gold-tone", priceInr: 18500, image: "/assets/ring-stack.webp", imageVerified: true, specsVerified: false, needsSize: true },
  { id: "ring-toeset", sku: "AUR-RNG-007", name: "Sterling Silver Toe Ring Ensemble", category: "ring", tag: "Set of 6", material: "925 silver", priceInr: 12000, image: "/assets/ring-toeset.webp", imageVerified: true, specsVerified: false, needsSize: true },
  { id: "ring-floral", sku: "AUR-RNG-008", name: "Antique Ethnic Floral Statement Ring", category: "ring", tag: "Heritage", material: "Gold-tone", priceInr: 21000, image: "/assets/ring-floral.webp", imageVerified: true, specsVerified: false, needsSize: true },
  { id: "ring-band", sku: "AUR-RNG-009", name: "Emerald-Cut Diamond Eternity Band, 18K", category: "ring", tag: "High Jewellery", material: "18K gold · diamonds", priceInr: 285000, image: "/assets/ring-band.webp", imageVerified: true, specsVerified: false, needsSize: true },
  { id: "ring-toe", sku: "AUR-RNG-010", name: "Tallulah Toe Rings — Handmade", category: "ring", tag: "Artisan", material: "Artisan · adjustable", priceInr: 8200, image: "/assets/ring-toe.webp", imageVerified: true, specsVerified: false, needsSize: true },
  { id: "earrings-stud", sku: "AUR-EAR-001", name: "Lab-Grown Diamond Stud Trio — Gold & Rose", category: "earrings", tag: "Diamond", material: "Lab-grown diamonds · gold-tone", priceInr: 68000, image: "/assets/earrings-stud.webp", imageVerified: true, specsVerified: false },
  { id: "earrings-temple", sku: "AUR-EAR-002", name: "South Temple Kemp & Pearl Jhumkas", category: "earrings", tag: "Temple", material: "Kemp · pearl", priceInr: 34000, image: "/assets/earrings-temple.webp", imageVerified: true, specsVerified: false },
  { id: "earrings-chandbali", sku: "AUR-EAR-003", name: "Luxurious Gold-Plated Chandbali Earrings", category: "earrings", tag: "Bridal", material: "Gold-plated", priceInr: 42500, image: "/assets/earrings-chandbali.webp", imageVerified: true, specsVerified: false },
  { id: "earrings-angel", sku: "AUR-EAR-004", name: "925 Silver Angel Wing Stud Earrings", category: "earrings", tag: "Silver", material: "925 silver", priceInr: 7900, image: "/assets/earrings-angel.webp", imageVerified: true, specsVerified: false },
  { id: "earrings-huggie", sku: "AUR-EAR-005", name: "Diamond Huggie Hoops — 14K", category: "earrings", tag: "14K", material: "14K gold · diamonds", priceInr: 96000, image: "/assets/earrings-huggie.webp", imageVerified: true, specsVerified: false },
  { id: "earrings-jhumka", sku: "AUR-EAR-006", name: "Filigree Jhumka Earrings — Gold Plated", category: "earrings", tag: "Filigree", material: "Gold-plated", priceInr: 19500, image: "/assets/earrings-jhumka.webp", imageVerified: true, specsVerified: false },
  { id: "earrings-cuff", sku: "AUR-EAR-007", name: "Gold Ear Cuff", category: "earrings", tag: "Trend", material: "Gold-tone", priceInr: 14000, image: "/assets/earrings-cuff.webp", imageVerified: true, specsVerified: false },
  { id: "earrings-bali", sku: "AUR-EAR-008", name: "Bali Hoops — 22K 916 Gold", category: "earrings", tag: "22K", material: "22K 916 gold", priceInr: 58000, image: "/assets/earrings-bali.webp", imageVerified: true, specsVerified: false },
  { id: "earrings-climber", sku: "AUR-EAR-009", name: "Sterling Silver Ear Climber Earrings", category: "earrings", tag: "Minimal", material: "925 silver", priceInr: 8900, image: "/assets/earrings-climber.webp", imageVerified: true, specsVerified: false },
  { id: "earrings-pearl", sku: "AUR-EAR-010", name: "Dainty Teardrop Pearl & CZ Drop Earrings", category: "earrings", tag: "Pearls", material: "Pearl · CZ", priceInr: 16500, image: "/assets/earrings-pearl.webp", imageVerified: true, specsVerified: false },
  { id: "headpiece-mathapatti", sku: "AUR-HDP-001", name: "Pearl Sheeshphool Matha Patti Headpiece", category: "headpiece", tag: "Bridal", material: "Pearl · gold-tone", priceInr: 72000, image: "/assets/headpiece-mathapatti.webp", imageVerified: true, specsVerified: false },
  { id: "headpiece-nandini", sku: "AUR-HDP-002", name: "Nandini Gaja Lakshmi Hair Brooch — 22K", category: "headpiece", tag: "Temple", material: "22K gold", priceInr: 125000, image: "/assets/headpiece-nandini.webp", imageVerified: true, specsVerified: false },
  { id: "headpiece-chain", sku: "AUR-HDP-003", name: "Draped Pearl Hair Chain", category: "headpiece", tag: "Hair Chain", material: "Pearl", priceInr: 48000, image: "/assets/headpiece-chain.webp", imageVerified: true, specsVerified: false },
  { id: "headpiece-borla", sku: "AUR-HDP-004", name: "22K Yellow Gold Rajasthani Borla", category: "headpiece", tag: "Rajasthani", material: "22K gold", priceInr: 94000, image: "/assets/headpiece-borla.webp", imageVerified: true, specsVerified: false },
  { id: "headpiece-juda", sku: "AUR-HDP-005", name: "Juda Pin Hair Bun Cage — Gold Plated", category: "headpiece", tag: "Heritage", material: "Gold-plated", priceInr: 39000, image: "/assets/headpiece-juda.webp", imageVerified: true, specsVerified: false },
  { id: "headpiece-maangtikka", sku: "AUR-HDP-006", name: "Gold Plated Maang Tikka — Matha Patti", category: "headpiece", tag: "Bridal", material: "Gold-plated", priceInr: 55000, image: "/assets/headpiece-maangtikka.webp", imageVerified: true, specsVerified: false },
  { id: "headpiece-jhoomar", sku: "AUR-HDP-007", name: "White Jhoomar Passa with Pearls", category: "headpiece", tag: "Passa", material: "Pearl", priceInr: 44000, image: "/assets/headpiece-jhoomar.webp", imageVerified: true, specsVerified: false },
  { id: "headpiece-floral", sku: "AUR-HDP-008", name: "Bridal Kundan Flower Crown", category: "headpiece", tag: "Floral", material: "Kundan", priceInr: 36500, image: "/assets/headpiece-floral.webp", imageVerified: true, specsVerified: false },
  { id: "headpiece-draped", sku: "AUR-HDP-009", name: "Draped Bridal Hair Chain", category: "headpiece", tag: "Bridal", material: "Bridal hair chain", priceInr: 51000, image: "/assets/headpiece-draped.webp", imageVerified: true, specsVerified: false },
  { id: "headpiece-comb", sku: "AUR-HDP-010", name: "Golden Bridal Hair Comb Set with Pearls", category: "headpiece", tag: "Set", material: "Pearl · gold-tone", priceInr: 29500, image: "/assets/headpiece-comb.webp", imageVerified: true, specsVerified: false },
];
