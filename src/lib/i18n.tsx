import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'te';

const STORAGE_KEY = 'catalogue-lang';

const translations = {
  en: {
    'common.loading': 'Loading…',
    'nav.dashboard': 'Dashboard',
    'nav.products': 'Products',
    'nav.add': '+ Add',
    'nav.logout': 'Logout',

    'catalog.title': 'Catalog',
    'catalog.search': 'Search name or code…',
    'catalog.all': 'All',
    'catalog.loading': 'Loading catalog…',
    'catalog.noProducts': 'No products found.',
    'catalog.noPhoto': 'No photo',
    'catalog.outOfStock': 'Out of Stock',
    'catalog.qty': 'Qty',

    'viewer.back': 'Back to catalog',
    'viewer.sold': 'Sold',
    'viewer.color': 'Color',

    'login.title': 'Admin Login',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.failed': 'Login failed. Check email and password.',
    'login.loggingIn': 'Logging in…',
    'login.submit': 'Log In',

    'dashboard.title': 'Dashboard',
    'dashboard.loading': 'Loading…',
    'dashboard.totalProducts': 'Total Products',
    'dashboard.quantityRemaining': 'Quantity Remaining',
    'dashboard.revenueGenerated': 'Revenue Generated',
    'dashboard.addedToday': 'Added Today',
    'dashboard.soldToday': 'Sold Today',
    'dashboard.storageUsed': 'Storage Used',
    'dashboard.failedToLoad': 'Failed to load stats',
    'error.network': 'Could not reach the server. Check your connection.',

    'products.title': 'Products',

    'row.noPhoto': 'No photo',
    'row.pricePlaceholderSelling': 'Selling',
    'row.pricePlaceholderAcquired': 'Acquired',
    'row.sellLabel': 'Sell',
    'row.costLabel': 'Cost',
    'row.qty': 'Qty',
    'row.archived': 'Archived',
    'row.confirmSale': 'Confirm Sale',
    'row.confirmAcquired': 'Confirm Acquired',
    'row.cancel': 'Cancel',
    'row.checkValues': 'Check the values entered.',
    'row.priceError': 'Selling price cannot be less than acquired price.',
    'row.invalidQty': 'Enter a valid quantity.',
    'row.onlyInStock': 'Only {n} in stock.',
    'row.perColorHint': 'Stock is managed per color below.',
    'row.edit': 'Edit',
    'row.sale': 'Sale',
    'row.acquired': 'Acquired',
    'row.archive': 'Archive',
    'row.unarchive': 'Unarchive',
    'row.done': 'Done',
    'row.save': 'Save',

    'photos.loading': 'Loading photos…',
    'photos.invalidSaleQty': 'Enter a valid sale quantity.',
    'photos.onlyColorInStock': 'Only {n} of this color in stock.',
    'photos.invalidAcquireQty': 'Enter a valid acquired quantity.',
    'photos.invalidColorQty': 'Enter a valid quantity for this color.',
    'photos.couldNotAdd': 'Could not add photo.',
    'photos.sold': 'Sold',
    'photos.initial': 'Initial',
    'photos.current': 'Current',
    'photos.sale': 'Sale',
    'photos.acquired': 'Acquired',
    'photos.save': 'Save',
    'photos.none': 'No photos on this product.',
    'photos.addPhoto': '+ Photo',
    'photos.colorNameOptional': 'Color name (optional)',
    'photos.qty': 'Qty',
    'photos.adding': 'Adding…',
    'photos.add': 'Add',
    'photos.cancel': 'Cancel',

    'addProduct.title': 'Add Product',
    'addProduct.colorMode': 'Color Mode',
    'addProduct.single': 'Single product',
    'addProduct.multiColor': 'Multi-color (each photo is a different color)',
    'addProduct.photos': 'Photos',
    'addProduct.name': 'Name',
    'addProduct.type': 'Type',
    'addProduct.sellingPrice': 'Selling Price (₹)',
    'addProduct.acquiredPrice': 'Acquired Price (₹)',
    'addProduct.quantity': 'Quantity',
    'addProduct.sumHint': "Sum of each color's quantity above.",
    'addProduct.selectType': 'Please select a product type.',
    'addProduct.needPhoto': 'Please add at least one photo.',
    'addProduct.needColorName': 'Enter a color name for each photo.',
    'addProduct.needColorQty': 'Enter a valid quantity for each color.',
    'addProduct.needSellingPrice': 'Enter a valid selling price.',
    'addProduct.needAcquiredPrice': 'Enter a valid acquired price.',
    'addProduct.priceError': 'Selling price cannot be less than acquired price.',
    'addProduct.needQty': 'Enter a valid quantity.',
    'addProduct.couldNotCreate': 'Could not create product',
    'addProduct.saved': 'Saved as {code}.',
    'addProduct.somethingWrong': 'Something went wrong. Please try again.',
    'addProduct.saving': 'Saving…',
    'addProduct.save': 'Save Product',
    'addProduct.viewProducts': 'View products',

    'typeSelect.selectCategory': 'Select category…',
    'typeSelect.selectSubType': 'Select sub type…',
    'typeSelect.addNew': '+ Add new sub type…',
    'typeSelect.newSubTypeName': 'New sub type name',
    'typeSelect.autoCode': 'Its product code is generated automatically.',
    'typeSelect.nameRequired': 'Sub type name is required.',
    'typeSelect.saving': 'Saving…',
    'typeSelect.addSubType': 'Add Sub Type',
    'typeSelect.cancel': 'Cancel',

    'uploader.removePhoto': 'Remove photo',
    'uploader.colorName': 'Color name',
    'uploader.qty': 'Qty',
    'uploader.addPhoto': '+ Photo',
    'uploader.count': '{n}/{max} photos',
  },
  te: {
    'common.loading': 'లోడ్ అవుతోంది…',
    'nav.dashboard': 'డాష్‌బోర్డ్',
    'nav.products': 'ఉత్పత్తులు',
    'nav.add': '+ జోడించు',
    'nav.logout': 'లాగ్ అవుట్',

    'catalog.title': 'కేటలాగ్',
    'catalog.search': 'పేరు లేదా కోడ్ వెతకండి…',
    'catalog.all': 'అన్నీ',
    'catalog.loading': 'కేటలాగ్ లోడ్ అవుతోంది…',
    'catalog.noProducts': 'ఉత్పత్తులు కనుగొనబడలేదు.',
    'catalog.noPhoto': 'ఫోటో లేదు',
    'catalog.outOfStock': 'స్టాక్ లేదు',
    'catalog.qty': 'పరిమాణం',

    'viewer.back': 'కేటలాగ్‌కు తిరిగి వెళ్ళు',
    'viewer.sold': 'అమ్ముడైంది',
    'viewer.color': 'రంగు',

    'login.title': 'అడ్మిన్ లాగిన్',
    'login.email': 'ఇమెయిల్',
    'login.password': 'పాస్‌వర్డ్',
    'login.failed': 'లాగిన్ విఫలమైంది. ఇమెయిల్ మరియు పాస్‌వర్డ్ తనిఖీ చేయండి.',
    'login.loggingIn': 'లాగిన్ అవుతోంది…',
    'login.submit': 'లాగిన్',

    'dashboard.title': 'డాష్‌బోర్డ్',
    'dashboard.loading': 'లోడ్ అవుతోంది…',
    'dashboard.totalProducts': 'మొత్తం ఉత్పత్తులు',
    'dashboard.quantityRemaining': 'మిగిలిన పరిమాణం',
    'dashboard.revenueGenerated': 'వచ్చిన ఆదాయం',
    'dashboard.addedToday': 'ఈరోజు జోడించినవి',
    'dashboard.soldToday': 'ఈరోజు అమ్మినవి',
    'dashboard.storageUsed': 'వాడిన నిల్వ',
    'dashboard.failedToLoad': 'గణాంకాలు లోడ్ కాలేదు',
    'error.network': 'సర్వర్‌ను చేరుకోలేకపోయాము. మీ ఇంటర్నెట్ కనెక్షన్ తనిఖీ చేయండి.',

    'products.title': 'ఉత్పత్తులు',

    'row.noPhoto': 'ఫోటో లేదు',
    'row.pricePlaceholderSelling': 'అమ్మకం ధర',
    'row.pricePlaceholderAcquired': 'కొనుగోలు ధర',
    'row.sellLabel': 'అమ్మకం',
    'row.costLabel': 'ఖర్చు',
    'row.qty': 'పరిమాణం',
    'row.archived': 'ఆర్కైవ్ చేయబడింది',
    'row.confirmSale': 'అమ్మకం నిర్ధారించు',
    'row.confirmAcquired': 'సేకరణ నిర్ధారించు',
    'row.cancel': 'రద్దు చేయి',
    'row.checkValues': 'నమోదు చేసిన విలువలను తనిఖీ చేయండి.',
    'row.priceError': 'అమ్మకం ధర కొనుగోలు ధర కంటే తక్కువగా ఉండకూడదు.',
    'row.invalidQty': 'సరైన పరిమాణం నమోదు చేయండి.',
    'row.onlyInStock': 'స్టాక్‌లో {n} మాత్రమే ఉంది.',
    'row.perColorHint': 'స్టాక్ ప్రతి రంగుకు దిగువన నిర్వహించబడుతుంది.',
    'row.edit': 'సవరించు',
    'row.sale': 'అమ్మకం',
    'row.acquired': 'సేకరణ',
    'row.archive': 'ఆర్కైవ్ చేయి',
    'row.unarchive': 'ఆర్కైవ్ తీసివేయి',
    'row.done': 'పూర్తయింది',
    'row.save': 'సేవ్ చేయి',

    'photos.loading': 'ఫోటోలు లోడ్ అవుతున్నాయి…',
    'photos.invalidSaleQty': 'సరైన అమ్మకం పరిమాణం నమోదు చేయండి.',
    'photos.onlyColorInStock': 'ఈ రంగులో స్టాక్‌లో {n} మాత్రమే ఉంది.',
    'photos.invalidAcquireQty': 'సరైన సేకరణ పరిమాణం నమోదు చేయండి.',
    'photos.invalidColorQty': 'ఈ రంగుకు సరైన పరిమాణం నమోదు చేయండి.',
    'photos.couldNotAdd': 'ఫోటో జోడించలేకపోయాము.',
    'photos.sold': 'అమ్ముడైంది',
    'photos.initial': 'ప్రారంభం',
    'photos.current': 'ప్రస్తుతం',
    'photos.sale': 'అమ్మకం',
    'photos.acquired': 'సేకరణ',
    'photos.save': 'సేవ్ చేయి',
    'photos.none': 'ఈ ఉత్పత్తికి ఫోటోలు లేవు.',
    'photos.addPhoto': '+ ఫోటో',
    'photos.colorNameOptional': 'రంగు పేరు (ఐచ్ఛికం)',
    'photos.qty': 'సంఖ్య',
    'photos.adding': 'జోడిస్తోంది…',
    'photos.add': 'జోడించు',
    'photos.cancel': 'రద్దు చేయి',

    'addProduct.title': 'ఉత్పత్తిని జోడించండి',
    'addProduct.colorMode': 'రంగు మోడ్',
    'addProduct.single': 'ఒకే ఉత్పత్తి',
    'addProduct.multiColor': 'బహుళ-రంగు (ప్రతి ఫోటో వేరే రంగు)',
    'addProduct.photos': 'ఫోటోలు',
    'addProduct.name': 'పేరు',
    'addProduct.type': 'రకం',
    'addProduct.sellingPrice': 'అమ్మకం ధర (₹)',
    'addProduct.acquiredPrice': 'కొనుగోలు ధర (₹)',
    'addProduct.quantity': 'పరిమాణం',
    'addProduct.sumHint': 'పైన ఉన్న ప్రతి రంగు పరిమాణం మొత్తం.',
    'addProduct.selectType': 'దయచేసి ఉత్పత్తి రకాన్ని ఎంచుకోండి.',
    'addProduct.needPhoto': 'దయచేసి కనీసం ఒక ఫోటోను జోడించండి.',
    'addProduct.needColorName': 'ప్రతి ఫోటోకు రంగు పేరు నమోదు చేయండి.',
    'addProduct.needColorQty': 'ప్రతి రంగుకు సరైన పరిమాణం నమోదు చేయండి.',
    'addProduct.needSellingPrice': 'సరైన అమ్మకం ధర నమోదు చేయండి.',
    'addProduct.needAcquiredPrice': 'సరైన కొనుగోలు ధర నమోదు చేయండి.',
    'addProduct.priceError': 'అమ్మకం ధర కొనుగోలు ధర కంటే తక్కువగా ఉండకూడదు.',
    'addProduct.needQty': 'సరైన పరిమాణం నమోదు చేయండి.',
    'addProduct.couldNotCreate': 'ఉత్పత్తిని సృష్టించలేకపోయాము',
    'addProduct.saved': '{code} గా సేవ్ చేయబడింది.',
    'addProduct.somethingWrong': 'ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.',
    'addProduct.saving': 'సేవ్ అవుతోంది…',
    'addProduct.save': 'ఉత్పత్తిని సేవ్ చేయి',
    'addProduct.viewProducts': 'ఉత్పత్తులను చూడండి',

    'typeSelect.selectCategory': 'వర్గాన్ని ఎంచుకోండి…',
    'typeSelect.selectSubType': 'ఉప రకాన్ని ఎంచుకోండి…',
    'typeSelect.addNew': '+ కొత్త ఉప రకాన్ని జోడించు…',
    'typeSelect.newSubTypeName': 'కొత్త ఉప రకం పేరు',
    'typeSelect.autoCode': 'దాని ఉత్పత్తి కోడ్ స్వయంచాలకంగా రూపొందించబడుతుంది.',
    'typeSelect.nameRequired': 'ఉప రకం పేరు అవసరం.',
    'typeSelect.saving': 'సేవ్ అవుతోంది…',
    'typeSelect.addSubType': 'ఉప రకాన్ని జోడించు',
    'typeSelect.cancel': 'రద్దు చేయి',

    'uploader.removePhoto': 'ఫోటోను తీసివేయి',
    'uploader.colorName': 'రంగు పేరు',
    'uploader.qty': 'సంఖ్య',
    'uploader.addPhoto': '+ ఫోటో',
    'uploader.count': '{n}/{max} ఫోటోలు',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

// The 16 fixed product categories are database rows (not static UI copy),
// so they need their own lookup rather than the translations dictionary
// above. Falls back to the original name for anything not in this list
// (e.g. if the admin renames a category or adds a new one).
const categoryTranslationsTe: Record<string, string> = {
  Sarees: 'చీరలు',
  'Dress Materials': 'డ్రెస్ మెటీరియల్స్',
  'Dupattas & Stoles': 'దుపట్టాలు & స్టోల్స్',
  'Blouse Products': 'బ్లౌజ్ ఉత్పత్తులు',
  "Women's Ready-Made Clothing": 'మహిళల రెడీమేడ్ దుస్తులు',
  "Men's Products": 'పురుషుల ఉత్పత్తులు',
  'Bags & Pouches': 'బ్యాగులు & పర్సులు',
  'Home Decor / Wall Art': 'గృహాలంకరణ / వాల్ ఆర్ట్',
  'Home Furnishing': 'గృహ వస్త్రాలు',
  'Kitchen / Dining': 'వంటగది / డైనింగ్',
  'Personal / Utility Items': 'వ్యక్తిగత / ఉపయోగ వస్తువులు',
  'Baby & Kids': 'శిశువులు & పిల్లలు',
  Accessories: 'ఉపకరణాలు',
  'Stationery / Gift Products': 'స్టేషనరీ / బహుమతి వస్తువులు',
  'Decorative / Festival Products': 'అలంకరణ / పండుగ వస్తువులు',
  'Fabric / Raw Material': 'వస్త్రం / ముడి పదార్థం',
};

interface LanguageContextValue {
  lang: Lang;
  toggleLang: () => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  tc: (categoryName: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'te' ? 'te' : 'en';
  } catch {
    return 'en';
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readStoredLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
  }, [lang]);

  function toggleLang() {
    setLang((prev) => (prev === 'en' ? 'te' : 'en'));
  }

  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    const template = translations[lang][key] ?? translations.en[key] ?? key;
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
  }

  function tc(categoryName: string): string {
    if (lang !== 'te') return categoryName;
    return categoryTranslationsTe[categoryName] ?? categoryName;
  }

  return <LanguageContext.Provider value={{ lang, toggleLang, t, tc }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
