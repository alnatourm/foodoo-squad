import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  CheckCircle2,
  ClipboardList,
  Edit3,
  Globe,
  LayoutDashboard,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Store,
  Trash2,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import {
  ALLOWED_STATUS_TRANSITIONS,
  useApp,
} from '../context/AppContext';
import { STATUS_LABELS } from './CustomerPages';
import { FoodVisual } from '../components/FoodVisual';
import { BusinessId, OrderStatus, Product } from '../types';

const IMAGE_KEY_OPTIONS = [
  { key: 'burger-double', labelAr: 'دبل واغيو برجر', labelEn: 'Double Burger' },
  { key: 'burger-truffle', labelAr: 'ترافل برجر', labelEn: 'Truffle Burger' },
  { key: 'burger-classic', labelAr: 'كلاسيك برجر', labelEn: 'Classic Burger' },
  { key: 'chicken-spicy', labelAr: 'برجر دجاج حار', labelEn: 'Spicy Chicken' },
  { key: 'chicken-strips', labelAr: 'ستربس دجاج', labelEn: 'Chicken Tenders' },
  { key: 'meal-family', labelAr: 'بوكس عائلي / سكواد', labelEn: 'Squad Box' },
  { key: 'sides-fries', labelAr: 'بطاطس بالجبنة', labelEn: 'Loaded Fries' },
  { key: 'drink-mojito', labelAr: 'موهيتو منعش', labelEn: 'Mojito Drink' },
  { key: 'drink-cola', labelAr: 'مشروب كولا', labelEn: 'Craft Cola' },
  { key: 'coffee-v60', labelAr: 'قهوة مقطرة V60', labelEn: 'V60 Coffee' },
  { key: 'coffee-flatwhite', labelAr: 'فلات وايت', labelEn: 'Flat White' },
  { key: 'iced-spanish', labelAr: 'آيس سبانيش لاتيه', labelEn: 'Iced Spanish Latte' },
  { key: 'iced-pistachio', labelAr: 'آيس بيستاشيو لاتيه', labelEn: 'Iced Pistachio' },
  { key: 'tea-karak', labelAr: 'شاي كرك بالزعفران', labelEn: 'Karak Tea' },
  { key: 'dessert-basque', labelAr: 'تشيزكيك سان سيباستيان', labelEn: 'Basque Cheesecake' },
  { key: 'bakery-croissant', labelAr: 'كرواسون الفستق', labelEn: 'Pistachio Croissant' },
];

