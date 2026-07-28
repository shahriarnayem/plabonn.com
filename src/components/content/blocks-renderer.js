import Link from "next/link";
import { Icon } from "@/components/icon";

export function BlocksRenderer({ blocks = [] }) {
  if (!Array.isArray(blocks)) return null;
  return (
    <div className="blocks-renderer">
      {blocks.map((block, index) => {
        const data = block?.data || {};
        const key = block.id || `${block.type}-${index}`;
        switch (block.type) {
          case "heading": {
            const level = Math.min(4, Math.max(2, Number(data.level) || 2));
            const Heading = `h${level}`;
            return <Heading key={key}>{data.text}</Heading>;
          }
          case "paragraph":
            return <p key={key}>{data.text}</p>;
          case "quote":
            return <blockquote key={key}>{data.text}{data.cite ? <cite>{data.cite}</cite> : null}</blockquote>;
          case "list": {
            const items = Array.isArray(data.items) ? data.items : String(data.items || "").split("\n").filter(Boolean);
            const List = data.ordered ? "ol" : "ul";
            return <List key={key}>{items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{item}</li>)}</List>;
          }
          case "image":
            return <figure key={key}><img src={data.url} alt={data.alt || ""} width={data.width || 1200} height={data.height || 800} loading="lazy" />{data.caption ? <figcaption>{data.caption}</figcaption> : null}</figure>;
          case "button":
            return <p key={key}><Link href={data.url || "#"} className="button button-primary">{data.text || "Learn more"}<Icon name="arrow" size={15} /></Link></p>;
          case "code":
            return <pre key={key}><code>{data.code}</code></pre>;
          case "stats":
            return <div key={key} className="block-stats">{(data.items || []).map((item, itemIndex) => <div key={`${item.label}-${itemIndex}`}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>;
          case "twoColumn":
            return <div key={key} className="block-columns"><div><h3>{data.leftTitle}</h3><p>{data.leftText}</p></div><div><h3>{data.rightTitle}</h3><p>{data.rightText}</p></div></div>;
          case "gallery":
            return <div key={key} className="block-gallery">{(data.images || []).map((image, imageIndex) => <img key={`${image}-${imageIndex}`} src={image} alt="" width="800" height="600" loading="lazy" />)}</div>;
          case "cta":
            return <aside key={key} className="block-cta"><div><h2>{data.heading}</h2><p>{data.text}</p></div><Link className="button button-light" href={data.buttonUrl || "/contact"}>{data.buttonText || "Contact me"}<Icon name="arrow" size={15} /></Link></aside>;
          default:
            return null;
        }
      })}
    </div>
  );
}
