import { hero, editorial, testimonials } from "@/lib/static-html";
import { Collections } from "@/components/Collections";
import { CategorySection } from "@/components/CategorySection";
import { Newsletter } from "@/components/Newsletter";
import { SiteFooter } from "@/components/SiteFooter";

const Html = ({ html }: { html: string }) => (
  <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: html }} />
);

export default function Home() {
  return (
    <>
      <Html html={hero} />
      <Collections />
      <Html html={editorial} />
      <CategorySection
        id="bracelets"
        cat="bracelet"
        eyebrow="Adorned Hands"
        title="Bracelets, Bangles & Haath Phool"
        sub="From minimalist cuffs to bridal panja — grace for every wrist."
      />
      <CategorySection
        id="rings"
        cat="ring"
        alt
        eyebrow="Promises & Statements"
        title="Rings of Devotion"
        sub="Eternity bands, signets, and no-heat gemstones for fingers and toes."
      />
      <CategorySection
        id="earrings"
        cat="earrings"
        eyebrow="Frames of the Face"
        title="Earrings"
        sub="Chandbalis, jhumkas, huggies and climbers — silver whisper to gold thunder."
      />
      <CategorySection
        id="bridal"
        cat="headpiece"
        alt
        eyebrow="The Bridal Atelier"
        title="Bridal & Hair Jewellery"
        sub="Maang tikkas, passas, sheeshphools and hair chains — the crowning ritual."
      />
      <Html html={testimonials} />
      <Newsletter />
      <SiteFooter />
    </>
  );
}
