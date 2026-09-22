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

    'catalog.title': 'Kalamkari',
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
    'dashboard.addedToday': 'Added Today',
    'dashboard.failedToLoad': 'Failed to load stats',
    'dashboard.section.overall': 'Overview',
    'dashboard.section.stockHealth': 'Stock Health',
    'dashboard.section.byCategory': 'Stock by Category',
    'dashboard.section.storage': 'Storage Used',
    'dashboard.inStock': 'In Stock',
    'dashboard.lowStock': 'Running Low (≤{n})',
    'dashboard.outOfStock': 'Out of Stock',
    'dashboard.noCategories': 'No products yet.',
    'dashboard.productsCount': '{n} products',
    'dashboard.unitsLeft': '{n} left',
    'dashboard.storageHint':
      'Product photos use this space. If it gets full, remove photos from old or unused products.',
    'error.network': 'Could not reach the server. Check your connection.',

    'products.title': 'Products',

    'row.noPhoto': 'No photo',
    'row.qty': 'Qty',
    'row.archived': 'Archived',
    'row.cancel': 'Cancel',
    'row.checkValues': 'Check the values entered.',
    'row.invalidQty': 'Enter a valid quantity.',
    'row.perColorHint': 'Stock is managed per color below.',
    'row.edit': 'Edit',
    'row.archive': 'Archive',
    'row.unarchive': 'Unarchive',
    'row.done': 'Done',
    'row.save': 'Save',

    'photos.loading': 'Loading photos…',
    'photos.invalidColorQty': 'Enter a valid quantity for this color.',
    'photos.couldNotAdd': 'Could not add photo.',
    'photos.couldNotReplace': 'Could not replace photo.',
    'photos.replace': 'Replace photo',
    'photos.replacing': 'Replacing…',
    'photos.sold': 'Sold',
    'photos.initial': 'Initial',
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
    'addProduct.printType': 'Print Type',
    'addProduct.screenPrinted': 'Screen Printed',
    'addProduct.blockPrinted': 'Block Printed',
    'addProduct.type': 'Type',
    'addProduct.quantity': 'Quantity',
    'addProduct.sumHint': "Sum of each color's quantity above.",
    'addProduct.selectType': 'Please select a product type.',
    'addProduct.needPhoto': 'Please add at least one photo.',
    'addProduct.needColorName': 'Enter a color name for each photo.',
    'addProduct.needColorQty': 'Enter a valid quantity for each color.',
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

    'catalog.title': 'కలంకారి',
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
    'dashboard.addedToday': 'ఈరోజు జోడించినవి',
    'dashboard.failedToLoad': 'గణాంకాలు లోడ్ కాలేదు',
    'dashboard.section.overall': 'అవలోకనం',
    'dashboard.section.stockHealth': 'స్టాక్ స్థితి',
    'dashboard.section.byCategory': 'వర్గం వారీగా స్టాక్',
    'dashboard.section.storage': 'వాడిన నిల్వ',
    'dashboard.inStock': 'స్టాక్‌లో ఉంది',
    'dashboard.lowStock': 'తక్కువగా ఉంది (≤{n})',
    'dashboard.outOfStock': 'స్టాక్ లేదు',
    'dashboard.noCategories': 'ఇంకా ఉత్పత్తులు లేవు.',
    'dashboard.productsCount': '{n} ఉత్పత్తులు',
    'dashboard.unitsLeft': '{n} మిగిలి ఉన్నాయి',
    'dashboard.storageHint': 'ఉత్పత్తి ఫోటోలు ఈ స్థలాన్ని వాడతాయి. ఇది నిండితే, పాత లేదా వాడని ఉత్పత్తుల ఫోటోలను తీసివేయండి.',
    'error.network': 'సర్వర్‌ను చేరుకోలేకపోయాము. మీ ఇంటర్నెట్ కనెక్షన్ తనిఖీ చేయండి.',

    'products.title': 'ఉత్పత్తులు',

    'row.noPhoto': 'ఫోటో లేదు',
    'row.qty': 'పరిమాణం',
    'row.archived': 'ఆర్కైవ్ చేయబడింది',
    'row.cancel': 'రద్దు చేయి',
    'row.checkValues': 'నమోదు చేసిన విలువలను తనిఖీ చేయండి.',
    'row.invalidQty': 'సరైన పరిమాణం నమోదు చేయండి.',
    'row.perColorHint': 'స్టాక్ ప్రతి రంగుకు దిగువన నిర్వహించబడుతుంది.',
    'row.edit': 'సవరించు',
    'row.archive': 'ఆర్కైవ్ చేయి',
    'row.unarchive': 'ఆర్కైవ్ తీసివేయి',
    'row.done': 'పూర్తయింది',
    'row.save': 'సేవ్ చేయి',

    'photos.loading': 'ఫోటోలు లోడ్ అవుతున్నాయి…',
    'photos.invalidColorQty': 'ఈ రంగుకు సరైన పరిమాణం నమోదు చేయండి.',
    'photos.couldNotAdd': 'ఫోటో జోడించలేకపోయాము.',
    'photos.couldNotReplace': 'ఫోటోను మార్చలేకపోయాము.',
    'photos.replace': 'ఫోటో మార్చు',
    'photos.replacing': 'మారుస్తోంది…',
    'photos.sold': 'అమ్ముడైంది',
    'photos.initial': 'ప్రారంభం',
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
    'addProduct.printType': 'ప్రింట్ రకం',
    'addProduct.screenPrinted': 'స్క్రీన్ ప్రింట్',
    'addProduct.blockPrinted': 'బ్లాక్ ప్రింట్',
    'addProduct.type': 'రకం',
    'addProduct.quantity': 'పరిమాణం',
    'addProduct.sumHint': 'పైన ఉన్న ప్రతి రంగు పరిమాణం మొత్తం.',
    'addProduct.selectType': 'దయచేసి ఉత్పత్తి రకాన్ని ఎంచుకోండి.',
    'addProduct.needPhoto': 'దయచేసి కనీసం ఒక ఫోటోను జోడించండి.',
    'addProduct.needColorName': 'ప్రతి ఫోటోకు రంగు పేరు నమోదు చేయండి.',
    'addProduct.needColorQty': 'ప్రతి రంగుకు సరైన పరిమాణం నమోదు చేయండి.',
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

