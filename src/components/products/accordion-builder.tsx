"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugifyProductName } from "@/modules/products/dashboard-product-wizard.service";

type AccordionEntry = {
  id: string;
  title: string;
  contentType: "bullets" | "paragraphs";
  bullets: string[];
  paragraphs: string[];
};

type AccordionBuilderProps = {
  accordions: AccordionEntry[];
  onChange: (accordions: AccordionEntry[]) => void;
};

export function AccordionBuilder({ accordions, onChange }: AccordionBuilderProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"bullets" | "paragraphs">("bullets");
  const [newLine, setNewLine] = useState("");
  const [newPara, setNewPara] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  function addAccordion() {
    if (!newTitle.trim()) return;
    const id = slugifyProductName(newTitle);
    onChange([...accordions, { id, title: newTitle.toUpperCase(), contentType: newType, bullets: [], paragraphs: [] }]);
    setNewTitle("");
    setActiveId(id);
  }

  function removeAccordion(id: string) {
    onChange(accordions.filter((a) => a.id !== id));
  }

  function updateAccordion(id: string, patch: Partial<AccordionEntry>) {
    onChange(accordions.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function addBullet(accId: string) {
    if (!newLine.trim()) return;
    const acc = accordions.find((a) => a.id === accId);
    if (!acc) return;
    updateAccordion(accId, { bullets: [...acc.bullets, newLine.trim()] });
    setNewLine("");
  }

  function removeBullet(accId: string, idx: number) {
    const acc = accordions.find((a) => a.id === accId);
    if (!acc) return;
    updateAccordion(accId, { bullets: acc.bullets.filter((_, i) => i !== idx) });
  }

  function addParagraph(accId: string) {
    if (!newPara.trim()) return;
    const acc = accordions.find((a) => a.id === accId);
    if (!acc) return;
    updateAccordion(accId, { paragraphs: [...acc.paragraphs, newPara.trim()] });
    setNewPara("");
  }

  function removeParagraph(accId: string, idx: number) {
    const acc = accordions.find((a) => a.id === accId);
    if (!acc) return;
    updateAccordion(accId, { paragraphs: acc.paragraphs.filter((_, i) => i !== idx) });
  }

  return (
    <section className="rounded-md border border-border bg-card p-5">
      <h2 className="font-oswald text-lg font-semibold uppercase tracking-wide mb-4">Product Details (Accordions)</h2>
      <div className="flex items-end gap-2 mb-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-medium font-ui" htmlFor="acc-title">Title</label>
          <Input id="acc-title" placeholder="e.g. PRODUCT DETAILS" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        </div>
        <select className="h-9 rounded-md border border-input bg-transparent px-2 text-sm" value={newType} onChange={(e) => setNewType(e.target.value as "bullets" | "paragraphs")}>
          <option value="bullets">Bullets</option><option value="paragraphs">Paragraphs</option>
        </select>
        <Button type="button" size="sm" onClick={addAccordion}>Add Section</Button>
      </div>
      <div className="flex flex-col gap-3">
        {accordions.map((acc) => (
          <div key={acc.id} className="rounded-md border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-oswald text-sm font-semibold uppercase">{acc.title}</span>
              <div className="flex items-center gap-2">
                <Button type="button" size="xs" variant="outline" onClick={() => setActiveId(activeId === acc.id ? null : acc.id)}>{activeId === acc.id ? "Collapse" : "Expand"}</Button>
                <Button type="button" size="xs" variant="ghost" onClick={() => removeAccordion(acc.id)}>Remove</Button>
              </div>
            </div>
            {activeId === acc.id && (
              <div className="flex flex-col gap-3">
                {acc.contentType === "bullets" ? (
                  <>
                    <div className="flex flex-col gap-2">
                      {acc.bullets.map((line, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="flex-1 text-sm font-body">{line}</span>
                          <Button type="button" size="xs" variant="ghost" onClick={() => removeBullet(acc.id, i)}>x</Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input placeholder="Format: Label : Value" value={newLine} onChange={(e) => setNewLine(e.target.value)} />
                      <Button type="button" size="sm" onClick={() => addBullet(acc.id)}>Add</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      {acc.paragraphs.map((para, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="flex-1 text-sm font-body">{para}</span>
                          <Button type="button" size="xs" variant="ghost" onClick={() => removeParagraph(acc.id, i)}>x</Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <textarea className="min-h-16 flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm" placeholder="Enter paragraph text" value={newPara} onChange={(e) => setNewPara(e.target.value)} />
                      <Button type="button" size="sm" onClick={() => addParagraph(acc.id)}>Add</Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
        {accordions.length === 0 && <p className="text-sm text-muted-foreground">No accordion sections added yet.</p>}
      </div>
    </section>
  );
}