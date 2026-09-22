import { useLanguage, LANGUAGE_LABELS, type Lang } from '../lib/i18n';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <select
      className="language-toggle"
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      aria-label="Select language"
    >
      {(Object.keys(LANGUAGE_LABELS) as Lang[]).map((code) => (
        <option key={code} value={code}>
          {LANGUAGE_LABELS[code]}
        </option>
      ))}
    </select>
  );
}