// The 159 seeded sub-types are also database rows. Falls back to the
// original name for anything not in this list (a custom sub-type the
// admin added via "+ Add new sub type").
const typeTranslationsTe: Record<string, string> = {
  'Kalamkari Cotton Sarees': 'కలంకారి కాటన్ చీరలు',
  'Kalamkari Silk Sarees': 'కలంకారి సిల్క్ చీరలు',
  'Kalamkari Cotton-Silk Sarees': 'కలంకారి కాటన్-సిల్క్ చీరలు',
  'Kalamkari Kota Sarees': 'కలంకారి కోటా చీరలు',
  'Kalamkari Khadi Sarees': 'కలంకారి ఖాదీ చీరలు',
  'Kalamkari Rayon Sarees': 'కలంకారి రేయాన్ చీరలు',
  'Kalamkari Linen Sarees': 'కలంకారి లినెన్ చీరలు',
  'Kalamkari Hand-Painted Sarees': 'కలంకారి హ్యాండ్ పెయింటెడ్ చీరలు',
  'Kalamkari Hand-Block Printed Sarees': 'కలంకారి హ్యాండ్ బ్లాక్ ప్రింటెడ్ చీరలు',
  'Kalamkari Printed Sarees': 'కలంకారి ప్రింటెడ్ చీరలు',
  'Kalamkari Designer Sarees': 'కలంకారి డిజైనర్ చీరలు',
  'Kalamkari Casual Sarees': 'కలంకారి కేజువల్ చీరలు',
  'Kalamkari Bridal / Festive Sarees': 'కలంకారి పెళ్లి / పండుగ చీరలు',
  'Kalamkari Running Border Sarees': 'కలంకారి రన్నింగ్ బోర్డర్ చీరలు',
  'Kalamkari Zari Border Sarees': 'కలంకారి జరీ బోర్డర్ చీరలు',

  'Kalamkari 3-Piece Dress Material': 'కలంకారి 3-పీస్ డ్రెస్ మెటీరియల్',
  'Kalamkari 2-Piece Dress Material': 'కలంకారి 2-పీస్ డ్రెస్ మెటీరియల్',
  'Kalamkari Cotton Dress Material': 'కలంకారి కాటన్ డ్రెస్ మెటీరియల్',
  'Kalamkari Silk Dress Material': 'కలంకారి సిల్క్ డ్రెస్ మెటీరియల్',
  'Kalamkari Printed Dress Material': 'కలంకారి ప్రింటెడ్ డ్రెస్ మెటీరియల్',
  'Kalamkari Hand-Painted Dress Material': 'కలంకారి హ్యాండ్ పెయింటెడ్ డ్రెస్ మెటీరియల్',
  'Kalamkari Suit Material': 'కలంకారి సూట్ మెటీరియల్',
  'Kalamkari Unstitched Dress Material': 'కలంకారి అన్‌స్టిచ్డ్ డ్రెస్ మెటీరియల్',
  'Kalamkari Salwar Suit Material': 'కలంకారి సల్వార్ సూట్ మెటీరియల్',

  'Kalamkari Dupattas': 'కలంకారి దుపట్టాలు',
  'Kalamkari Cotton Dupattas': 'కలంకారి కాటన్ దుపట్టాలు',
  'Kalamkari Silk Dupattas': 'కలంకారి సిల్క్ దుపట్టాలు',
  'Kalamkari Chunni': 'కలంకారి చున్నీ',
  'Kalamkari Stoles': 'కలంకారి స్టోల్స్',
  'Kalamkari Scarves': 'కలంకారి స్కార్ఫ్‌లు',
  'Kalamkari Hand-Painted Dupattas': 'కలంకారి హ్యాండ్ పెయింటెడ్ దుపట్టాలు',
  'Kalamkari Block-Printed Dupattas': 'కలంకారి బ్లాక్-ప్రింటెడ్ దుపట్టాలు',

  'Kalamkari Blouse Pieces': 'కలంకారి బ్లౌజ్ పీసెస్',
  'Kalamkari Ready-Made Blouses': 'కలంకారి రెడీమేడ్ బ్లౌజ్‌లు',
  'Kalamkari Blouse Fabric': 'కలంకారి బ్లౌజ్ ఫాబ్రిక్',
  'Kalamkari Designer Blouses': 'కలంకారి డిజైనర్ బ్లౌజ్‌లు',
  'Kalamkari Saree Blouse Material': 'కలంకారి చీర బ్లౌజ్ మెటీరియల్',
  'Kalamkari Contrast Blouse Pieces': 'కలంకారి కాంట్రాస్ట్ బ్లౌజ్ పీసెస్',

  'Kalamkari Kurtis': 'కలంకారి కుర్తీలు',
  'Kalamkari Kurta': 'కలంకారి కుర్తా',
  'Kalamkari Tops': 'కలంకారి టాప్స్',
  'Kalamkari Dresses': 'కలంకారి డ్రెస్‌లు',
  'Kalamkari Frocks': 'కలంకారి ఫ్రాక్‌లు',
  'Kalamkari Maxi Dresses': 'కలంకారి మాక్సీ డ్రెస్‌లు',
  'Kalamkari Kaftans': 'కలంకారి కాఫ్తాన్‌లు',
  'Kalamkari Skirts': 'కలంకారి స్కర్టులు',
  'Kalamkari Palazzos': 'కలంకారి పలాజోలు',
  'Kalamkari Pants': 'కలంకారి ప్యాంట్లు',
  'Kalamkari Leggings': 'కలంకారి లెగ్గింగ్స్',
  'Kalamkari Co-Ord Sets': 'కలంకారి కో-ఆర్డ్ సెట్లు',
  'Kalamkari Tunics': 'కలంకారి ట్యూనిక్‌లు',
  'Kalamkari Nighties': 'కలంకారి నైటీలు',
  'Kalamkari Nightwear': 'కలంకారి నైట్‌వేర్',

  "Kalamkari Men's Kurtas": 'కలంకారి పురుషుల కుర్తాలు',
  'Kalamkari Shirts': 'కలంకారి షర్టులు',
  'Kalamkari T-Shirts': 'కలంకారి టీ-షర్టులు',
  'Kalamkari Short Kurtas': 'కలంకారి షార్ట్ కుర్తాలు',
  "Kalamkari Men's Pants": 'కలంకారి పురుషుల ప్యాంట్లు',
  'Kalamkari Shorts': 'కలంకారి షార్ట్స్',
  'Kalamkari Dhoti': 'కలంకారి ధోతి',
  'Kalamkari Lungi': 'కలంకారి లుంగీ',
  'Kalamkari Angavastram': 'కలంకారి అంగవస్త్రం',

  'Kalamkari Hand Bags': 'కలంకారి హ్యాండ్ బ్యాగ్‌లు',
  'Kalamkari Hand Purses': 'కలంకారి హ్యాండ్ పర్సులు',
  'Kalamkari Sling Bags': 'కలంకారి స్లింగ్ బ్యాగ్‌లు',
  'Kalamkari Shoulder Bags': 'కలంకారి షోల్డర్ బ్యాగ్‌లు',
  'Kalamkari Tote Bags': 'కలంకారి టోట్ బ్యాగ్‌లు',
  'Kalamkari Shopping Bags': 'కలంకారి షాపింగ్ బ్యాగ్‌లు',
  'Kalamkari Potli Bags': 'కలంకారి పొట్లి బ్యాగ్‌లు',
  'Kalamkari Clutch Bags': 'కలంకారి క్లచ్ బ్యాగ్‌లు',
  'Kalamkari Pouches': 'కలంకారి పౌచ్‌లు',
  'Kalamkari Coin Pouches': 'కలంకారి కాయిన్ పౌచ్‌లు',
  'Kalamkari Makeup Pouches': 'కలంకారి మేకప్ పౌచ్‌లు',
  'Kalamkari Mobile Pouches': 'కలంకారి మొబైల్ పౌచ్‌లు',
  'Kalamkari Laptop Bags': 'కలంకారి ల్యాప్‌టాప్ బ్యాగ్‌లు',
  'Kalamkari Travel Bags': 'కలంకారి ట్రావెల్ బ్యాగ్‌లు',

  'Kalamkari Wall Art': 'కలంకారి వాల్ ఆర్ట్',
  'Kalamkari Wall Hangings': 'కలంకారి వాల్ హ్యాంగింగ్స్',
  'Kalamkari Wall Panels': 'కలంకారి వాల్ ప్యానెల్స్',
  'Kalamkari Paintings': 'కలంకారి పెయింటింగ్‌లు',
  'Kalamkari Canvas Art': 'కలంకారి కాన్వాస్ ఆర్ట్',
  'Kalamkari Temple Wall Hangings': 'కలంకారి ఆలయ వాల్ హ్యాంగింగ్స్',
  'Kalamkari God & Goddess Paintings': 'కలంకారి దేవుడు & దేవత పెయింటింగ్‌లు',
  'Kalamkari Scroll Paintings': 'కలంకారి స్క్రోల్ పెయింటింగ్‌లు',
  'Kalamkari Door Hangings': 'కలంకారి డోర్ హ్యాంగింగ్స్',
  'Kalamkari Toranas': 'కలంకారి తోరణాలు',
  'Kalamkari Photo Frames': 'కలంకారి ఫోటో ఫ్రేమ్‌లు',
  'Kalamkari Decorative Panels': 'కలంకారి అలంకరణ ప్యానెల్స్',

  'Kalamkari Bed Sheets': 'కలంకారి బెడ్ షీట్లు',
  'Kalamkari Bed Covers': 'కలంకారి బెడ్ కవర్లు',
  'Kalamkari Bedspreads': 'కలంకారి బెడ్‌స్ప్రెడ్‌లు',
  'Kalamkari Pillow Covers': 'కలంకారి పిల్లో కవర్లు',
  'Kalamkari Cushion Covers': 'కలంకారి కుషన్ కవర్లు',
  'Kalamkari Table Covers': 'కలంకారి టేబుల్ కవర్లు',
  'Kalamkari Table Runners': 'కలంకారి టేబుల్ రన్నర్లు',
  'Kalamkari Table Mats': 'కలంకారి టేబుల్ మ్యాట్లు',
  'Kalamkari Dining Mats': 'కలంకారి డైనింగ్ మ్యాట్లు',
  'Kalamkari Curtains': 'కలంకారి కర్టెన్లు',
  'Kalamkari Door Curtains': 'కలంకారి డోర్ కర్టెన్లు',
  'Kalamkari Sofa Covers': 'కలంకారి సోఫా కవర్లు',
  'Kalamkari Quilts': 'కలంకారి క్విల్ట్‌లు',
  'Kalamkari Prayer Mats': 'కలంకారి ప్రార్థన మ్యాట్లు',

  'Kalamkari Kitchen Towels': 'కలంకారి కిచెన్ టవల్స్',
  'Kalamkari Tea Towels': 'కలంకారి టీ టవల్స్',
  'Kalamkari Napkins': 'కలంకారి న్యాప్‌కిన్‌లు',
  'Kalamkari Aprons': 'కలంకారి ఆప్రాన్లు',
  'Kalamkari Pot Holders': 'కలంకారి పాట్ హోల్డర్లు',
  'Kalamkari Kitchen Pouches': 'కలంకారి కిచెన్ పౌచ్‌లు',

  'Kalamkari Handkerchiefs': 'కలంకారి రుమాళ్లు',
  'Kalamkari Face Towels': 'కలంకారి ఫేస్ టవల్స్',
  'Kalamkari Hand Towels': 'కలంకారి హ్యాండ్ టవల్స్',
  'Kalamkari Bath Towels': 'కలంకారి బాత్ టవల్స్',
  'Kalamkari Small Towels': 'కలంకారి చిన్న టవల్స్',
  'Kalamkari Bandanas': 'కలంకారి బాండనాలు',
  'Kalamkari Headbands': 'కలంకారి హెడ్‌బ్యాండ్‌లు',
  'Kalamkari Hair Accessories': 'కలంకారి హెయిర్ యాక్సెసరీలు',
  'Kalamkari Utility Pouches': 'కలంకారి యుటిలిటీ పౌచ్‌లు',

  'Kalamkari Kids Frocks': 'కలంకారి పిల్లల ఫ్రాక్‌లు',
  'Kalamkari Kids Kurtas': 'కలంకారి పిల్లల కుర్తాలు',
  'Kalamkari Kids Dresses': 'కలంకారి పిల్లల డ్రెస్‌లు',
  'Kalamkari Kids Tops': 'కలంకారి పిల్లల టాప్స్',
  'Kalamkari Kids Shirts': 'కలంకారి పిల్లల షర్టులు',
  'Kalamkari Kids Shorts': 'కలంకారి పిల్లల షార్ట్స్',
  'Kalamkari Kids Skirts': 'కలంకారి పిల్లల స్కర్టులు',
  'Kalamkari Baby Dresses': 'కలంకారి బేబీ డ్రెస్‌లు',
  'Kalamkari Baby Frocks': 'కలంకారి బేబీ ఫ్రాక్‌లు',
  'Kalamkari Kids Nightwear': 'కలంకారి పిల్లల నైట్‌వేర్',
  'Kalamkari Kids Co-Ord Sets': 'కలంకారి పిల్లల కో-ఆర్డ్ సెట్లు',

  'Kalamkari Wallets': 'కలంకారి వాలెట్లు',
  'Kalamkari Coin Purses': 'కలంకారి కాయిన్ పర్సులు',
  'Kalamkari Jewelry Pouches': 'కలంకారి నగల పౌచ్‌లు',
  'Kalamkari Bangles': 'కలంకారి గాజులు',
  'Kalamkari Fabric Accessories': 'కలంకారి ఫాబ్రిక్ యాక్సెసరీలు',

  'Kalamkari Notebooks': 'కలంకారి నోట్‌బుక్‌లు',
  'Kalamkari Diary Covers': 'కలంకారి డైరీ కవర్లు',
  'Kalamkari File Covers': 'కలంకారి ఫైల్ కవర్లు',
  'Kalamkari Document Folders': 'కలంకారి డాక్యుమెంట్ ఫోల్డర్లు',
  'Kalamkari Pen Pouches': 'కలంకారి పెన్ పౌచ్‌లు',
  'Kalamkari Book Covers': 'కలంకారి బుక్ కవర్లు',
  'Kalamkari Gift Bags': 'కలంకారి గిఫ్ట్ బ్యాగ్‌లు',
  'Kalamkari Gift Boxes': 'కలంకారి గిఫ్ట్ బాక్స్‌లు',
  'Kalamkari Greeting Cards': 'కలంకారి గ్రీటింగ్ కార్డులు',

  'Kalamkari Pooja Cloth': 'కలంకారి పూజ వస్త్రం',
  'Kalamkari Mandir Backdrops': 'కలంకారి మందిర్ బ్యాక్‌డ్రాప్‌లు',
  'Kalamkari Canopies': 'కలంకారి కానోపీలు',
  'Kalamkari Festival Decor': 'కలంకారి పండుగ అలంకరణ',
  'Kalamkari Wedding Decor': 'కలంకారి వివాహ అలంకరణ',
  'Kalamkari Return Gift Bags': 'కలంకారి రిటర్న్ గిఫ్ట్ బ్యాగ్‌లు',

  'Kalamkari Cotton Fabric': 'కలంకారి కాటన్ ఫాబ్రిక్',
  'Kalamkari Silk Fabric': 'కలంకారి సిల్క్ ఫాబ్రిక్',
  'Kalamkari Rayon Fabric': 'కలంకారి రేయాన్ ఫాబ్రిక్',
  'Kalamkari Linen Fabric': 'కలంకారి లినెన్ ఫాబ్రిక్',
  'Kalamkari Hand-Block Fabric': 'కలంకారి హ్యాండ్ బ్లాక్ ఫాబ్రిక్',
  'Kalamkari Hand-Painted Fabric': 'కలంకారి హ్యాండ్ పెయింటెడ్ ఫాబ్రిక్',
  'Pen Kalamkari Fabric': 'పెన్ కలంకారి ఫాబ్రిక్',
  'Kalamkari Printed Fabric': 'కలంకారి ప్రింటెడ్ ఫాబ్రిక్',
  'Kalamkari Running Fabric': 'కలంకారి రన్నింగ్ ఫాబ్రిక్',
  'Kalamkari Curtain Fabric': 'కలంకారి కర్టెన్ ఫాబ్రిక్',
  'Kalamkari Upholstery Fabric': 'కలంకారి అప్హోల్‌స్టరీ ఫాబ్రిక్',
};

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
  tt: (typeName: string) => string;
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

  function tt(typeName: string): string {
    if (lang !== 'te') return typeName;
    return typeTranslationsTe[typeName] ?? typeName;
  }

  return <LanguageContext.Provider value={{ lang, toggleLang, t, tc, tt }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