// ============================================================================
// MERCHANT WORKSPACE SHELL (Sidebar + Contextual Header + Toast)
// ============================================================================
export const MerchantShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    lang,
    setLang,
    t,
    user,
    userProfile,
    businesses,
    merchantOrders,
    assignMerchantBusiness,
    signInWithGoogle,
    toastMessage,
    clearToast,
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const assignedBizId: BusinessId =
    userProfile?.assignedBusinessId || 'foodoo-restaurant';
  const business =
    businesses.find((b) => b.id === assignedBizId) || businesses[0];

  const pendingOrdersCount = merchantOrders.filter(
    (o) => o.status === 'pending'
  ).length;

  const navItems = [
    {
      path: '/merchant',
      labelAr: 'نظرة عامة',
      labelEn: 'Overview',
      icon: LayoutDashboard,
    },
    {
      path: '/merchant/orders',
      labelAr: 'الطلبات الواردة',
      labelEn: 'Orders',
      icon: ClipboardList,
      badge: pendingOrdersCount,
    },
    {
      path: '/merchant/menu',
      labelAr: 'إدارة المنيو والأصناف',
      labelEn: 'Menu CRUD',
      icon: UtensilsCrossed,
    },
    {
      path: '/merchant/analytics',
      labelAr: 'الإحصائيات والمبيعات',
      labelEn: 'Analytics',
      icon: BarChart3,
    },
    {
      path: '/merchant/squads',
      labelAr: 'طلبات فودو سكوادز',
      labelEn: 'Squad Orders',
      icon: Users,
    },
    {
      path: '/merchant/settings',
      labelAr: 'إعدادات المنشأة',
      labelEn: 'Settings',
      icon: Settings,
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-[#20252B]/10 max-w-md w-full p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#20252B]">
            {t('بوابة التاجر وإدارة المنشآت', 'FOODOO Merchant Portal')}
          </h1>
          <p className="text-xs text-[#20252B]/70 leading-relaxed">
            {t(
              'يتطلب الوصول إلى لوحة تحكم المطعم أو المقهى تسجيل الدخول للتحقق من صلاحية المنشأة المعينة لك في قواعد أمان Firestore.',
              'Sign in with Google to verify your assigned business role and access live orders, menu CRUD, and sales analytics.'
            )}
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full py-3 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-sm font-bold rounded-xl cursor-pointer"
          >
            {t('تسجيل الدخول بحساب Google', 'Sign in with Google')}
          </button>
          <Link
            to="/"
            className="block text-xs font-bold text-[#20252B]/60 hover:text-[#20252B]"
          >
            {t('العودة لموقع العملاء ←', 'Back to Customer Website →')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#20252B] flex flex-col lg:flex-row">
      {/* Sidebar Navigation (260px on desktop) */}
      <aside className="w-full lg:w-64 bg-[#20252B] text-white shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-e border-white/10">
        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between">
            <Link
              to="/merchant"
              className="text-xl font-extrabold text-[#FF6B35] tracking-tight"
            >
              {t('فودو أعمال · Merchant', 'FOODOO Merchant')}
            </Link>
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="text-xs text-white/75 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>
          </div>

          {/* Assigned Business Isolation Indicator & Switcher */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2.5">
            <div className="text-[11px] text-[#FF6B35] font-bold">
              {t('المنشأة المعينة حالياً (بيانات معزولة):', 'Assigned Business (Isolated):')}
            </div>
            <div className="text-sm font-extrabold text-white">
              {lang === 'ar' ? business.nameAr : business.nameEn}
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => assignMerchantBusiness('foodoo-restaurant')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  assignedBizId === 'foodoo-restaurant'
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                {t('المطعم', 'Restaurant')}
              </button>
              <button
                onClick={() => assignMerchantBusiness('foodoo-cafe')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  assignedBizId === 'foodoo-cafe'
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                {t('المقهى', 'Café')}
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#FF6B35] text-white'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[11px] font-mono-tabular font-extrabold rounded-md bg-white text-[#20252B]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-5 border-t border-white/10 hidden lg:block space-y-2">
          <button
            onClick={() => navigate(`/menu/${business.id}`)}
            className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>{t('معاينة منيو العميل', 'Preview Customer Menu')}</span>
          </button>
          <Link
            to="/"
            className="block text-center text-xs text-white/60 hover:text-white py-1"
          >
            {t('العودة للموقع الرئيسي ←', 'Return to Storefront →')}
          </Link>
        </div>
      </aside>

      {/* Main Workspace Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract: Breadcrumb on start, 1-2 primary actions on end */}
        <header className="h-16 bg-white border-b border-[#20252B]/10 px-6 flex items-center justify-between gap-4">
          <div className="text-xs sm:text-sm font-bold text-[#20252B] truncate">
            <span className="text-[#20252B]/50">
              {t('بوابة التاجر', 'Merchant')} /
            </span>{' '}
            <span>{lang === 'ar' ? business.nameAr : business.nameEn}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {pendingOrdersCount > 0 && (
              <button
                onClick={() => navigate('/merchant/orders')}
                className="px-3.5 py-2 bg-[#FF6B35] text-white text-xs font-bold rounded-xl flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="tabular-nums">
                  {pendingOrdersCount}{' '}
                  {t('طلب جديد بانتظار القبول!', 'New Pending Order(s)!')}
                </span>
              </button>
            )}
            <Link
              to={`/menu/${business.id}`}
              className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#20252B]/10 text-[#20252B] text-xs font-bold rounded-xl border border-[#20252B]/10 whitespace-nowrap shrink-0"
            >
              {t('فتح صفحة المتجر', 'View Storefront')}
            </Link>
          </div>
        </header>

        {toastMessage && (
          <div className="fixed bottom-6 end-6 z-50 max-w-md bg-[#20252B] text-white px-4 py-3 rounded-xl shadow-lg border border-white/10 flex items-center justify-between gap-3">
            <span className="text-sm font-medium">{toastMessage.text}</span>
            <button
              onClick={clearToast}
              className="text-white/60 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <main className="p-6 sm:p-8 flex-1 space-y-8">{children}</main>
      </div>
    </div>
  );
};

// ============================================================================
// 1. MERCHANT OVERVIEW (/merchant)
// ============================================================================
export const MerchantOverviewPage: React.FC = () => {
  const {
    lang,
    t,
    userProfile,
    businesses,
    products,
    merchantOrders,
    updateOrderStatus,
  } = useApp();
  const navigate = useNavigate();

  const assignedBizId = userProfile?.assignedBusinessId || 'foodoo-restaurant';
  const business =
    businesses.find((b) => b.id === assignedBizId) || businesses[0];

  const bizProducts = useMemo(
    () => products.filter((p) => p.businessId === business.id),
    [products, business.id]
  );

  const validOrders = useMemo(
    () => merchantOrders.filter((o) => o.status !== 'cancelled'),
    [merchantOrders]
  );

  const totalRevenueSar = useMemo(
    () => validOrders.reduce((s, o) => s + o.totalSar, 0),
    [validOrders]
  );

  const avgOrderValueSar = useMemo(
    () =>
      validOrders.length > 0
        ? Math.round(totalRevenueSar / validOrders.length)
        : 0,
    [totalRevenueSar, validOrders.length]
  );

  const squadOrdersCount = useMemo(
    () => merchantOrders.filter((o) => Boolean(o.squadId)).length,
    [merchantOrders]
  );

  const activeIncomingOrders = useMemo(
    () =>
      merchantOrders.filter(
        (o) => !['completed', 'cancelled'].includes(o.status)
      ),
    [merchantOrders]
  );

  return (
    <MerchantShell>
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#20252B]/10 p-5">
          <div className="text-xs text-[#20252B]/60">
            {t('إجمالي المبيعات (غير شاملة الملغي)', 'Total Sales Revenue')}
          </div>
          <div className="text-2xl font-extrabold text-[#20252B] font-mono-tabular mt-1">
            {totalRevenueSar} {t('ر.س', 'SAR')}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#20252B]/10 p-5">
          <div className="text-xs text-[#20252B]/60">
            {t('إجمالي عدد الطلبات', 'Total Order Count')}
          </div>
          <div className="text-2xl font-extrabold text-[#20252B] font-mono-tabular mt-1">
            {merchantOrders.length}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#20252B]/10 p-5">
          <div className="text-xs text-[#20252B]/60">
            {t('متوسط قيمة الطلب (AOV)', 'Average Order Value')}
          </div>
          <div className="text-2xl font-extrabold text-[#FF6B35] font-mono-tabular mt-1">
            {avgOrderValueSar} {t('ر.س', 'SAR')}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#20252B]/10 p-5">
          <div className="text-xs text-[#20252B]/60">
            {t('الطلبات المرتبطة بفودو سكوادز', 'Orders Associated with Squads')}
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono-tabular mt-1">
            {squadOrdersCount}
          </div>
        </div>
      </div>

      {/* Live Active Orders Queue */}
      <div className="bg-white rounded-2xl border border-[#20252B]/10 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#20252B]">
              {t(
                'الطلبات النشطة الواردة الآن',
                'Live Incoming & Active Orders'
              )}
            </h2>
            <p className="text-xs text-[#20252B]/65">
              {t(
                'أي تغيير في حالة الطلب ينعكس فوراً في شاشة تتبع الطلب لدى العميل.',
                'Status updates sync immediately to the customer tracking screen.'
              )}
            </p>
          </div>
          <button
            onClick={() => navigate('/merchant/orders')}
            className="text-xs font-bold text-[#FF6B35] hover:underline cursor-pointer"
          >
            {t('عرض كل الطلبات ←', 'View All Orders →')}
          </button>
        </div>

        {activeIncomingOrders.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#FAF8F5] text-center space-y-3">
            <p className="text-xs text-[#20252B]/70">
              {t(
                'لا توجد طلبات قيد التنفيذ حالياً لهذه المنشأة. قم بإنشاء طلب تجريبي من صفحة المنيو لتجربة التدفق المباشر!',
                'No active orders right now. Place a test order from the customer menu to test live fulfillment!'
              )}
            </p>
            <button
              onClick={() => navigate(`/menu/${business.id}`)}
              className="px-4 py-2 bg-[#FF6B35] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              {t('إنشاء طلب تجريبي كعميل', 'Place a Test Order as Customer')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeIncomingOrders.map((ord) => {
              const allowedNext = ALLOWED_STATUS_TRANSITIONS[ord.status] || [];
              return (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#20252B]/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="text-xs flex flex-wrap items-center gap-2">
                      <span className="font-mono-tabular font-extrabold text-sm text-[#20252B]">
                        {ord.orderNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold text-[#FF6B35]">
                        {lang === 'ar'
                          ? STATUS_LABELS[ord.status].ar
                          : STATUS_LABELS[ord.status].en}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{ord.customerName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">
                        {ord.customerPhone}
                      </span>
                      {ord.squadId && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-bold">
                            {t('سكواد:', 'Squad:')} {ord.squadName}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-[#20252B]/80 font-medium">
                      {ord.itemsSummary.join(' ، ')}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {allowedNext.map((nextSt) => (
                      <button
                        key={nextSt}
                        onClick={() => updateOrderStatus(ord, nextSt)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                          nextSt === 'cancelled'
                            ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                            : 'bg-[#FF6B35] hover:bg-[#e85a25] text-white'
                        }`}
                      >
                        {nextSt === 'accepted' &&
                          t('قبول الطلب (Accept)', 'Accept Order')}
                        {nextSt === 'preparing' &&
                          t('بدء التحضير (Preparing)', 'Start Preparing')}
                        {nextSt === 'ready' &&
                          t('جاهز للتسليم (Ready)', 'Mark Ready')}
                        {nextSt === 'completed' &&
                          t(
                            'إكمال الطلب (+1 نقطة سكواد)',
                            'Complete Order (+1 Squad Pt)'
                          )}
                        {nextSt === 'cancelled' && t('إلغاء', 'Cancel')}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Menu Summary Card */}
      <div className="bg-white rounded-2xl border border-[#20252B]/10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-[#20252B]">
            {t('حالة المنيو والأصناف المتاحة', 'Menu Availability Summary')}
          </h3>
          <p className="text-xs text-[#20252B]/65 mt-0.5">
            {bizProducts.filter((p) => p.isAvailable).length}{' '}
            {t('صنف متوفر حالياً من أصل', 'available items out of')}{' '}
            {bizProducts.length}
          </p>
        </div>
        <button
          onClick={() => navigate('/merchant/menu')}
          className="px-5 py-2.5 bg-[#20252B] text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          {t('إدارة المنيو والأسعار ←', 'Manage Menu & Prices →')}
        </button>
      </div>
    </MerchantShell>
  );
};

// ============================================================================
// 2. MERCHANT ORDERS PAGE (/merchant/orders)
// ============================================================================
export const MerchantOrdersPage: React.FC = () => {
  const { lang, t, merchantOrders, updateOrderStatus } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'ALL') return merchantOrders;
    return merchantOrders.filter((o) => o.status === statusFilter);
  }, [merchantOrders, statusFilter]);

  const filterTabs: { key: string; ar: string; en: string }[] = [
    { key: 'ALL', ar: 'الكل', en: 'All' },
    { key: 'pending', ar: 'جديد (Pending)', en: 'Pending' },
    { key: 'accepted', ar: 'مقبول (Accepted)', en: 'Accepted' },
    { key: 'preparing', ar: 'قيد التحضير (Preparing)', en: 'Preparing' },
    { key: 'ready', ar: 'جاهز (Ready)', en: 'Ready' },
    { key: 'completed', ar: 'مكتمل (Completed)', en: 'Completed' },
    { key: 'cancelled', ar: 'ملغي (Cancelled)', en: 'Cancelled' },
  ];

  return (
    <MerchantShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#20252B]">
            {t('إدارة الطلبات الواردة', 'Incoming Orders Management')}
          </h1>
          <p className="text-xs text-[#20252B]/65">
            {t(
              'يمنع النظام الانتقالات غير القانونية لحالة الطلب (مثل تخطي التحضير أو تعديل طلب مكتمل).',
              'Strict state machine enforced: illegal order status transitions are prevented.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-[#20252B]/5 rounded-xl overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-[#20252B] text-white'
                  : 'text-[#20252B]/70 hover:text-[#20252B]'
              }`}
            >
              {lang === 'ar' ? tab.ar : tab.en}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#20252B]/10 p-12 text-center text-sm text-[#20252B]/65">
          {t('لا توجد طلبات مطابقة لهذا الفلتر.', 'No orders match this filter.')}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const allowedNext = ALLOWED_STATUS_TRANSITIONS[ord.status] || [];
            const st = STATUS_LABELS[ord.status];
            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-[#20252B]/10 p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#20252B]/10 pb-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono-tabular text-base font-extrabold text-[#20252B]">
                      {ord.orderNumber}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded ${st.colorClass}`}
                    >
                      {lang === 'ar' ? st.ar : st.en}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold">
                      {ord.fulfillmentType === 'delivery'
                        ? t('توصيل تجريبي', 'Test Delivery')
                        : t('استلام من الفرع', 'Branch Pickup')}
                    </span>
                    {ord.squadId && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#FF6B35] font-bold">
                          {t('سكواد:', 'Squad:')} {ord.squadName}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="text-lg font-extrabold text-[#20252B] font-mono-tabular">
                    {ord.totalSar} {t('ر.س', 'SAR')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  <div className="md:col-span-7 space-y-1">
                    <div className="font-bold text-[#20252B]">
                      {t('المنتجات المطلوبة:', 'Ordered Items:')}
                    </div>
                    {ord.itemsSummary.map((line, i) => (
                      <div key={i} className="text-[#20252B]/80">
                        • {line}
                      </div>
                    ))}
                    {ord.notes && (
                      <div className="text-[#FF6B35] font-semibold pt-1">
                        {t('ملاحظات:', 'Notes:')} {ord.notes}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-5 space-y-1 text-[#20252B]/75">
                    <div>
                      <span className="font-bold">
                        {t('اسم العميل:', 'Customer:')}
                      </span>{' '}
                      {ord.customerName}
                    </div>
                    <div>
                      <span className="font-bold">{t('الجوال:', 'Phone:')}</span>{' '}
                      <span className="font-mono-tabular">
                        {ord.customerPhone}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold">
                        {t('العنوان:', 'Address:')}
                      </span>{' '}
                      {ord.deliveryAddress}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#20252B]/10 flex flex-wrap items-center justify-between gap-3">
                  <Link
                    to={`/orders/${ord.id}`}
                    className="text-xs font-bold text-[#20252B]/60 hover:text-[#20252B]"
                  >
                    {t(
                      'معاينة شاشة تتبع العميل لهذا الطلب',
                      'View Customer Tracking Screen'
                    )}
                  </Link>

                  <div className="flex flex-wrap items-center gap-2">
                    {allowedNext.length === 0 ? (
                      <span className="text-xs font-bold text-[#20252B]/50 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t(
                          'حالة نهائية مقفلة (Terminal State)',
                          'Locked Terminal State'
                        )}
                      </span>
                    ) : (
                      allowedNext.map((nextSt) => (
                        <button
                          key={nextSt}
                          onClick={() => updateOrderStatus(ord, nextSt)}
                          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                            nextSt === 'cancelled'
                              ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                              : 'bg-[#FF6B35] hover:bg-[#e85a25] text-white'
                          }`}
                        >
                          {nextSt === 'accepted' &&
                            t('1. قبول الطلب (Accept)', '1. Accept Order')}
                          {nextSt === 'preparing' &&
                            t(
                              '2. بدء التحضير (Preparing)',
                              '2. Start Preparing'
                            )}
                          {nextSt === 'ready' &&
                            t('3. جاهز للتسليم (Ready)', '3. Mark Ready')}
                          {nextSt === 'completed' &&
                            t(
                              '4. إكمال الطلب (Completed)',
                              '4. Mark Completed'
                            )}
                          {nextSt === 'cancelled' &&
                            t('إلغاء الطلب (Cancel)', 'Cancel Order')}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MerchantShell>
  );
};

// ============================================================================
// 3. MERCHANT MENU CRUD PAGE (/merchant/menu)
// ============================================================================
export const MerchantMenuPage: React.FC = () => {
  const {
    lang,
    t,
    userProfile,
    businesses,
    products,
    saveProduct,
    toggleProductAvailability,
    deleteProduct,
  } = useApp();

  const assignedBizId: BusinessId =
    userProfile?.assignedBusinessId || 'foodoo-restaurant';
  const business =
    businesses.find((b) => b.id === assignedBizId) || businesses[0];

  const bizProducts = useMemo(
    () => products.filter((p) => p.businessId === business.id),
    [products, business.id]
  );

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewModal, setIsNewModal] = useState(false);

  const openAddModal = () => {
    setIsNewModal(true);
    setEditingProduct({
      id: `prod-${Date.now()}`,
      businessId: business.id,
      nameAr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionEn: '',
      category: business.categories[0] || 'Burgers',
      priceSar: 25,
      calories: 450,
      imageKey:
        business.type === 'restaurant' ? 'burger-double' : 'iced-spanish',
      isAvailable: true,
      isFeatured: false,
      isPopular: false,
      isDemoData: true,
      customizationLabelAr: 'خيارات الإضافة',
      customizationLabelEn: 'Customization Options',
      customizationOptions: ['عادي (Standard)'],
    });
  };

  const openEditModal = (prod: Product) => {
    setIsNewModal(false);
    setEditingProduct({ ...prod });
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await saveProduct(editingProduct, isNewModal);
    setEditingProduct(null);
  };

  return (
    <MerchantShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#20252B]">
            {t('إدارة المنيو والأصناف والأسعار', 'Menu CRUD & Availability')}
          </h1>
          <p className="text-xs text-[#20252B]/65">
            {t(
              `أنت تدير حالياً منيو "${business.nameAr}" (${bizProducts.length} صنف).`,
              `Managing menu for "${business.nameEn}" (${bizProducts.length} items).`
            )}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-xs font-bold rounded-xl flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('إضافة منتج جديد للمنيو', 'Add New Menu Item')}</span>
        </button>
      </div>

      {/* Products Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bizProducts.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-2xl border border-[#20252B]/10 overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="h-44 relative">
                <FoodVisual
                  imageKey={prod.imageKey}
                  alt={lang === 'ar' ? prod.nameAr : prod.nameEn}
                  className="w-full h-full"
                />
              </div>
              <div className="p-5 space-y-2">
                <div className="text-xs text-[#20252B]/60 flex items-center justify-between">
                  <span>{prod.category}</span>
                  <span className="font-mono-tabular font-bold text-[#20252B]">
                    {prod.priceSar} {t('ر.س', 'SAR')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#20252B]">
                  {lang === 'ar' ? prod.nameAr : prod.nameEn}
                </h3>
                <p className="text-xs text-[#20252B]/70 line-clamp-2">
                  {lang === 'ar' ? prod.descriptionAr : prod.descriptionEn}
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-[#20252B]/10 flex items-center justify-between gap-2">
              <button
                onClick={() => toggleProductAvailability(prod)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  prod.isAvailable
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {prod.isAvailable
                  ? t('متوفر (إيقاف؟)', 'Available (Toggle)')
                  : t('غير متوفر (تفعيل؟)', 'Sold Out (Enable)')}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(prod)}
                  className="p-2 text-[#20252B]/70 hover:text-[#FF6B35] bg-[#FAF8F5] rounded-lg cursor-pointer"
                  aria-label="Edit product"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteProduct(prod.id)}
                  className="p-2 text-[#20252B]/70 hover:text-red-600 bg-[#FAF8F5] rounded-lg cursor-pointer"
                  aria-label="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveModal}
            className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-[#20252B]/10 shadow-xl space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b border-[#20252B]/10 pb-3">
              <h3 className="text-lg font-extrabold text-[#20252B]">
                {isNewModal
                  ? t('إضافة صنف جديد للمنيو', 'Add New Menu Product')
                  : t('تعديل بيانات الصنف', 'Edit Menu Product')}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-[#20252B]/50 hover:text-[#20252B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold">
                  {t('الاسم بالعربية *', 'Arabic Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.nameAr}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      nameAr: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold">
                  {t('الاسم بالإنجليزية *', 'English Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.nameEn}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      nameEn: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold">
                  {t('القسم / الفئة *', 'Category *')}
                </label>
                <select
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
                >
                  {business.categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold">
                  {t('السعر بالريال السعودي (SAR) *', 'Price in SAR *')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  required
                  value={editingProduct.priceSar}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      priceSar: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold">
                  {t('السعرات الحرارية', 'Calories (kcal)')}
                </label>
                <input
                  type="number"
                  min={0}
                  max={5000}
                  value={editingProduct.calories}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      calories: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold">
                  {t('الوصف بالعربية *', 'Arabic Description *')}
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingProduct.descriptionAr}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      descriptionAr: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold">
                  {t('الوصف بالإنجليزية *', 'English Description *')}
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingProduct.descriptionEn}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      descriptionEn: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold">
                  {t('التصميم البصري للصنف', 'Product Visual Style')}
                </label>
                <select
                  value={editingProduct.imageKey}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      imageKey: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
                >
                  {IMAGE_KEY_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {lang === 'ar' ? opt.labelAr : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold">
                  {t(
                    'خيارات التخصيص (افصل بينها بفاصلة)',
                    'Customization Options (comma-separated)'
                  )}
                </label>
                <input
                  type="text"
                  value={editingProduct.customizationOptions.join(', ')}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      customizationOptions: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProduct.isAvailable}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      isAvailable: e.target.checked,
                    })
                  }
                  className="accent-[#FF6B35]"
                />
                <span>{t('متوفر للطلب حالياً', 'Available for Ordering')}</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProduct.isFeatured}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      isFeatured: e.target.checked,
                    })
                  }
                  className="accent-[#FF6B35]"
                />
                <span>{t('منتج مميز (Featured)', 'Featured Product')}</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#20252B]/10">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-xs font-bold text-[#20252B]/70 cursor-pointer"
              >
                {t('إلغاء', 'Cancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {t('حفظ المنتج في Firestore', 'Save Product to Firestore')}
              </button>
            </div>
          </form>
        </div>
      )}
    </MerchantShell>
  );
};

// ============================================================================
// 4. MERCHANT ANALYTICS PAGE (/merchant/analytics)
// ============================================================================
export const MerchantAnalyticsPage: React.FC = () => {
  const { t, merchantOrders } = useApp();

  const stats = useMemo(() => {
    const totalCount = merchantOrders.length;
    const completed = merchantOrders.filter((o) => o.status === 'completed');
    const cancelled = merchantOrders.filter((o) => o.status === 'cancelled');
    const nonCancelled = merchantOrders.filter((o) => o.status !== 'cancelled');
    const squadOrders = merchantOrders.filter((o) => Boolean(o.squadId));

    const grossRevenue = nonCancelled.reduce((s, o) => s + o.totalSar, 0);
    const completedRevenue = completed.reduce((s, o) => s + o.totalSar, 0);
    const aov =
      nonCancelled.length > 0
        ? (grossRevenue / nonCancelled.length).toFixed(1)
        : '0.0';

    return {
      totalCount,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      squadOrdersCount: squadOrders.length,
      grossRevenue,
      completedRevenue,
      aov,
    };
  }, [merchantOrders]);

  return (
    <MerchantShell>
      <div>
        <h1 className="text-2xl font-extrabold text-[#20252B]">
          {t('إحصائيات المبيعات والأداء', 'Sales & Performance Analytics')}
        </h1>
        <p className="text-xs text-[#20252B]/65">
          {t(
            'مؤشرات حقيقية محسوبة مباشرة من طلبات المنشأة المعينة في Cloud Firestore.',
            'Real metrics computed directly from your assigned business orders in Cloud Firestore.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-[#20252B]/10 p-6 space-y-1">
          <div className="text-xs text-[#20252B]/60">
            {t('إجمالي عدد الطلبات', 'Total Order Count')}
          </div>
          <div className="text-3xl font-extrabold text-[#20252B] font-mono-tabular">
            {stats.totalCount}
          </div>
          <div className="text-xs text-emerald-700 font-semibold">
            {stats.completedCount} {t('مكتمل', 'completed')} ·{' '}
            {stats.cancelledCount} {t('ملغي', 'cancelled')}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#20252B]/10 p-6 space-y-1">
          <div className="text-xs text-[#20252B]/60">
            {t('متوسط قيمة الطلب (AOV)', 'Average Order Value (AOV)')}
          </div>
          <div className="text-3xl font-extrabold text-[#FF6B35] font-mono-tabular">
            {stats.aov} {t('ر.س', 'SAR')}
          </div>
          <div className="text-xs text-[#20252B]/60">
            {t('صافي بدون أي عمولة منصة (0%)', 'Zero platform commission (0%)')}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#20252B]/10 p-6 space-y-1">
          <div className="text-xs text-[#20252B]/60">
            {t('إجمالي المبيعات النشطة والمكتملة', 'Active & Completed Sales')}
          </div>
          <div className="text-3xl font-extrabold text-[#20252B] font-mono-tabular">
            {stats.grossRevenue} {t('ر.س', 'SAR')}
          </div>
          <div className="text-xs text-[#20252B]/60 font-mono-tabular">
            {t('المكتمل منها:', 'Completed Revenue:')} {stats.completedRevenue}{' '}
            {t('ر.س', 'SAR')}
          </div>
        </div>
      </div>

      {/* Squad Attribution Table */}
      <div className="bg-white rounded-2xl border border-[#20252B]/10 p-6 space-y-4">
        <h2 className="text-lg font-extrabold text-[#20252B]">
          {t(
            'توزيع الطلبات حسب المصدر (فردي مقابل فودو سكوادز)',
            'Order Attribution (Direct vs. Foodoo Squads)'
          )}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#20252B]/10 flex items-center justify-between">
            <span className="text-xs font-bold">
              {t('طلبات مرتبطة بفودو سكوادز', 'Orders Associated with Squads')}
            </span>
            <span className="text-lg font-extrabold text-[#FF6B35] font-mono-tabular">
              {stats.squadOrdersCount}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#20252B]/10 flex items-center justify-between">
            <span className="text-xs font-bold">
              {t('طلبات فردية مباشرة', 'Individual Direct Orders')}
            </span>
            <span className="text-lg font-extrabold text-[#20252B] font-mono-tabular">
              {stats.totalCount - stats.squadOrdersCount}
            </span>
          </div>
        </div>
      </div>
    </MerchantShell>
  );
};

// ============================================================================
// 5. MERCHANT SQUADS PAGE (/merchant/squads)
// ============================================================================
export const MerchantSquadsPage: React.FC = () => {
  const { lang, t, merchantOrders } = useApp();

  const squadOrders = useMemo(
    () => merchantOrders.filter((o) => Boolean(o.squadId)),
    [merchantOrders]
  );

  return (
    <MerchantShell>
      <div>
        <h1 className="text-2xl font-extrabold text-[#20252B]">
          {t(
            'طلبات فودو سكوادز الخاصة بالمنشأة',
            'Business Orders Associated with Foodoo Squads'
          )}
        </h1>
        <p className="text-xs text-[#20252B]/65">
          {t(
            'الطلبات التي أجراها عملاء منضمون إلى سكوادز في منشأتك ونقاط الولاء المكتسبة منها.',
            'Orders placed at your business by Squad members and their point qualification status.'
          )}
        </p>
      </div>

      {squadOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#20252B]/10 p-10 text-center space-y-3">
          <p className="text-xs text-[#20252B]/70">
            {t(
              'لا توجد طلبات مرتبطة بسكوادز لهذه المنشأة حتى الآن. انضم لسكواد من صفحة (فودو سكوادز) ثم أرسل طلباً لتجربتها!',
              'No Squad-associated orders yet for this business. Join a Squad and place an order to see it here!'
            )}
          </p>
          <Link
            to="/squads"
            className="inline-block px-5 py-2.5 bg-[#FF6B35] text-white text-xs font-bold rounded-xl"
          >
            {t('استعراض السكوادز', 'Explore Squads')}
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#20252B]/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#20252B]/10 text-xs text-[#20252B]/65">
              <tr>
                <th className="py-3.5 px-5 text-start font-bold">
                  {t('رقم الطلب', 'Order #')}
                </th>
                <th className="py-3.5 px-5 text-start font-bold">
                  {t('اسم السكواد', 'Squad Name')}
                </th>
                <th className="py-3.5 px-5 text-start font-bold">
                  {t('العميل', 'Customer')}
                </th>
                <th className="py-3.5 px-5 text-start font-bold">
                  {t('حالة الطلب', 'Order Status')}
                </th>
                <th className="py-3.5 px-5 text-end font-bold">
                  {t('نقطة السكواد', 'Squad Point')}
                </th>
                <th className="py-3.5 px-5 text-end font-bold">
                  {t('الإجمالي', 'Total')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#20252B]/10">
              {squadOrders.map((ord) => (
                <tr key={ord.id}>
                  <td className="py-3.5 px-5 font-mono-tabular font-bold">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3.5 px-5 font-bold text-[#FF6B35]">
                    {ord.squadName}
                  </td>
                  <td className="py-3.5 px-5">{ord.customerName}</td>
                  <td className="py-3.5 px-5 text-xs font-semibold">
                    {lang === 'ar'
                      ? STATUS_LABELS[ord.status].ar
                      : STATUS_LABELS[ord.status].en}
                  </td>
                  <td className="py-3.5 px-5 text-end font-mono-tabular text-xs font-bold">
                    {ord.squadPointAwarded
                      ? t('+1 مكتسبة ✓', '+1 Awarded ✓')
                      : ord.status === 'cancelled'
                      ? '0'
                      : t('بانتظار الإكمال', 'Pending Completion')}
                  </td>
                  <td className="py-3.5 px-5 text-end font-mono-tabular font-extrabold">
                    {ord.totalSar} {t('ر.س', 'SAR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MerchantShell>
  );
};

// ============================================================================
// 6. MERCHANT SETTINGS PAGE (/merchant/settings)
// ============================================================================
export const MerchantSettingsPage: React.FC = () => {
  const {
    t,
    userProfile,
    businesses,
    updateBusinessSettings,
    seedPilotDatabase,
    isSeeding,
  } = useApp();

  const assignedBizId: BusinessId =
    userProfile?.assignedBusinessId || 'foodoo-restaurant';
  const business =
    businesses.find((b) => b.id === assignedBizId) || businesses[0];

  const [nameAr, setNameAr] = useState(business.nameAr);
  const [nameEn, setNameEn] = useState(business.nameEn);
  const [locationAr, setLocationAr] = useState(business.locationAr);
  const [locationEn, setLocationEn] = useState(business.locationEn);
  const [descriptionAr, setDescriptionAr] = useState(business.descriptionAr);
  const [descriptionEn, setDescriptionEn] = useState(business.descriptionEn);
  const [categoriesStr, setCategoriesStr] = useState(
    business.categories.join(', ')
  );
  const [isOpen, setIsOpen] = useState(business.isOpen);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(
    business.prepTimeMinutes
  );
  const [minOrderSar, setMinOrderSar] = useState(business.minOrderSar);
  const [deliveryFeeSar, setDeliveryFeeSar] = useState(
    business.deliveryFeeSar
  );

  React.useEffect(() => {
    setNameAr(business.nameAr);
    setNameEn(business.nameEn);
    setLocationAr(business.locationAr);
    setLocationEn(business.locationEn);
    setDescriptionAr(business.descriptionAr);
    setDescriptionEn(business.descriptionEn);
    setCategoriesStr(business.categories.join(', '));
    setIsOpen(business.isOpen);
    setPrepTimeMinutes(business.prepTimeMinutes);
    setMinOrderSar(business.minOrderSar);
    setDeliveryFeeSar(business.deliveryFeeSar);
  }, [business]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBusinessSettings(business.id, {
      nameAr,
      nameEn,
      locationAr,
      locationEn,
      descriptionAr,
      descriptionEn,
      categories: categoriesStr
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      isOpen,
      prepTimeMinutes,
      minOrderSar,
      deliveryFeeSar,
    });
  };

  return (
    <MerchantShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#20252B]">
            {t('إعدادات المنشأة والأقسام', 'Business & Category Settings')}
          </h1>
          <p className="text-xs text-[#20252B]/65">
            {t(
              'عدّل تفاصيل المنشأة، أوقات التحضير، الأقسام، ورسوم التوصيل التجريبي.',
              'Edit store details, categories, prep time, and delivery settings.'
            )}
          </p>
        </div>

        <button
          type="button"
          disabled={isSeeding}
          onClick={seedPilotDatabase}
          className="px-4 py-2 bg-[#20252B] text-white text-xs font-bold rounded-xl flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`}
          />
          <span>
            {t(
              'إعادة ضبط ومزامنة البيانات التجريبية',
              'Reset & Sync Demo Seed Data'
            )}
          </span>
        </button>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl border border-[#20252B]/10 p-6 space-y-5 max-w-3xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold">
              {t('اسم المنشأة بالعربية', 'Arabic Name')}
            </label>
            <input
              type="text"
              required
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold">
              {t('اسم المنشأة بالإنجليزية', 'English Name')}
            </label>
            <input
              type="text"
              required
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold">
              {t('الموقع بالعربية', 'Arabic Location')}
            </label>
            <input
              type="text"
              required
              value={locationAr}
              onChange={(e) => setLocationAr(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold">
              {t('الموقع بالإنجليزية', 'English Location')}
            </label>
            <input
              type="text"
              required
              value={locationEn}
              onChange={(e) => setLocationEn(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold">
            {t(
              'أقسام المنيو (مفصولة بفاصلة)',
              'Menu Categories (comma-separated)'
            )}
          </label>
          <input
            type="text"
            required
            value={categoriesStr}
            onChange={(e) => setCategoriesStr(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold">
              {t('وقت التحضير (دقائق)', 'Prep Time (mins)')}
            </label>
            <input
              type="number"
              min={1}
              max={180}
              value={prepTimeMinutes}
              onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold">
              {t('الحد الأدنى للطلب (ر.س)', 'Min Order (SAR)')}
            </label>
            <input
              type="number"
              min={0}
              max={1000}
              value={minOrderSar}
              onChange={(e) => setMinOrderSar(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold">
              {t('رسوم التوصيل (ر.س)', 'Delivery Fee (SAR)')}
            </label>
            <input
              type="number"
              min={0}
              max={200}
              value={deliveryFeeSar}
              onChange={(e) => setDeliveryFeeSar(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={isOpen}
            onChange={(e) => setIsOpen(e.target.checked)}
            className="accent-[#FF6B35]"
          />
          <span>
            {t(
              'المنشأة مفتوحة وتستقبل الطلبات الآن',
              'Store is Open and Accepting Orders'
            )}
          </span>
        </label>

        <button
          type="submit"
          className="px-6 py-2.5 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          {t('حفظ إعدادات المنشأة', 'Save Business Settings')}
        </button>
      </form>
    </MerchantShell>
  );
};
