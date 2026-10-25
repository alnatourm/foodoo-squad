import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Home,
  Store,
  Users,
  Trophy,
  User as UserIcon,
  Globe,
  ShieldCheck,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CustomerLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    lang,
    setLang,
    t,
    user,
    userProfile,
    cartCount,
    cartSubtotalSar,
    cartBusiness,
    pendingCartConflict,
    confirmCartSwitch,
    cancelCartSwitch,
    toastMessage,
    clearToast,
    signInWithGoogle,
    merchantOrders,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  const pendingMerchantOrdersCount = merchantOrders.filter(
    (o) => o.status === 'pending'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#20252B] pb-20 md:pb-0">
      {/* Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (5 concise nav links) — Zone 3 (1 primary action) */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur border-b border-[#20252B]/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-16">
          {/* Zone 1: Single text element wordmark */}
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight text-[#FF6B35] whitespace-nowrap shrink-0"
          >
            {t('فودو · FOODOO', 'FOODOO · فودو')}
          </Link>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#20252B]/75">
            <Link
              to="/restaurants"
              className={`hover:text-[#FF6B35] transition-colors whitespace-nowrap shrink-0 ${
                location.pathname.startsWith('/restaurant') ||
                location.pathname.startsWith('/menu')
                  ? 'text-[#FF6B35] underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              {t('المطاعم والمقاهي', 'Stores')}
            </Link>
            <Link
              to="/squads"
              className={`hover:text-[#FF6B35] transition-colors whitespace-nowrap shrink-0 ${
                location.pathname.startsWith('/squads')
                  ? 'text-[#FF6B35] underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              {t('فودو سكوادز', 'Squads')}
            </Link>
            <Link
              to="/leaderboard"
              className={`hover:text-[#FF6B35] transition-colors whitespace-nowrap shrink-0 ${
                location.pathname === '/leaderboard'
                  ? 'text-[#FF6B35] underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              {t('المتصدرون', 'Leaderboard')}
            </Link>
            <Link
              to="/orders"
              className={`hover:text-[#FF6B35] transition-colors whitespace-nowrap shrink-0 ${
                location.pathname.startsWith('/orders')
                  ? 'text-[#FF6B35] underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              {t('طلباتي', 'My Orders')}
            </Link>
            <Link
              to="/merchant"
              className={`hover:text-[#FF6B35] transition-colors whitespace-nowrap shrink-0 ${
                location.pathname.startsWith('/merchant')
                  ? 'text-[#FF6B35] underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              {pendingMerchantOrdersCount > 0
                ? t(
                    `لوحة التاجر (${pendingMerchantOrdersCount})`,
                    `Merchant (${pendingMerchantOrdersCount})`
                  )
                : t('لوحة التاجر', 'Merchant')}
            </Link>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/cart')}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#FF6B35] rounded-xl hover:bg-[#e85a25] transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="tabular-nums">
                {cartCount > 0
                  ? `${cartCount} · ${cartSubtotalSar} ${t('ر.س', 'SAR')}`
                  : t('السلة (0)', 'Cart (0)')}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Workspace Bar (below header): Language toggle, Auth status, Active Squad, Pilot Role */}
      <div className="bg-[#20252B] text-[#FAF8F5] border-b border-[#20252B]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[#FAF8F5]/80">
              {t(
                'نسخة تجريبية للسوق السعودي (الرياض) · بيانات تجريبية · 0% عمولة على المطاعم',
                'Saudi Pilot V1 (Riyadh) · Sample Data · 0% Commission Platform'
              )}
            </span>
            {userProfile?.activeSquadId && (
              <>
                <span aria-hidden="true" className="text-[#FAF8F5]/40">
                  ·
                </span>
                <Link
                  to={`/squads/${userProfile.activeSquadId}`}
                  className="text-[#FF6B35] font-semibold hover:underline whitespace-nowrap shrink-0"
                >
                  {t(
                    'سكوادك النشط مفعل (+1 نقطة لكل طلب مكتمل)',
                    'Active Squad Linked (+1 pt per completed order)'
                  )}
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 text-[#FAF8F5]/90 hover:text-[#FF6B35] transition-colors font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            <span aria-hidden="true" className="text-[#FAF8F5]/30">
              |
            </span>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 text-[#FAF8F5] hover:text-[#FF6B35] font-semibold whitespace-nowrap shrink-0"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#FF6B35]" />
                  <span className="truncate max-w-[140px]">
                    {userProfile?.displayName || user.displayName || user.email}
                  </span>
                </Link>
                <span aria-hidden="true" className="text-[#FAF8F5]/30">
                  ·
                </span>
                <Link
                  to="/merchant"
                  className="text-[#FF6B35] hover:underline font-semibold whitespace-nowrap shrink-0 flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {userProfile?.assignedBusinessId === 'foodoo-cafe'
                      ? t('إدارة المقهى', 'Manage Café')
                      : t('إدارة المطعم', 'Manage Restaurant')}
                  </span>
                </Link>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="text-[#FF6B35] hover:underline font-bold whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t('تسجيل الدخول بحساب Google', 'Sign in with Google')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 end-4 z-50 max-w-md bg-[#20252B] text-white px-4 py-3 rounded-xl shadow-lg border border-white/10 flex items-center justify-between gap-3">
          <span className="text-sm font-medium">{toastMessage.text}</span>
          <button
            onClick={clearToast}
            className="text-white/60 hover:text-white p-1 cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cross-Business Cart Replacement Confirmation Modal */}
      {pendingCartConflict && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#20252B]/10 shadow-xl">
            <div className="flex items-center gap-3 text-[#FF6B35] mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-[#20252B]">
                {t(
                  'تغيير المنشأة في السلة؟',
                  'Switch Business in Your Cart?'
                )}
              </h3>
            </div>
            <p className="text-sm text-[#20252B]/75 leading-relaxed mb-6">
              {t(
                `سلتك الحالية تحتوي على منتجات من "${
                  cartBusiness?.nameAr || ''
                }". نظام فودو يخصص كل طلب لمنشأة واحدة فقط. هل ترغب في تفريغ السلة الحالية والبدء بطلب جديد؟`,
                `Your cart currently has items from "${
                  cartBusiness?.nameEn || ''
                }". FOODOO restricts each order to one business. Clear your current cart and add this item instead?`
              )}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={cancelCartSwitch}
                className="px-4 py-2 text-sm font-semibold text-[#20252B] bg-[#FAF8F5] hover:bg-[#20252B]/10 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t('إبقاء السلة الحالية', 'Keep Current Cart')}
              </button>
              <button
                onClick={confirmCartSwitch}
                className="px-4 py-2 text-sm font-bold text-white bg-[#FF6B35] hover:bg-[#e85a25] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t('تفريغ السلة والإضافة', 'Clear & Add Item')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#20252B] text-[#FAF8F5] border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="text-xl font-extrabold text-[#FF6B35] mb-1">
              {t('فودو · FOODOO', 'FOODOO · فودو')}
            </div>
            <p className="text-xs text-[#FAF8F5]/70 max-w-md">
              {t(
                'منصة الطلب المباشر بدون عمولة ونظام الطلب الجماعي (فودو سكوادز) للمطاعم والمقاهي في المملكة العربية السعودية - النسخة التجريبية V1.',
                'Zero-commission direct ordering & social team ordering (Foodoo Squads) for Saudi restaurants and cafés — Pilot V1.'
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-[#FAF8F5]/80">
            <Link to="/restaurants" className="hover:text-[#FF6B35]">
              {t('المطاعم والمقاهي', 'Restaurants & Cafés')}
            </Link>
            <Link to="/squads" className="hover:text-[#FF6B35]">
              {t('فودو سكوادز', 'Foodoo Squads')}
            </Link>
            <Link to="/leaderboard" className="hover:text-[#FF6B35]">
              {t('ترتيب السكوادز الأسبوعي', 'Weekly Leaderboard')}
            </Link>
            <Link to="/merchant" className="hover:text-[#FF6B35]">
              {t('بوابة إدارة المطعم والمقهى', 'Merchant Portal')}
            </Link>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation (Customer Mobile-First Layout, <= 56px height) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 h-14 bg-white border-t border-[#20252B]/10 flex items-center justify-around px-2">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold px-2 py-1 ${
            location.pathname === '/'
              ? 'text-[#FF6B35]'
              : 'text-[#20252B]/65'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>{t('الرئيسية', 'Home')}</span>
        </Link>
        <Link
          to="/restaurants"
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold px-2 py-1 ${
            location.pathname.startsWith('/restaurant') ||
            location.pathname.startsWith('/menu')
              ? 'text-[#FF6B35]'
              : 'text-[#20252B]/65'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>{t('المنيو', 'Menus')}</span>
        </Link>
        <Link
          to="/squads"
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold px-2 py-1 ${
            location.pathname.startsWith('/squads')
              ? 'text-[#FF6B35]'
              : 'text-[#20252B]/65'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('سكوادز', 'Squads')}</span>
        </Link>
        <Link
          to="/leaderboard"
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold px-2 py-1 ${
            location.pathname === '/leaderboard'
              ? 'text-[#FF6B35]'
              : 'text-[#20252B]/65'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>{t('المتصدرون', 'Ranks')}</span>
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold px-2 py-1 ${
            location.pathname === '/profile'
              ? 'text-[#FF6B35]'
              : 'text-[#20252B]/65'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>{t('حسابي', 'Profile')}</span>
        </Link>
      </nav>
    </div>
  );
};
