import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Users,
  Utensils,
  Coffee,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORY_TRANSLATIONS } from '../data/seedData';
import { FoodVisual } from '../components/FoodVisual';
import { FulfillmentType, OrderStatus, Product } from '../types';

// ============================================================================
// 1. HOMEPAGE (/)
// ============================================================================
export const HomePage: React.FC = () => {
  const {
    lang,
    t,
    businesses,
    products,
    squads,
    addToCart,
    user,
    signInWithGoogle,
  } = useApp();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    businesses.forEach((b) => b.categories.forEach((c) => set.add(c)));
    return Array.from(set);
  }, [businesses]);

  const featuredProducts = useMemo(() => {
    const available = products.filter((p) => p.isAvailable);
    if (selectedCategory === 'ALL') {
      return available.filter((p) => p.isFeatured || p.isPopular).slice(0, 9);
    }
    return available.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-16 py-8">
      {/* Section 1: Storefront Split Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#20252B] text-[#FAF8F5] rounded-3xl overflow-hidden border border-[#20252B]/10 grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="text-xs font-semibold text-[#FF6B35] tracking-wide">
                {t(
                  'منصة الطلب المباشر بدون عمولة · الرياض · بيانات تجريبية',
                  'Zero-Commission Direct Ordering · Riyadh Pilot · Sample Data'
                )}
              </div>
              <h1
                className="text-3xl sm:text-5xl font-extrabold leading-tight text-white"
                style={{ textWrap: 'balance' }}
              >
                {t(
                  'اطلب من مطعم ومقهى فودو، واجمع نقاط فريقك في فودو سكوادز',
                  'Order Direct from FOODOO Restaurant & Café, Earn Rewards with Your Squad'
                )}
              </h1>
              <p className="text-base text-[#FAF8F5]/80 max-w-2xl leading-relaxed">
                {t(
                  'تجربة حقيقية متكاملة للسوق السعودي تجمع بين أشهى البرجر والدجاج المقرمش، القهوة المختصة والحلويات، ونظام التنافس الجماعي الأسبوعي مع أصدقائك أو زملاء العمل.',
                  'An end-to-end Saudi food-tech pilot uniting artisanal smash burgers, specialty coffee, and team-based Foodoo Squads rewards.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/menu/foodoo-restaurant')}
                className="px-6 py-3.5 bg-[#FF6B35] hover:bg-[#e85a25] text-white font-bold rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Utensils className="w-4 h-4" />
                <span>
                  {t('اطلب من مطعم فودو', 'Order from FOODOO Restaurant')}
                </span>
              </button>
              <button
                onClick={() => navigate('/menu/foodoo-cafe')}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Coffee className="w-4 h-4" />
                <span>
                  {t('منيو مقهى فودو', 'Explore FOODOO Café')}
                </span>
              </button>
              {!user && (
                <button
                  onClick={signInWithGoogle}
                  className="px-5 py-3.5 text-sm text-[#FF6B35] hover:underline font-bold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t('تسجيل الدخول بحساب Google', 'Sign in with Google')}
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 min-h-[280px] lg:min-h-full relative">
            <FoodVisual
              imageKey="hero-feast"
              alt={t('وليمة فودو التجريبية', 'FOODOO Signature Feast')}
              className="w-full h-full lg:h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-6">
              <div className="text-white space-y-1">
                <div className="text-xs text-white/75">
                  {t(
                    'مطعم فودو التجريبي · مقهى فودو التجريبي',
                    'FOODOO Restaurant Demo · FOODOO Café Demo'
                  )}
                </div>
                <div className="text-lg font-bold">
                  {t(
                    'تحضير فوري وتتبع مباشر لحالة الطلب لحظة بلحظة',
                    'Freshly prepared to order with live Firestore status tracking'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Participating Pilot Businesses (Restaurant & Café Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#FF6B35] mb-1">
              {t('المنشآت المشاركة في التجربة', 'Pilot Participating Businesses')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#20252B]">
              {t('اختر وجهتك اليوم في الرياض', 'Choose Your Destination in Riyadh')}
            </h2>
          </div>
          <Link
            to="/restaurants"
            className="text-sm font-bold text-[#FF6B35] hover:underline flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <span>{t('عرض تفاصيل المنشآت', 'View All Business Details')}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {businesses.map((biz) => {
            const isRest = biz.type === 'restaurant';
            return (
              <div
                key={biz.id}
                className="bg-white rounded-2xl border border-[#20252B]/10 overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5"
              >
                <div>
                  <div className="h-56 relative">
                    <FoodVisual
                      imageKey={isRest ? 'burger-double' : 'iced-spanish'}
                      alt={lang === 'ar' ? biz.nameAr : biz.nameEn}
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6">
                      <div className="text-white space-y-1">
                        <div className="text-xs text-white/80">
                          <span>
                            {biz.isOpen
                              ? t('مفتوح الآن للطلبات', 'Open Now')
                              : t('مغلق مؤقتاً', 'Closed')}
                          </span>
                          <span aria-hidden="true"> · </span>
                          <span>
                            {t('بيانات تجريبية', 'Sample Pilot Data')}
                          </span>
                          <span aria-hidden="true"> · </span>
                          <span className="tabular-nums">
                            {biz.prepTimeMinutes} {t('دقيقة', 'mins')}
                          </span>
                        </div>
                        <h3 className="text-2xl font-extrabold">
                          {lang === 'ar' ? biz.nameAr : biz.nameEn}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-sm text-[#20252B]/75 leading-relaxed">
                      {lang === 'ar' ? biz.descriptionAr : biz.descriptionEn}
                    </p>

                    <div className="text-xs text-[#20252B]/65 flex flex-wrap items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#FF6B35] shrink-0" />
                      <span>
                        {lang === 'ar' ? biz.locationAr : biz.locationEn}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {t('الحد الأدنى:', 'Min Order:')} {biz.minOrderSar}{' '}
                        {t('ر.س', 'SAR')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {t('التوصيل:', 'Delivery:')} {biz.deliveryFeeSar}{' '}
                        {t('ر.س', 'SAR')}
                      </span>
                    </div>

                    <div className="text-xs text-[#20252B]/60 pt-1">
                      {biz.categories
                        .map((c) =>
                          lang === 'ar'
                            ? CATEGORY_TRANSLATIONS[c]?.ar || c
                            : CATEGORY_TRANSLATIONS[c]?.en || c
                        )
                        .join(' · ')}
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-4 border-t border-[#20252B]/5">
                  <Link
                    to={`/restaurant/${biz.id}`}
                    className="text-xs font-semibold text-[#20252B]/70 hover:text-[#20252B] whitespace-nowrap shrink-0"
                  >
                    {t('معلومات المنشأة', 'Store Info')}
                  </Link>
                  <button
                    onClick={() => navigate(`/menu/${biz.id}`)}
                    className="px-5 py-2.5 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>{t('تصفح المنيو والطلب', 'Open Menu & Order')}</span>
                    <ArrowIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: Interactive Category Filter & Featured / Popular Items Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#FF6B35] mb-1">
              {t('الأصناف المختارة والأكثر طلباً', 'Featured & Popular Dishes')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#20252B]">
              {t('اطلب مباشرة بالريال السعودي', 'Direct Menu Selection in SAR')}
            </h2>
          </div>

          {/* Interactive Filter Controls */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#20252B]/5 rounded-xl overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[#20252B] text-white shadow-xs'
                  : 'text-[#20252B]/70 hover:text-[#20252B]'
              }`}
            >
              {t('الأكثر طلباً', 'Popular & Featured')}
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#20252B] text-white shadow-xs'
                    : 'text-[#20252B]/70 hover:text-[#20252B]'
                }`}
              >
                {lang === 'ar'
                  ? CATEGORY_TRANSLATIONS[cat]?.ar || cat
                  : CATEGORY_TRANSLATIONS[cat]?.en || cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => {
            const biz = businesses.find((b) => b.id === product.businessId);
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#20252B]/10 overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5"
              >
                <div>
                  <div
                    onClick={() => navigate(`/menu/${product.businessId}`)}
                    className="h-52 relative cursor-pointer"
                  >
                    <FoodVisual
                      imageKey={product.imageKey}
                      alt={lang === 'ar' ? product.nameAr : product.nameEn}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    {/* Clean unboxed metadata with typographic separators */}
                    <div className="text-xs text-[#20252B]/60 flex items-center gap-1.5">
                      <span>
                        {biz
                          ? lang === 'ar'
                            ? biz.nameAr
                            : biz.nameEn
                          : product.businessId}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {lang === 'ar'
                          ? CATEGORY_TRANSLATIONS[product.category]?.ar ||
                            product.category
                          : product.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {product.calories} {t('سعرة', 'kcal')}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#20252B]">
                      {lang === 'ar' ? product.nameAr : product.nameEn}
                    </h3>

                    <p className="text-xs text-[#20252B]/70 line-clamp-2 leading-relaxed">
                      {lang === 'ar'
                        ? product.descriptionAr
                        : product.descriptionEn}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-3">
                  <div className="text-lg font-extrabold text-[#20252B] tabular-nums">
                    {product.priceSar}{' '}
                    <span className="text-xs font-semibold text-[#20252B]/70">
                      {t('ر.س', 'SAR')}
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="px-4 py-2 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {t('أضف للسلة +', 'Add to Cart +')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: Foodoo Squads Promotion & Live Top Teams */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#20252B] text-[#FAF8F5] rounded-3xl p-8 sm:p-12 border border-[#20252B]/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="text-xs font-semibold text-[#FF6B35]">
              {t(
                'الميزة التنافسية الحصرية · FOODOO SQUADS',
                'Signature Social Differentiator · FOODOO SQUADS'
              )}
            </div>
            <h2
              className="text-2xl sm:text-4xl font-extrabold text-white leading-tight"
              style={{ textWrap: 'balance' }}
            >
              {t(
                'كوّن فريقك مع المكتب أو الجامعة أو الأصدقاء أو العائلة، واكسب نقطة مع كل طلب مكتمل',
                'Team Up with Your Office, University, Friends, or Family — Every Completed Order Earns +1 Squad Point'
              )}
            </h2>
            <p className="text-sm text-[#FAF8F5]/80 leading-relaxed max-w-xl">
              {t(
                'كل طلب مكتمل من مطعم أو مقهى فودو يضيف نقطة واحدة مباشرة لرصيد السكواد الأسبوعي. الفرق المتصدرة تحصل على خصومات جماعية تصل إلى 25% وتوصيل مجاني لجميع الأعضاء.',
                'Every qualifying completed order from participating FOODOO businesses adds +1 point to your Squad weekly ranking. Top teams unlock up to 25% group discounts and free delivery.'
              )}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/squads/create')}
                className="px-6 py-3 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t('أنشئ سكواد جديد الآن', 'Create a New Squad')}
              </button>
              <button
                onClick={() => navigate('/squads')}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t('استعرض الفرق وانضم إليها', 'Browse & Join Squads')}
              </button>
              <Link
                to="/leaderboard"
                className="text-sm font-bold text-[#FF6B35] hover:underline whitespace-nowrap shrink-0"
              >
                {t('جدول الترتيب والجوائز الأسبوعية', 'View Weekly Leaderboard')}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs text-white/70 border-b border-white/10 pb-3">
              <span className="font-bold text-white">
                {t('أبرز فرق الرياض هذا الأسبوع', 'Top Riyadh Squads This Week')}
              </span>
              <span>{t('النقاط الأسبوعية', 'Weekly Points')}</span>
            </div>
            <div className="space-y-3">
              {squads.slice(0, 4).map((sq, idx) => (
                <Link
                  key={sq.id}
                  to={`/squads/${sq.id}`}
                  className="flex items-center justify-between gap-3 py-2 hover:bg-white/5 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono-tabular text-sm font-bold text-[#FF6B35] w-5">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">
                        {sq.name}
                      </div>
                      <div className="text-xs text-white/60">
                        <span>{sq.category}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="tabular-nums">
                          {sq.memberCount} {t('أعضاء', 'members')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="font-mono-tabular text-sm font-bold text-[#FF6B35] shrink-0">
                    {sq.weeklyPoints} {t('نقطة', 'pts')}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// 2. RESTAURANTS DIRECTORY (/restaurants)
// ============================================================================
export const RestaurantsPage: React.FC = () => {
  const { lang, t, businesses, products } = useApp();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-2">
        <div className="text-xs font-semibold text-[#FF6B35]">
          {t('منشآت فودو التجريبية · الرياض', 'FOODOO Pilot Businesses · Riyadh')}
        </div>
        <h1 className="text-3xl font-extrabold text-[#20252B]">
          {t('المطاعم والمقاهي المشاركة', 'Participating Restaurants & Cafés')}
        </h1>
        <p className="text-sm text-[#20252B]/70 max-w-2xl">
          {t(
            'يدعم الإصدار التجريبي الأول منشأتين مستقلتين تماماً في البيانات والمنيو ولوحة التحكم: مطعم فودو التجريبي ومقهى فودو التجريبي.',
            'Pilot V1 supports two strictly isolated businesses with full real-time menu management and order fulfillment.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {businesses.map((biz) => {
          const bizProducts = products.filter((p) => p.businessId === biz.id);
          return (
            <div
              key={biz.id}
              className="bg-white rounded-2xl border border-[#20252B]/10 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="h-60 relative">
                  <FoodVisual
                    imageKey={
                      biz.type === 'restaurant'
                        ? 'burger-double'
                        : 'iced-spanish'
                    }
                    alt={lang === 'ar' ? biz.nameAr : biz.nameEn}
                    className="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6">
                    <div className="text-white space-y-1">
                      <div className="text-xs text-white/80">
                        <span>
                          {biz.isOpen
                            ? t('مفتوح الآن', 'Open Now')
                            : t('مغلق', 'Closed')}
                        </span>
                        <span aria-hidden="true"> · </span>
                        <span className="tabular-nums">
                          {bizProducts.length} {t('منتج في المنيو', 'menu items')}
                        </span>
                        <span aria-hidden="true"> · </span>
                        <span>{t('بيانات تجريبية', 'Sample Data')}</span>
                      </div>
                      <h2 className="text-2xl font-extrabold">
                        {lang === 'ar' ? biz.nameAr : biz.nameEn}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-sm text-[#20252B]/75 leading-relaxed">
                    {lang === 'ar' ? biz.descriptionAr : biz.descriptionEn}
                  </p>
                  <div className="text-xs text-[#20252B]/65 flex flex-wrap items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>
                      {lang === 'ar' ? biz.locationAr : biz.locationEn}
                    </span>
                    <span aria-hidden="true">·</span>
                    <Clock className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span className="tabular-nums">
                      {biz.prepTimeMinutes} {t('دقيقة تحضير', 'mins prep')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 border-t border-[#20252B]/10 flex items-center justify-between gap-4">
                <Link
                  to={`/restaurant/${biz.id}`}
                  className="text-xs font-bold text-[#20252B]/75 hover:text-[#20252B]"
                >
                  {t('صفحة المنشأة', 'Business Overview')}
                </Link>
                <button
                  onClick={() => navigate(`/menu/${biz.id}`)}
                  className="px-5 py-2.5 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {t('افتح المنيو واطلب', 'View Menu & Order')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 3. RESTAURANT / CAFÉ MENU PAGE (/restaurant/:id and /menu/:businessId)
// ============================================================================
export const MenuPage: React.FC = () => {
  const { id, businessId } = useParams<{ id?: string; businessId?: string }>();
  const resolvedId = businessId || id || 'foodoo-restaurant';

  const {
    lang,
    t,
    businesses,
    products,
    addToCart,
    cart,
    cartSubtotalSar,
    cartCount,
    cartBusiness,
  } = useApp();
  const navigate = useNavigate();

  const business =
    businesses.find((b) => b.id === resolvedId) || businesses[0];

  const businessProducts = useMemo(
    () => products.filter((p) => p.businessId === business.id),
    [products, business.id]
  );

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(
    null
  );
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [modalQty, setModalQty] = useState<number>(1);

  const filteredProducts = useMemo(() => {
    return businessProducts.filter((p) => {
      const matchesCat =
        activeCategory === 'ALL' || p.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.nameAr.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.descriptionAr.toLowerCase().includes(q) ||
        p.descriptionEn.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [businessProducts, activeCategory, searchQuery]);

  const openProductModal = (product: Product) => {
    setCustomizingProduct(product);
    setSelectedOption(product.customizationOptions?.[0] || 'Standard');
    setModalQty(1);
  };

  const handleConfirmAddModal = () => {
    if (!customizingProduct) return;
    addToCart(customizingProduct, modalQty, selectedOption);
    setCustomizingProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Business Header Banner */}
      <div className="bg-[#20252B] text-[#FAF8F5] rounded-3xl overflow-hidden border border-[#20252B]/10 grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="text-xs text-[#FF6B35] font-semibold flex flex-wrap items-center gap-2">
              <span>
                {business.type === 'restaurant'
                  ? t('مطعم مشارك · بيانات تجريبية', 'Pilot Restaurant · Sample Data')
                  : t('مقهى مختص · بيانات تجريبية', 'Pilot Specialty Café · Sample Data')}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {business.isOpen
                  ? t('مفتوح ويستقبل الطلبات', 'Open & Accepting Orders')
                  : t('مغلق حالياً', 'Currently Closed')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              {lang === 'ar' ? business.nameAr : business.nameEn}
            </h1>

            <p className="text-sm text-[#FAF8F5]/80 max-w-2xl leading-relaxed">
              {lang === 'ar' ? business.descriptionAr : business.descriptionEn}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#FAF8F5]/85 pt-2 border-t border-white/10">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#FF6B35]" />
              {lang === 'ar' ? business.locationAr : business.locationEn}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {t('وقت التحضير:', 'Prep Time:')} {business.prepTimeMinutes}{' '}
              {t('دقيقة', 'mins')}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {t('الحد الأدنى للطلب:', 'Min Order:')} {business.minOrderSar}{' '}
              {t('ر.س', 'SAR')}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {t('رسوم التوصيل التجريبي:', 'Delivery Fee:')}{' '}
              {business.deliveryFeeSar} {t('ر.س', 'SAR')}
            </span>
          </div>
        </div>

        <div className="lg:col-span-4 h-52 lg:h-auto relative">
          <FoodVisual
            imageKey={
              business.type === 'restaurant' ? 'burger-double' : 'iced-spanish'
            }
            alt={lang === 'ar' ? business.nameAr : business.nameEn}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Switch Business Quick Bar + Search + Category Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#20252B]/5 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeCategory === 'ALL'
                ? 'bg-[#20252B] text-white'
                : 'text-[#20252B]/70 hover:text-[#20252B]'
            }`}
          >
            {t('كل الأصناف', 'All Categories')} ({businessProducts.length})
          </button>
          {business.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#20252B] text-white'
                  : 'text-[#20252B]/70 hover:text-[#20252B]'
              }`}
            >
              {lang === 'ar'
                ? CATEGORY_TRANSLATIONS[cat]?.ar || cat
                : CATEGORY_TRANSLATIONS[cat]?.en || cat}
            </button>
          ))}
        </div>

        {/* Search Input & Switch to other Demo Business */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('ابحث في المنيو...', 'Search menu items...')}
            className="px-4 py-2 text-sm bg-white border border-[#20252B]/15 rounded-xl focus:outline-none focus:border-[#FF6B35] w-full sm:w-56"
          />
          <Link
            to={
              business.id === 'foodoo-restaurant'
                ? '/menu/foodoo-cafe'
                : '/menu/foodoo-restaurant'
            }
            className="px-3.5 py-2 text-xs font-bold text-[#FF6B35] bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 rounded-xl whitespace-nowrap shrink-0"
          >
            {business.id === 'foodoo-restaurant'
              ? t('انتقل لمنيو المقهى ←', 'Switch to Café →')
              : t('انتقل لمنيو المطعم ←', 'Switch to Restaurant →')}
          </Link>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-2xl border border-[#20252B]/10 overflow-hidden flex flex-col justify-between transition-transform duration-150 ${
              product.isAvailable ? 'hover:-translate-y-0.5' : 'opacity-65'
            }`}
          >
            <div>
              <div
                onClick={() =>
                  product.isAvailable && openProductModal(product)
                }
                className="h-52 relative cursor-pointer"
              >
                <FoodVisual
                  imageKey={product.imageKey}
                  alt={lang === 'ar' ? product.nameAr : product.nameEn}
                  className="w-full h-full"
                />
              </div>

              <div className="p-5 space-y-2">
                <div className="text-xs text-[#20252B]/60 flex items-center gap-1.5">
                  <span>
                    {lang === 'ar'
                      ? CATEGORY_TRANSLATIONS[product.category]?.ar ||
                        product.category
                      : product.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {product.calories} {t('سعرة', 'kcal')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={
                      product.isAvailable
                        ? 'text-emerald-700 font-semibold'
                        : 'text-red-600 font-semibold'
                    }
                  >
                    {product.isAvailable
                      ? t('متوفر', 'Available')
                      : t('غير متوفر حالياً', 'Sold Out')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#20252B]">
                  {lang === 'ar' ? product.nameAr : product.nameEn}
                </h3>

                <p className="text-xs text-[#20252B]/70 leading-relaxed">
                  {lang === 'ar'
                    ? product.descriptionAr
                    : product.descriptionEn}
                </p>

                {product.customizationOptions?.length > 0 && (
                  <div className="text-[11px] text-[#20252B]/55 pt-1">
                    {lang === 'ar'
                      ? product.customizationLabelAr
                      : product.customizationLabelEn}
                    : {product.customizationOptions.slice(0, 2).join(' / ')}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-[#20252B]/5 flex items-center justify-between gap-3">
              <div className="text-lg font-extrabold text-[#20252B] tabular-nums">
                {product.priceSar}{' '}
                <span className="text-xs font-semibold text-[#20252B]/70">
                  {t('ر.س', 'SAR')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {product.customizationOptions?.length > 0 &&
                  product.isAvailable && (
                    <button
                      onClick={() => openProductModal(product)}
                      className="px-3 py-2 text-xs font-semibold text-[#20252B] bg-[#FAF8F5] hover:bg-[#20252B]/10 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {t('تخصيص', 'Customize')}
                    </button>
                  )}
                <button
                  disabled={!product.isAvailable}
                  onClick={() => addToCart(product, 1)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                    product.isAvailable
                      ? 'bg-[#FF6B35] hover:bg-[#e85a25] text-white cursor-pointer'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product.isAvailable
                    ? t('أضف للسلة +', 'Add +')
                    : t('غير متوفر', 'Unavailable')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Cart Summary Bar if cart has items */}
      {cart.length > 0 && (
        <div className="bg-[#20252B] text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
          <div className="space-y-0.5 text-center sm:text-start">
            <div className="text-xs text-white/70">
              {t('سلة الطلبات الحالية من:', 'Active Cart for:')}{' '}
              <span className="font-bold text-[#FF6B35]">
                {lang === 'ar'
                  ? cartBusiness?.nameAr
                  : cartBusiness?.nameEn}
              </span>
            </div>
            <div className="text-base font-bold tabular-nums">
              {cartCount} {t('منتجات', 'items')} · {cartSubtotalSar}{' '}
              {t('ر.س', 'SAR')}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/cart')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {t('مراجعة السلة', 'Review Cart')}
            </button>
            <button
              onClick={() => navigate('/checkout')}
              className="px-6 py-2.5 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {t('إتمام الطلب الآن', 'Proceed to Checkout')}
            </button>
          </div>
        </div>
      )}

      {/* Product Customization & Quantity Modal */}
      {customizingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-[#20252B]/10 shadow-xl">
            <div className="h-48 relative">
              <FoodVisual
                imageKey={customizingProduct.imageKey}
                alt={
                  lang === 'ar'
                    ? customizingProduct.nameAr
                    : customizingProduct.nameEn
                }
                className="w-full h-full"
              />
            </div>
            <div className="p-6 space-y-5">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-extrabold text-[#20252B]">
                    {lang === 'ar'
                      ? customizingProduct.nameAr
                      : customizingProduct.nameEn}
                  </h3>
                  <span className="text-lg font-extrabold text-[#FF6B35] tabular-nums shrink-0">
                    {customizingProduct.priceSar} {t('ر.س', 'SAR')}
                  </span>
                </div>
                <p className="text-xs text-[#20252B]/70 mt-1 leading-relaxed">
                  {lang === 'ar'
                    ? customizingProduct.descriptionAr
                    : customizingProduct.descriptionEn}
                </p>
              </div>

              {customizingProduct.customizationOptions?.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#20252B]">
                    {lang === 'ar'
                      ? customizingProduct.customizationLabelAr
                      : customizingProduct.customizationLabelEn}
                  </label>
                  <div className="space-y-2">
                    {customizingProduct.customizationOptions.map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                          selectedOption === opt
                            ? 'border-[#FF6B35] bg-[#FF6B35]/5 text-[#20252B]'
                            : 'border-[#20252B]/10 text-[#20252B]/75 hover:border-[#20252B]/30'
                        }`}
                      >
                        <span>{opt}</span>
                        <input
                          type="radio"
                          name="prodOption"
                          checked={selectedOption === opt}
                          onChange={() => setSelectedOption(opt)}
                          className="accent-[#FF6B35]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between pt-2 border-t border-[#20252B]/10">
                <span className="text-xs font-bold text-[#20252B]">
                  {t('الكمية المطلوبة', 'Quantity')}
                </span>
                <div className="flex items-center gap-3 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#20252B]/10">
                  <button
                    onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                    className="p-1 text-[#20252B] hover:text-[#FF6B35] cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono-tabular text-sm font-bold w-6 text-center">
                    {modalQty}
                  </span>
                  <button
                    onClick={() => setModalQty((q) => Math.min(20, q + 1))}
                    className="p-1 text-[#20252B] hover:text-[#FF6B35] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setCustomizingProduct(null)}
                  className="px-4 py-2.5 text-xs font-bold text-[#20252B]/70 hover:text-[#20252B] cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  onClick={handleConfirmAddModal}
                  className="px-6 py-2.5 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer tabular-nums"
                >
                  {t('إضافة للسلة', 'Add to Cart')} ·{' '}
                  {customizingProduct.priceSar * modalQty} {t('ر.س', 'SAR')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. SHOPPING CART PAGE (/cart)
// ============================================================================
export const CartPage: React.FC = () => {
  const {
    lang,
    t,
    cart,
    cartBusiness,
    cartSubtotalSar,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    userProfile,
    squads,
  } = useApp();
  const navigate = useNavigate();

  const activeSquad = squads.find((s) => s.id === userProfile?.activeSquadId);

  if (cart.length === 0 || !cartBusiness) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#20252B]">
          {t('سلة الطلبات فارغة حالياً', 'Your Shopping Cart is Empty')}
        </h1>
        <p className="text-sm text-[#20252B]/70 max-w-md mx-auto">
          {t(
            'اختر منتجاتك المفضلة من مطعم فودو التجريبي أو مقهى فودو التجريبي وابدأ طلبك الآن.',
            'Browse FOODOO Restaurant Demo or FOODOO Café Demo to add items to your order.'
          )}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/menu/foodoo-restaurant')}
            className="px-6 py-3 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
          >
            {t('منيو مطعم فودو', 'FOODOO Restaurant Menu')}
          </button>
          <button
            onClick={() => navigate('/menu/foodoo-cafe')}
            className="px-6 py-3 bg-[#20252B] hover:bg-[#20252B]/90 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
          >
            {t('منيو مقهى فودو', 'FOODOO Café Menu')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#FF6B35]">
            {t('طلب مخصص لمنشأة واحدة', 'Single-Business Order Cart')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20252B]">
            {t('سلة الطلبات:', 'Your Cart:')}{' '}
            {lang === 'ar' ? cartBusiness.nameAr : cartBusiness.nameEn}
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>{t('تفريغ السلة بالكامل', 'Clear Entire Cart')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#20252B]/10 divide-y divide-[#20252B]/10">
          {cart.map((item) => (
            <div
              key={item.cartItemId}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <FoodVisual
                    imageKey={item.product.imageKey}
                    alt={
                      lang === 'ar' ? item.product.nameAr : item.product.nameEn
                    }
                    className="w-full h-full"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#20252B]">
                    {lang === 'ar' ? item.product.nameAr : item.product.nameEn}
                  </h3>
                  <div className="text-xs text-[#20252B]/65">
                    <span>{item.selectedOption}</span>
                    <span aria-hidden="true"> · </span>
                    <span className="tabular-nums">
                      {item.product.priceSar} {t('ر.س للوحدة', 'SAR each')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="flex items-center gap-2 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#20252B]/10">
                  <button
                    onClick={() => updateCartQuantity(item.cartItemId, -1)}
                    className="p-1 text-[#20252B] hover:text-[#FF6B35] cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono-tabular text-sm font-bold w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(item.cartItemId, 1)}
                    className="p-1 text-[#20252B] hover:text-[#FF6B35] cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-base font-extrabold text-[#20252B] tabular-nums w-20 text-end">
                  {item.product.priceSar * item.quantity} {t('ر.س', 'SAR')}
                </div>

                <button
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="text-[#20252B]/40 hover:text-red-600 p-1 cursor-pointer"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#20252B]/10 p-6 space-y-5">
          <h2 className="text-lg font-extrabold text-[#20252B]">
            {t('ملخص الطلب', 'Order Summary')}
          </h2>

          <div className="space-y-3 text-sm border-b border-[#20252B]/10 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-[#20252B]/70">
                {t('المجموع الفرعي للمنتجات', 'Items Subtotal')}
              </span>
              <span className="font-bold tabular-nums">
                {cartSubtotalSar} {t('ر.س', 'SAR')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#20252B]/70">
                {t('رسوم التوصيل التجريبي', 'Test Delivery Fee')}
              </span>
              <span className="text-xs text-[#20252B]/65 tabular-nums">
                {t(
                  `مجاني للاستلام أو ${cartBusiness.deliveryFeeSar} ر.س للتوصيل`,
                  `0 SAR Pickup / ${cartBusiness.deliveryFeeSar} SAR Delivery`
                )}
              </span>
            </div>
          </div>

          {activeSquad ? (
            <div className="bg-[#FF6B35]/10 rounded-xl p-3.5 text-xs text-[#20252B] space-y-1">
              <div className="font-bold text-[#FF6B35] flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>
                  {t('مرتبط بسكوادك النشط:', 'Linked to Active Squad:')}
                </span>
              </div>
              <div className="font-semibold">{activeSquad.name}</div>
              <div className="text-[#20252B]/70">
                {t(
                  'سيمنح هذا الطلب +1 نقطة لسكوادك فور اكتماله من التاجر.',
                  'Earns +1 Squad point upon order completion.'
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF8F5] rounded-xl p-3.5 text-xs text-[#20252B]/75">
              {t(
                'نصيحة: انضم إلى سكواد قبل الطلب ليكسب فريقك +1 نقطة عند اكتمال الطلب!',
                'Tip: Join a Foodoo Squad so your completed order earns +1 team point!'
              )}{' '}
              <Link
                to="/squads"
                className="text-[#FF6B35] font-bold hover:underline"
              >
                {t('تصفح السكوادز', 'Browse Squads')}
              </Link>
            </div>
          )}

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
          >
            {t('المتابعة لإتمام الطلب', 'Proceed to Checkout')}
          </button>

          <Link
            to={`/menu/${cartBusiness.id}`}
            className="block text-center text-xs font-bold text-[#20252B]/70 hover:text-[#20252B]"
          >
            {t('+ إضافة المزيد من المنتجات', '+ Add More Items')}
          </Link>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. CHECKOUT PAGE (/checkout)
// ============================================================================
export const CheckoutPage: React.FC = () => {
  const {
    lang,
    t,
    user,
    userProfile,
    userPrivate,
    cart,
    cartBusiness,
    cartSubtotalSar,
    placeOrder,
    signInWithGoogle,
    squads,
  } = useApp();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(
    userProfile?.displayName || user?.displayName || ''
  );
  const [customerPhone, setCustomerPhone] = useState(
    userPrivate?.phone || '0501234567'
  );
  const [fulfillmentType, setFulfillmentType] =
    useState<FulfillmentType>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState(
    userPrivate?.defaultAddress || 'الرياض - حي الملقا، شارع أنس بن مالك'
  );
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (userProfile?.displayName && !customerName) {
      setCustomerName(userProfile.displayName);
    }
    if (userPrivate?.phone && customerPhone === '0501234567') {
      setCustomerPhone(userPrivate.phone);
    }
    if (userPrivate?.defaultAddress) {
      setDeliveryAddress(userPrivate.defaultAddress);
    }
  }, [userProfile, userPrivate]);

  if (cart.length === 0 || !cartBusiness) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">
          {t('السلة فارغة', 'Your cart is empty')}
        </h1>
        <button
          onClick={() => navigate('/restaurants')}
          className="px-6 py-2.5 bg-[#FF6B35] text-white font-bold rounded-xl cursor-pointer"
        >
          {t('العودة للمطاعم والمقاهي', 'Back to Stores')}
        </button>
      </div>
    );
  }

  const deliveryFee =
    fulfillmentType === 'delivery' ? cartBusiness.deliveryFeeSar : 0;
  const finalTotal = cartSubtotalSar + deliveryFee;
  const activeSquad = squads.find((s) => s.id === userProfile?.activeSquadId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      await signInWithGoogle();
      return;
    }

    if (fulfillmentType === 'delivery' && deliveryAddress.trim().length < 5) {
      setErrorMsg(
        t(
          'يرجى إدخال عنوان التوصيل في الرياض',
          'Please enter a valid delivery address in Riyadh'
        )
      );
      return;
    }

    setSubmitting(true);
    try {
      const orderId = await placeOrder({
        customerName,
        customerPhone,
        fulfillmentType,
        deliveryAddress:
          fulfillmentType === 'delivery' ? deliveryAddress : 'Pickup from Branch',
        notes,
      });
      navigate(`/orders/${orderId}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <div className="text-xs font-semibold text-[#FF6B35]">
          {t('الخطوة الأخيرة لتأكيد الطلب', 'Final Step — Order Confirmation')}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20252B]">
          {t('إتمام الطلب (دفع تجريبي فقط)', 'Checkout (Demo Payment Only)')}
        </h1>
      </div>

      {!user && (
        <div className="bg-[#20252B] text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#FF6B35]">
              {t(
                'يرجى تسجيل الدخول لحفظ طلبك في قاعدة بيانات Firestore',
                'Sign in required to save your real order to Cloud Firestore'
              )}
            </h3>
            <p className="text-xs text-white/75">
              {t(
                'يتطلب النظام تسجيل الدخول بحساب Google لربط الطلب بحسابك وسكوادك ولوحة التاجر.',
                'Sign in with Google so your order is linked to your profile, Squad points, and the live Merchant Dashboard.'
              )}
            </p>
          </div>
          <button
            onClick={signInWithGoogle}
            className="px-5 py-2.5 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-xs font-bold rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('تسجيل الدخول بحساب Google', 'Sign in with Google')}
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#20252B]/10 p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customer Name & Saudi Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#20252B]">
                {t('اسم العميل *', 'Customer Name *')}
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t('الاسم الكامل', 'Full Name')}
                className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl focus:outline-none focus:border-[#FF6B35]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#20252B]">
                {t(
                  'رقم الجوال السعودي (05XXXXXXXX) *',
                  'Saudi Phone Number (05XXXXXXXX) *'
                )}
              </label>
              <input
                type="tel"
                required
                dir="ltr"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0501234567"
                className="w-full px-4 py-2.5 text-sm font-mono-tabular bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
          </div>

          {/* Fulfillment Type: Pickup or Test Delivery */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#20252B]">
              {t('طريقة الاستلام', 'Fulfillment Method')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfillmentType('delivery')}
                className={`p-3.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  fulfillmentType === 'delivery'
                    ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#20252B]'
                    : 'border-[#20252B]/15 text-[#20252B]/70'
                }`}
              >
                {t(
                  `توصيل تجريبي (+${cartBusiness.deliveryFeeSar} ر.س)`,
                  `Test Delivery (+${cartBusiness.deliveryFeeSar} SAR)`
                )}
              </button>
              <button
                type="button"
                onClick={() => setFulfillmentType('pickup')}
                className={`p-3.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  fulfillmentType === 'pickup'
                    ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#20252B]'
                    : 'border-[#20252B]/15 text-[#20252B]/70'
                }`}
              >
                {t('استلام من الفرع (مجاني)', 'Branch Pickup (Free)')}
              </button>
            </div>
          </div>

          {/* Delivery Address */}
          {fulfillmentType === 'delivery' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#20252B]">
                {t('عنوان التوصيل في الرياض', 'Delivery Address in Riyadh')}
              </label>
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder={t(
                  'مثال: الرياض - حي العليا، شارع التخصصي',
                  'e.g. Riyadh, Al Olaya District'
                )}
                className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
          )}

          {/* Order Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#20252B]">
              {t('ملاحظات الطلب (اختياري)', 'Order Notes (Optional)')}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t(
                'أي تعليمات خاصة للمطبخ أو التحضير...',
                'Special instructions for kitchen or preparation...'
              )}
              className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl focus:outline-none focus:border-[#FF6B35]"
            />
          </div>

          {/* Payment Method: DEMO PAYMENT ONLY */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#20252B]/15 space-y-1">
            <div className="text-xs font-extrabold text-[#20252B] flex items-center justify-between">
              <span>{t('طريقة الدفع المعتمدة:', 'Payment Method:')}</span>
              <span className="text-[#FF6B35]">DEMO PAYMENT ONLY</span>
            </div>
            <p className="text-xs text-[#20252B]/70">
              {t(
                'دفع تجريبي فقط لأغراض اختبار النسخة التجريبية V1 — لا يتم سحب أو تحصيل أي أموال حقيقية إطلاقاً.',
                'Demo payment only for Pilot V1 testing — no real money is ever charged.'
              )}
            </p>
          </div>
        </div>

        {/* Summary & Confirm Button */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#20252B]/10 p-6 space-y-5">
          <div>
            <div className="text-xs text-[#20252B]/60">
              {t('الطلب موجه إلى:', 'Ordering from:')}
            </div>
            <h2 className="text-lg font-extrabold text-[#20252B]">
              {lang === 'ar' ? cartBusiness.nameAr : cartBusiness.nameEn}
            </h2>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto divide-y divide-[#20252B]/5 text-xs">
            {cart.map((item) => (
              <div
                key={item.cartItemId}
                className="py-2 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold tabular-nums">
                    {item.quantity}x
                  </span>{' '}
                  <span className="font-semibold">
                    {lang === 'ar' ? item.product.nameAr : item.product.nameEn}
                  </span>
                  <div className="text-[#20252B]/60">{item.selectedOption}</div>
                </div>
                <span className="font-bold tabular-nums shrink-0">
                  {item.product.priceSar * item.quantity} {t('ر.س', 'SAR')}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#20252B]/10 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-[#20252B]/70">
              <span>{t('المجموع الفرعي', 'Subtotal')}</span>
              <span className="tabular-nums">
                {cartSubtotalSar} {t('ر.س', 'SAR')}
              </span>
            </div>
            <div className="flex justify-between text-[#20252B]/70">
              <span>{t('رسوم التوصيل', 'Delivery Fee')}</span>
              <span className="tabular-nums">
                {deliveryFee} {t('ر.س', 'SAR')}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-[#20252B] pt-2 border-t border-[#20252B]/10">
              <span>{t('الإجمالي النهائي', 'Total')}</span>
              <span className="text-[#FF6B35] tabular-nums">
                {finalTotal} {t('ر.س', 'SAR')}
              </span>
            </div>
          </div>

          {activeSquad && (
            <div className="p-3 rounded-xl bg-[#FF6B35]/10 text-xs text-[#20252B]">
              <span className="font-bold text-[#FF6B35]">
                {t('فودو سكوادز:', 'Foodoo Squads:')}
              </span>{' '}
              {t(
                `سيتم ربط الطلب بسكواد "${activeSquad.name}" لمنحكم +1 نقطة عند الاكتمال.`,
                `Order will be linked to "${activeSquad.name}" (+1 point when completed).`
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting
              ? t('جاري حفظ الطلب في Firestore...', 'Saving Order to Firestore...')
              : user
              ? t('تأكيد وإرسال الطلب الآن', 'Confirm & Place Demo Order')
              : t('سجل الدخول وتابع الطلب', 'Sign In & Confirm Order')}
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================================================
// 6. ORDERS LIST (/orders) & LIVE ORDER TRACKING (/orders/:id)
// ============================================================================
export const STATUS_LABELS: Record<
  OrderStatus,
  { ar: string; en: string; colorClass: string }
> = {
  pending: {
    ar: 'بانتظار قبول التاجر',
    en: 'Pending Acceptance',
    colorClass: 'text-amber-700 bg-amber-50',
  },
  accepted: {
    ar: 'تم قبول الطلب',
    en: 'Accepted',
    colorClass: 'text-blue-700 bg-blue-50',
  },
  preparing: {
    ar: 'قيد التحضير في المطبخ',
    en: 'Preparing',
    colorClass: 'text-orange-700 bg-orange-50',
  },
  ready: {
    ar: 'جاهز للاستلام / التسليم',
    en: 'Ready for Pickup/Delivery',
    colorClass: 'text-purple-700 bg-purple-50',
  },
  completed: {
    ar: 'مكتمل',
    en: 'Completed',
    colorClass: 'text-emerald-700 bg-emerald-50',
  },
  cancelled: {
    ar: 'ملغي',
    en: 'Cancelled',
    colorClass: 'text-red-700 bg-red-50',
  },
};

export const OrdersPage: React.FC = () => {
  const { lang, t, user, customerOrders, signInWithGoogle } = useApp();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-[#20252B]">
          {t('سجل طلباتي وتتبع الحالة', 'My Orders & Live Tracking')}
        </h1>
        <p className="text-sm text-[#20252B]/70">
          {t(
            'يرجى تسجيل الدخول لعرض طلباتك المحفوظة وتتبع حالتها مباشرة.',
            'Sign in to view your saved orders and real-time tracking.'
          )}
        </p>
        <button
          onClick={signInWithGoogle}
          className="px-6 py-3 bg-[#FF6B35] text-white text-sm font-bold rounded-xl cursor-pointer"
        >
          {t('تسجيل الدخول بحساب Google', 'Sign in with Google')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-[#FF6B35]">
            {t('مزامنة فورية عبر Cloud Firestore', 'Real-Time Firestore Sync')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20252B]">
            {t('طلباتي وتتبع الحالة', 'My Orders')}
          </h1>
        </div>
        <button
          onClick={() => navigate('/restaurants')}
          className="px-4 py-2 bg-[#20252B] text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          {t('+ طلب جديد', '+ New Order')}
        </button>
      </div>

      {customerOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#20252B]/10 p-10 text-center space-y-4">
          <p className="text-sm text-[#20252B]/70">
            {t('لم تقم بإرسال أي طلبات بعد.', 'You have not placed any orders yet.')}
          </p>
          <button
            onClick={() => navigate('/menu/foodoo-restaurant')}
            className="px-5 py-2.5 bg-[#FF6B35] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            {t('اطلب الآن من مطعم فودو', 'Order Now from FOODOO Restaurant')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {customerOrders.map((ord) => {
            const st = STATUS_LABELS[ord.status];
            return (
              <div
                key={ord.id}
                onClick={() => navigate(`/orders/${ord.id}`)}
                className="bg-white rounded-2xl border border-[#20252B]/10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#FF6B35] transition-colors cursor-pointer"
              >
                <div className="space-y-1.5">
                  <div className="text-xs text-[#20252B]/65 flex flex-wrap items-center gap-2">
                    <span className="font-mono-tabular font-bold text-[#20252B]">
                      {ord.orderNumber}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {lang === 'ar' ? ord.businessNameAr : ord.businessNameEn}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className={`font-bold ${st.colorClass} px-2 py-0.5 rounded`}>
                      {lang === 'ar' ? st.ar : st.en}
                    </span>
                    {ord.squadId && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#FF6B35] font-semibold">
                          {ord.squadPointAwarded
                            ? t('+1 نقطة سكواد مكتسبة', '+1 Squad Pt Earned')
                            : t('مرتبط بالسكواد', 'Squad Order')}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-[#20252B]/75">
                    {ord.itemsSummary.join(' ، ')}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-lg font-extrabold text-[#20252B] tabular-nums">
                    {ord.totalSar} {t('ر.س', 'SAR')}
                  </div>
                  <span className="text-xs font-bold text-[#FF6B35]">
                    {t('تتبع الطلب ←', 'Track Order →')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    lang,
    t,
    customerOrders,
    merchantOrders,
    assignMerchantBusiness,
  } = useApp();
  const navigate = useNavigate();

  const order =
    customerOrders.find((o) => o.id === id) ||
    merchantOrders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-bold">
          {t('جاري تحميل تفاصيل الطلب...', 'Loading Order Details...')}
        </h1>
        <Link
          to="/orders"
          className="inline-block text-sm font-bold text-[#FF6B35] hover:underline"
        >
          {t('العودة إلى قائمة الطلبات', 'Back to My Orders')}
        </Link>
      </div>
    );
  }

  const steps: OrderStatus[] = [
    'pending',
    'accepted',
    'preparing',
    'ready',
    'completed',
  ];
  const currentStepIdx = steps.indexOf(order.status);

  const handleOpenMerchantForThisOrder = async () => {
    await assignMerchantBusiness(order.businessId);
    navigate('/merchant/orders');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Confirmation Banner */}
      <div className="bg-[#20252B] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#FF6B35] text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {t(
                'تم تسجيل الطلب في قاعدة بيانات Firestore وتوجيهه للتاجر',
                'Order Persisted in Firestore & Sent to Merchant Dashboard'
              )}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-mono-tabular">
            {t('طلب رقم', 'Order')} {order.orderNumber}
          </h1>
          <div className="text-xs text-white/75">
            <span>
              {lang === 'ar' ? order.businessNameAr : order.businessNameEn}
            </span>
            <span aria-hidden="true"> · </span>
            <span>
              {order.fulfillmentType === 'delivery'
                ? t('توصيل تجريبي', 'Test Delivery')
                : t('استلام من الفرع', 'Branch Pickup')}
            </span>
            <span aria-hidden="true"> · </span>
            <span>DEMO PAYMENT ONLY</span>
          </div>
        </div>

        <button
          onClick={handleOpenMerchantForThisOrder}
          className="px-5 py-3 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {t(
            'افتح لوحة التاجر لإدارة هذا الطلب الآن ←',
            'Open Merchant Dashboard to Fulfill This Order →'
          )}
        </button>
      </div>

      {/* Live Status Stepper */}
      <div className="bg-white rounded-2xl border border-[#20252B]/10 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#20252B]">
            {t('حالة الطلب المباشرة', 'Live Order Status')}
          </h2>
          <span className="text-xs font-bold text-[#FF6B35]">
            {lang === 'ar'
              ? STATUS_LABELS[order.status].ar
              : STATUS_LABELS[order.status].en}
          </span>
        </div>

        {order.status === 'cancelled' ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
            {t(
              'تم إلغاء هذا الطلب. الطلبات الملغاة لا تمنح نقاط سكواد.',
              'This order was cancelled. Cancelled orders do not earn Squad points.'
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {steps.map((st, idx) => {
              const isDone = currentStepIdx >= idx;
              return (
                <div
                  key={st}
                  className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    isDone
                      ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#20252B]'
                      : 'border-[#20252B]/10 text-[#20252B]/45'
                  }`}
                >
                  <div className="font-mono-tabular font-bold text-[#FF6B35]">
                    0{idx + 1}
                  </div>
                  <div className="font-bold">
                    {lang === 'ar'
                      ? STATUS_LABELS[st].ar
                      : STATUS_LABELS[st].en}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {order.squadId && (
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#20252B]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-[#FF6B35]">
                {t('حالة نقاط فودو سكوادز:', 'Foodoo Squads Point Status:')}
              </span>{' '}
              <span className="font-semibold text-[#20252B]">
                {order.squadName}
              </span>
            </div>
            <div className="font-bold">
              {order.squadPointAwarded
                ? t(
                    'تم منح +1 نقطة للسكواد بنجاح!',
                    '+1 Squad Point Awarded!'
                  )
                : order.status === 'cancelled'
                ? t('0 نقطة (طلب ملغي)', '0 Points (Order Cancelled)')
                : t(
                    'تُمنح +1 نقطة تلقائياً عند اكتمال الطلب',
                    '+1 Point awarded automatically when order is marked Completed'
                  )}
            </div>
          </div>
        )}
      </div>

      {/* Order Receipt Details */}
      <div className="bg-white rounded-2xl border border-[#20252B]/10 p-6 space-y-4">
        <h3 className="text-base font-extrabold text-[#20252B]">
          {t('تفاصيل الفاتورة والمنتجات', 'Order Items & Receipt')}
        </h3>
        <div className="space-y-2 text-xs text-[#20252B]/80 border-b border-[#20252B]/10 pb-4">
          {order.itemsSummary.map((line, i) => (
            <div key={i} className="py-1 font-medium">
              {line}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#20252B]/75">
          <div>
            <div>
              <span className="font-bold">{t('العميل:', 'Customer:')}</span>{' '}
              {order.customerName}
            </div>
            <div>
              <span className="font-bold">{t('الجوال:', 'Phone:')}</span>{' '}
              <span className="font-mono-tabular">{order.customerPhone}</span>
            </div>
            <div>
              <span className="font-bold">{t('العنوان:', 'Address:')}</span>{' '}
              {order.deliveryAddress}
            </div>
          </div>
          <div className="space-y-1 sm:text-end">
            <div>
              {t('المجموع الفرعي:', 'Subtotal:')}{' '}
              <span className="font-bold tabular-nums">
                {order.subtotalSar} {t('ر.س', 'SAR')}
              </span>
            </div>
            <div>
              {t('رسوم التوصيل:', 'Delivery Fee:')}{' '}
              <span className="font-bold tabular-nums">
                {order.deliveryFeeSar} {t('ر.س', 'SAR')}
              </span>
            </div>
            <div className="text-base font-extrabold text-[#FF6B35] tabular-nums">
              {t('الإجمالي:', 'Total:')} {order.totalSar} {t('ر.س', 'SAR')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
