import { products } from './products.js';

const ar = {
  'sis-scanbody-ti': { name: 'سكان بودي SIS من التيتانيوم', category: 'مكوّنات الزرعات السنية', description: 'سكان بودي من التيتانيوم لمسح الزرعات داخل الفم وخارجه بدقة.', details: ['تصنيع من التيتانيوم', 'للمسح داخل الفم وخارجه', 'متوافق مع أنظمة زرعات رئيسية'] },
  'sis-smart-tibase-engaging': { name: 'قاعدة تيتانيوم SIS الذكية المتشابكة', category: 'مكوّنات الزرعات السنية', description: 'قاعدة تيتانيوم متشابكة بخيارات متعددة للارتفاع الترميمي.', details: ['تيتانيوم Ti-6Al-4V درجة 5', 'طلاء BIOGOLD', 'خيارات ارتفاع H2 وH3 وH4'] },
  'intraoral-scanner-v3-pro': { name: 'الماسح داخل الفم V3 Pro', category: 'الحلول الرقمية', description: 'ماسح عالي الدقة متوافق مع أنظمة CAD/CAM الرئيسية.', details: ['التقاط عالي الدقة', 'توافق مع CAD/CAM', 'جاهز لسير العمل الرقمي'] },
  'nitrile-exam-gloves-m-200': { name: 'قفازات فحص نيتريل مقاس متوسط 200 قطعة', category: 'المستهلكات', description: 'قفازات خالية من البودرة واللاتكس، مقاومة للثقب وحساسة للمس.', details: ['200 قفاز في العبوة', 'خالية من البودرة واللاتكس', 'مقاس متوسط'] },
  'self-ligating-brackets': { name: 'حاصرات تقويم ذاتية الربط', category: 'تقويم الأسنان', description: 'حاصرات ذاتية الربط عالية الجودة لعلاج تقويم أسنان فعّال.', details: ['تصميم ذاتي الربط', 'لعلاج تقويم الأسنان', 'مخزون جاهز للعيادات'] },
  'cad-cam-milling-block': { name: 'بلوك طحن CAD/CAM', category: 'الحلول الرقمية', description: 'بلوك زركونيا عالي الجودة لترميمات التيجان والجسور.', details: ['مادة طحن من الزركونيا', 'للتيجان والجسور', 'لسير عمل المختبرات الرقمية'] },
};

export function getProducts(locale) {
  return products.map((product) => locale === 'ar' ? { ...product, ...ar[product.slug] } : product);
}

export function getProduct(locale, slug) { return getProducts(locale).find((product) => product.slug === slug); }
export function getCategories(locale) { return [...new Set(getProducts(locale).map((product) => product.category))]; }
