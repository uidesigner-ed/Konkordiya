/**
 * Усі контакти, посилання та цифри сайту — в одному місці.
 * Поля з позначкою TODO заповніть реальними даними.
 */

export const site = {
  name: "Конкордія",
  legalName: "КОНКОРДІЯ Бухгалтерські послуги",
  founder: "Євгенія Турковська",
  url: "https://tyrkovevgen.com.ua",
  locale: "uk_UA",

  phone: {
    display: "+38 (075) 496 62 71",
    href: "tel:+380754966271",
  },
  email: "tyrkevgen@ukr.net",
  address: {
    street: "вул. Болбочана, 52",
    city: "Харків",
    display: "м. Харків, вул. Болбочана, 52",
    postalCode: "", // TODO: індекс, якщо потрібен у schema.org
    lat: 49.9945914,
    lng: 36.2858247,
    mapUrl: "https://maps.app.goo.gl/XFNfMVwUiR7C2YrP9",
  },

  social: {
    telegram: "https://t.me/tyrkevgen",
    whatsapp: "https://wa.me/380639681987",
    instagram: "https://www.instagram.com/tyrkevgen_buh_kh",
    linkedin: "https://www.linkedin.com/in/%D1%94%D0%B2%D0%B3%D0%B5%D0%BD%D1%96%D1%8F-%D1%82%D1%83%D1%80%D0%BA%D0%BE%D0%B2%D1%81%D1%8C%D0%BA%D0%B0-557366419/",
  },

  /** Куди ведуть кнопки «Отримати консультацію», «Детальніше», «Написати» */
  consultUrl: "https://t.me/tyrkevgen",

  /** «Більше відгуків» — картка компанії в Google Maps */
  reviewsUrl:
    "https://www.google.com/maps/place/%D0%9A%D0%9E%D0%9D%D0%9A%D0%9E%D0%A0%D0%94%D0%86%D0%AF+%D0%84%D0%B2%D0%B3%D0%B5%D0%BD%D1%96%D1%8F+%D0%A2%D1%83%D1%80%D0%BA%D0%BE%D0%B2%D1%81%D1%8C%D0%BA%D0%B0/@49.9945914,36.2858247,35291m/data=!3m1!1e3!4m8!3m7!1s0x6b3b0b7b433d621b:0xd024696189bf1a34!8m2!3d49.9945914!4d36.2858247!9m1!1b1!16s%2Fg%2F11zcxf4061!5m1!1e1",

  privacyUrl: "/docs/privacy-policy.pdf",
} as const;

/**
 * Цифри для лічильників. TODO: впишіть реальні значення.
 * `value` — число, до якого рахує лічильник; `suffix` — знак після числа.
 */
export const stats = {
  clients: { value: 500, suffix: "+" }, // TODO: Клієнтів — рекомендують нас
  companies: { value: 100, suffix: "+" }, // TODO: Компаній — на супроводі
  years: { value: 21, suffix: "" }, // Рік на ринку
  fop: { value: 300, suffix: "+" }, // TODO: ФОП на супроводі
  tov: { value: 80, suffix: "+" }, // TODO: ТОВ на супроводі
  bf: { value: 20, suffix: "+" }, // TODO: БФ на супроводі
} as const;

/**
 * Команда: підписи до фото. TODO: впишіть імена та посади.
 * Якщо `people` порожній — підпис не показується.
 */
export const team: {
  src: string;
  alt: string;
  people: { name: string; role: string }[];
}[] = [
  {
    src: "/images/team-group.jpg",
    alt: "Команда «Конкордії» разом в офісі",
    people: [{ name: "Команда «Конкордії»", role: "Харків" }],
  },
  {
    src: "/images/team-archive.jpg",
    alt: "Дві співробітниці з робочими папками біля стелажа з документами",
    people: [
      { name: "Ім’я Прізвище", role: "Посада" }, // TODO
      { name: "Ім’я Прізвище", role: "Посада" }, // TODO
    ],
  },
  {
    src: "/images/team-desk.jpg",
    alt: "Дві співробітниці за робочим столом в офісі",
    people: [
      { name: "Ім’я Прізвище", role: "Посада" }, // TODO
      { name: "Ім’я Прізвище", role: "Посада" }, // TODO
    ],
  },
  {
    src: "/images/team-office.jpg",
    alt: "Дві співробітниці в офісі «Конкордії»",
    people: [
      { name: "Ім’я Прізвище", role: "Посада" }, // TODO
      { name: "Ім’я Прізвище", role: "Посада" }, // TODO
    ],
  },
  {
    src: "/images/team-shelves.jpg",
    alt: "Дві співробітниці біля стелажів з архівом",
    people: [
      { name: "Ім’я Прізвище", role: "Посада" }, // TODO
      { name: "Ім’я Прізвище", role: "Посада" }, // TODO
    ],
  },
];
