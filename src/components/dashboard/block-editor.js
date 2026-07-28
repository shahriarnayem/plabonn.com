"use client";

import { Icon } from "@/components/icon";

const blockTypes = ["heading", "paragraph", "image", "quote", "list", "button", "code", "stats", "twoColumn", "gallery", "cta"];

function newBlock(type = "paragraph") {
  const dataByType = {
    heading: { text: "New heading", level: 2 },
    paragraph: { text: "Write your paragraph here." },
    image: { url: "", alt: "", caption: "" },
    quote: { text: "", cite: "" },
    list: { items: ["First item", "Second item"], ordered: false },
    button: { text: "Learn more", url: "/contact" },
    code: { code: "", language: "javascript" },
    stats: { items: [{ value: "100+", label: "Projects" }] },
    twoColumn: { leftTitle: "Left title", leftText: "Left content", rightTitle: "Right title", rightText: "Right content" },
    gallery: { images: [] },
    cta: { heading: "Ready to start?", text: "Tell us about your project.", buttonText: "Contact us", buttonUrl: "/contact" },
  };
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type, data: dataByType[type] || {} };
}

export function BlockEditor({ value = [], onChange }) {
  const blocks = Array.isArray(value) ? value : [];

  function update(index, nextBlock) {
    const next = [...blocks];
    next[index] = nextBlock;
    onChange(next);
  }

  function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index) {
    onChange(blocks.filter((_, blockIndex) => blockIndex !== index));
  }

  return (
    <div className="block-editor">
      <div className="block-editor-toolbar"><span>{blocks.length} blocks</span><button type="button" className="button button-secondary" onClick={() => onChange([...blocks, newBlock()])}><Icon name="plus" size={15}/>Add block</button></div>
      {blocks.length === 0 ? <div className="dashboard-empty"><p>No blocks yet. Add the first content block.</p></div> : null}
      {blocks.map((block, index) => <div className="block-editor-item" key={block.id || index}>
        <div className="block-editor-item-head">
          <select value={block.type} onChange={(event) => update(index, newBlock(event.target.value))}>{blockTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select>
          <div><button type="button" className="icon-button" onClick={() => move(index, -1)} aria-label="Move block up">↑</button><button type="button" className="icon-button" onClick={() => move(index, 1)} aria-label="Move block down">↓</button><button type="button" className="icon-button danger" onClick={() => remove(index)} aria-label="Remove block"><Icon name="trash" size={15}/></button></div>
        </div>
        <BlockFields block={block} onChange={(data) => update(index, { ...block, data })} />
      </div>)}
    </div>
  );
}

function Field({ label, children }) { return <label className="dashboard-field"><span>{label}</span>{children}</label>; }

function BlockFields({ block, onChange }) {
  const data = block.data || {};
  const set = (name, value) => onChange({ ...data, [name]: value });
  switch (block.type) {
    case "heading": return <div className="inline-fields"><Field label="Heading"><input value={data.text || ""} onChange={(e) => set("text", e.target.value)} /></Field><Field label="Level"><select value={data.level || 2} onChange={(e) => set("level", Number(e.target.value))}><option value="2">H2</option><option value="3">H3</option><option value="4">H4</option></select></Field></div>;
    case "paragraph": return <Field label="Paragraph"><textarea rows="5" value={data.text || ""} onChange={(e) => set("text", e.target.value)} /></Field>;
    case "image": return <div className="form-grid"><Field label="Image URL"><input value={data.url || ""} onChange={(e) => set("url", e.target.value)} /></Field><Field label="Alt text"><input value={data.alt || ""} onChange={(e) => set("alt", e.target.value)} /></Field><Field label="Caption"><input value={data.caption || ""} onChange={(e) => set("caption", e.target.value)} /></Field></div>;
    case "quote": return <div className="form-grid"><Field label="Quote"><textarea rows="4" value={data.text || ""} onChange={(e) => set("text", e.target.value)} /></Field><Field label="Citation"><input value={data.cite || ""} onChange={(e) => set("cite", e.target.value)} /></Field></div>;
    case "list": return <div className="form-grid"><Field label="Items, one per line"><textarea rows="5" value={(data.items || []).join("\n")} onChange={(e) => set("items", e.target.value.split("\n").filter(Boolean))} /></Field><label className="checkbox-field"><input type="checkbox" checked={Boolean(data.ordered)} onChange={(e) => set("ordered", e.target.checked)} /><span>Numbered list</span></label></div>;
    case "button": return <div className="form-grid"><Field label="Button text"><input value={data.text || ""} onChange={(e) => set("text", e.target.value)} /></Field><Field label="Button URL"><input value={data.url || ""} onChange={(e) => set("url", e.target.value)} /></Field></div>;
    case "code": return <div className="form-grid"><Field label="Language"><input value={data.language || ""} onChange={(e) => set("language", e.target.value)} /></Field><Field label="Code"><textarea className="code-input" rows="8" value={data.code || ""} onChange={(e) => set("code", e.target.value)} /></Field></div>;
    case "stats": return <Field label="Statistics (one per line: value | label)"><textarea rows="5" value={(data.items || []).map((item) => `${item.value} | ${item.label}`).join("\n")} onChange={(e) => set("items", e.target.value.split("\n").filter(Boolean).map((line) => { const [value, label] = line.split("|"); return { value: value?.trim() || "", label: label?.trim() || "" }; }))} /></Field>;
    case "twoColumn": return <div className="form-grid"><Field label="Left title"><input value={data.leftTitle || ""} onChange={(e) => set("leftTitle", e.target.value)} /></Field><Field label="Right title"><input value={data.rightTitle || ""} onChange={(e) => set("rightTitle", e.target.value)} /></Field><Field label="Left text"><textarea rows="4" value={data.leftText || ""} onChange={(e) => set("leftText", e.target.value)} /></Field><Field label="Right text"><textarea rows="4" value={data.rightText || ""} onChange={(e) => set("rightText", e.target.value)} /></Field></div>;
    case "gallery": return <Field label="Image URLs, one per line"><textarea rows="6" value={(data.images || []).join("\n")} onChange={(e) => set("images", e.target.value.split("\n").filter(Boolean))} /></Field>;
    case "cta": return <div className="form-grid"><Field label="Heading"><input value={data.heading || ""} onChange={(e) => set("heading", e.target.value)} /></Field><Field label="Text"><textarea rows="3" value={data.text || ""} onChange={(e) => set("text", e.target.value)} /></Field><Field label="Button text"><input value={data.buttonText || ""} onChange={(e) => set("buttonText", e.target.value)} /></Field><Field label="Button URL"><input value={data.buttonUrl || ""} onChange={(e) => set("buttonUrl", e.target.value)} /></Field></div>;
    default: return null;
  }
}
