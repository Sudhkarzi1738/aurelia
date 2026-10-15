import { hero, editorial, testimonials } from "@/lib/static-html";
import { Collections } from "@/components/Collections";
import { ShopByCategory } from "@/components/CategorySection";
import { Newsletter } from "@/components/Newsletter";
import { SiteFooter } from "@/components/SiteFooter";

const Html = ({ html }: { html: string }) => (
  <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: html }} />
);

export default function Home() {
  return (
    <>
      <Html html={hero} />
      <ShopByCategory />
      <Collections />
      <Html html={editorial} />
      <Html html={testimonials} />
      <Newsletter />
      <SiteFooter />
    </>
  );
}
