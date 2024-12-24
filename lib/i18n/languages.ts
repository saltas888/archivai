export const languages = [
    { label: "English", code: "en" },
    { label: "Ελληνικά", code: "el" },
  ] as const;
  
  export type LanguageCode = typeof languages[number]["code"];