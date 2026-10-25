import React from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { CustomerLayout } from './components/Layout';
import {
  CartPage,
  CheckoutPage,
  HomePage,
  MenuPage,
  OrderDetailPage,
  OrdersPage,
  RestaurantsPage,
} from './pages/CustomerPages';
import {
  CreateSquadPage,
  LeaderboardPage,
  ProfilePage,
  SquadDetailPage,
  SquadsHubPage,
} from './pages/SquadsPages';
import {
  MerchantAnalyticsPage,
  MerchantMenuPage,
  MerchantOrdersPage,
  MerchantOverviewPage,
  MerchantSettingsPage,
  MerchantSquadsPage,
} from './pages/MerchantPages';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

  render() {
    if (this.state.hasError) {
      let parsedError = this.state.errorMessage;
      try {
        const json = JSON.parse(this.state.errorMessage);
        if (json.error && json.operationType) {
          parsedError = `Firestore ${json.operationType.toUpperCase()} error on "${
            json.path
          }": ${json.error}`;
        }
      } catch {
        // plain string error
      }
      return (
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-red-200 max-w-lg w-full p-6 space-y-4">
            <h1 className="text-lg font-extrabold text-red-700">
              حدث خطأ في النظام | Application Error
            </h1>
            <p className="text-xs font-mono bg-red-50 p-3 rounded-xl text-red-800 break-words">
              {parsedError}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                window.location.href = '/';
              }}
              className="px-5 py-2.5 bg-[#FF6B35] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              إعادة تحميل الصفحة | Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Merchant Dashboard Routes (uses MerchantShell layout) */}
            <Route path="/merchant" element={<MerchantOverviewPage />} />
            <Route path="/merchant/orders" element={<MerchantOrdersPage />} />
            <Route path="/merchant/menu" element={<MerchantMenuPage />} />
            <Route
              path="/merchant/analytics"
              element={<MerchantAnalyticsPage />}
            />
            <Route path="/merchant/squads" element={<MerchantSquadsPage />} />
            <Route
              path="/merchant/settings"
              element={<MerchantSettingsPage />}
            />

            {/* Customer Website Routes (uses CustomerLayout) */}
            <Route
              path="/"
              element={
                <CustomerLayout>
                  <HomePage />
                </CustomerLayout>
              }
            />
            <Route
              path="/restaurants"
              element={
                <CustomerLayout>
                  <RestaurantsPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/restaurant/:id"
              element={
                <CustomerLayout>
                  <MenuPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/menu/:businessId"
              element={
                <CustomerLayout>
                  <MenuPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/cart"
              element={
                <CustomerLayout>
                  <CartPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/checkout"
              element={
                <CustomerLayout>
                  <CheckoutPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/orders"
              element={
                <CustomerLayout>
                  <OrdersPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <CustomerLayout>
                  <OrderDetailPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/squads"
              element={
                <CustomerLayout>
                  <SquadsHubPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/squads/create"
              element={
                <CustomerLayout>
                  <CreateSquadPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/squads/:id"
              element={
                <CustomerLayout>
                  <SquadDetailPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <CustomerLayout>
                  <LeaderboardPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <CustomerLayout>
                  <ProfilePage />
                </CustomerLayout>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
