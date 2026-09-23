export const locales = ['en', 'ar'];

export const copy = {
  en: {
    locale: 'en_US', language: 'en', dir: 'ltr', siteName: 'USSUS Med',
    nav: { products: 'Products', categories: 'Categories', clinics: 'For clinics', contact: 'Contact', quote: 'Quote' },
    switchLabel: 'العربية', switchAria: 'Switch to Arabic',
    home: { kicker: 'For the detail-driven practice', title: 'Precision starts\nwith the essentials.', intro: 'Implant components, digital equipment and daily supplies. Considered for the way you work.', catalogue: 'Explore the catalogue', buildQuote: 'Build a quote', fieldTitle: 'Find your field.', fieldText: 'Four disciplines. One place to source.', selected: 'Selected from the catalogue.', all: 'Explore all products', clinicsTitle: 'A considered selection.\nA clear quotation.', clinicsText: 'Select your products and quantities. Tell us what your practice needs. We’ll confirm the configuration, availability and delivery details in your quotation.' },
    catalogue: { title: 'The catalogue.', intro: 'Explore clinic essentials, implant prosthetics, digital equipment, and orthodontic supplies.', families: 'Product families', explore: 'Explore the collection', view: 'View product', bulk: 'Need a bulk order?', bulkTitle: 'Your practice. Your requirements.', request: 'Request a quote' },
    common: { home: 'Home', catalogue: 'Catalogue', inStock: 'In stock', perUnit: 'per unit', perPack: 'per pack of 200', priced: 'Prices are quoted in AED. Final availability, taxes, shipping and delivery timing are confirmed in your quotation.', footer: 'Dental supplies for clinics that care about precision.', order: 'Start an order', quoteRequest: 'Prepare a quote request', quickLinks: 'Quick links', about: 'About USSUS Med', privacy: 'Privacy policy', terms: 'Terms of use' },
  },
  ar: {
    locale: 'ar_AE', language: 'ar-AE', dir: 'rtl', siteName: 'يوسُس ميد',
    nav: { products: 'المنتجات', categories: 'الفئات', clinics: 'للعيادات', contact: 'تواصل معنا', quote: 'عرض السعر' },
    switchLabel: 'English', switchAria: 'التبديل إلى الإنجليزية',
    home: { kicker: 'للممارسات التي تهتم بأدق التفاصيل', title: 'الدقة تبدأ\nمن الأساسيات.', intro: 'مكوّنات الزرعات، المعدات الرقمية، والمستلزمات اليومية لعيادتك.', catalogue: 'استعرض الكتالوج', buildQuote: 'أنشئ طلب عرض سعر', fieldTitle: 'اعثر على تخصصك.', fieldText: 'أربعة مجالات في مكان واحد.', selected: 'مختارات من الكتالوج.', all: 'استعرض كل المنتجات', clinicsTitle: 'اختيار مدروس.\nعرض سعر واضح.', clinicsText: 'اختر المنتجات والكميات وأخبرنا باحتياجات عيادتك. نؤكد التوفر والتوافق وتفاصيل التسليم في عرض السعر.' },
    catalogue: { title: 'الكتالوج.', intro: 'استكشف مستلزمات العيادة، مكوّنات الزرعات، المعدات الرقمية، ومنتجات تقويم الأسنان.', families: 'فئات المنتجات', explore: 'استكشف المجموعة', view: 'عرض المنتج', bulk: 'هل تحتاج إلى طلبية كبيرة؟', bulkTitle: 'عيادتك. احتياجاتك.', request: 'اطلب عرض سعر' },
    common: { home: 'الرئيسية', catalogue: 'الكتالوج', inStock: 'متوفر', perUnit: 'للقطعة', perPack: 'للعبوة (200 قطعة)', priced: 'الأسعار بالدرهم الإماراتي. يتم تأكيد التوفر والضرائب والشحن وموعد التسليم في عرض السعر.', footer: 'مستلزمات أسنان للعيادات التي تهتم بالدقة.', order: 'ابدأ طلبك', quoteRequest: 'جهّز طلب عرض سعر', quickLinks: 'روابط سريعة', about: 'عن يوسس ميد', privacy: 'سياسة الخصوصية', terms: 'شروط الاستخدام' },
  },
};

export function localePath(locale, path = '/') {
  const clean = path.replace(/^\/(en|ar)(?=\/|$)/, '') || '/';
  return `/${locale}${clean.startsWith('/') ? clean : `/${clean}`}`;
}

export function alternateLocale(locale) { return locale === 'ar' ? 'en' : 'ar'; }
