"use client";

import { useState } from "react";
import { savePageSeoAction } from "@/app/admin/actions";
import { hasKeyword } from "@/lib/seo-check";
import { Field, SavedNote, SubmitButton, useFormAction } from "./ui";

type Props = {
  path: string;
  defaults: { title: string; description: string };
  value: { title?: string; description?: string; noindex?: boolean; ogTitle?: string; ogDescription?: string };
  keywords: string[];
};

/** Перевизначення Title / Description сторінки + підказка, чи є в них головний запит */
export function PageSeoForm({ path, defaults, value, keywords }: Props) {
  const { state, dispatch, pending, onSubmit } = useFormAction(savePageSeoAction);
  const [title, setTitle] = useState(value.title ?? "");
  const [desc, setDesc] = useState(value.description ?? "");
  const finalTitle = title || defaults.title;
  const finalDesc = desc || defaults.description;
  const main = keywords[0];

  return (
    <form action={dispatch} onSubmit={onSubmit} className="adm-form">
      <input type="hidden" name="path" value={path} />
      <Field label="SEO Title" hint={`Стандартний: ${defaults.title}`} counter={{ value: finalTitle.length, min: 30, max: 60 }}>
        <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={defaults.title} />
      </Field>
      <Field label="Meta Description" hint="Порожньо — стандартний опис" counter={{ value: finalDesc.length, min: 70, max: 160 }}>
        <textarea name="description" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={defaults.description} />
      </Field>
      {main && (
        <ul className="adm-checks adm-checks--sm">
          <li className={hasKeyword(finalTitle, main) ? "is-ok" : "is-off"}>
            <span aria-hidden>{hasKeyword(finalTitle, main) ? "✓" : "—"}</span>
            <span>Головний запит «{main}» у Title</span>
          </li>
          <li className={hasKeyword(finalDesc, main) ? "is-ok" : "is-off"}>
            <span aria-hidden>{hasKeyword(finalDesc, main) ? "✓" : "—"}</span>
            <span>Головний запит у Description</span>
          </li>
        </ul>
      )}
      <details className="ed-more">
        <summary>Соцмережі (Open Graph)</summary>
        <Field label="Заголовок для соцмереж">
          <input name="ogTitle" defaultValue={value.ogTitle ?? ""} placeholder={finalTitle} />
        </Field>
        <Field label="Опис для соцмереж">
          <textarea name="ogDescription" rows={2} defaultValue={value.ogDescription ?? ""} placeholder={finalDesc} />
        </Field>
      </details>
      <label className="adm-check">
        <input type="checkbox" name="noindex" defaultChecked={!!value.noindex} />
        Не індексувати сторінку (noindex)
      </label>
      <div className="adm-form__actions">
        <SubmitButton pending={pending}>Зберегти</SubmitButton>
        <SavedNote state={state} />
      </div>
    </form>
  );
}
