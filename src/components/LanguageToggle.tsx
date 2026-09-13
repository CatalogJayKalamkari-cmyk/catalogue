import { useLanguage } from '../lib/i18n';

export function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button className="language-toggle" onClick={toggleLang} aria-label="Toggle language">
      {lang === 'en' ? 'EN' : 'TEL'}
    </button>
  );
}
