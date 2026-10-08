/**
 * Легкий перелік сторінок послуг (адреса + коротка назва) — для меню, футера й форми заявки.
 * Повні тексти сторінок — у services.ts (лише для сервера).
 */

export const SERVICES_PATH = "/poslugy";
export const serviceHref = (slug: string) => `${SERVICES_PATH}/${slug}`;

export const serviceNav = [
  { slug: "bukhhalterskyi-autsorsynh", nav: "Аутсорсинг і супровід" },
  { slug: "bukhhalteriia-dlia-fop", nav: "Бухгалтерія для ФОП" },
  { slug: "bukhhalteriia-dlia-tov", nav: "Бухгалтерія для ТОВ" },
  { slug: "podatkovyi-oblik-i-zvitnist", nav: "Податковий облік і звітність" },
  { slug: "konsultatsii-bukhhaltera", nav: "Консультації бухгалтера" },
  { slug: "vidnovlennia-obliku", nav: "Відновлення обліку" },
  { slug: "suprovid-zed", nav: "Супровід ЗЕД" },
  { slug: "kadrovyi-oblik", nav: "Кадровий облік і зарплата" },
  { slug: "internet-mahazyn", nav: "Для інтернет-магазину" },
  { slug: "malyi-ta-serednii-biznes", nav: "Малий і середній бізнес" },
] as const;

export const navOf = (slug: string) => serviceNav.find((s) => s.slug === slug)?.nav ?? slug;
