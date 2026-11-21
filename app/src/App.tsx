import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { RequireAuth } from './components/RequireAuth';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { FormsPage } from './pages/FormsPage';
import { DynamicPage } from './pages/DynamicPage';
import { TablesPage } from './pages/TablesPage';
import { FramesPage } from './pages/FramesPage';
import { DialogsPage } from './pages/DialogsPage';
import { NewTabPage } from './pages/NewTabPage';
import { ShopPage } from './pages/ShopPage';
import { ProductPage } from './pages/ProductPage';
import { InfoPage } from './pages/InfoPage';
import { LegacyPage } from './pages/LegacyPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/ch/de" replace />} />
        <Route path="/:market/:lang" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="forms" element={<FormsPage />} />
          <Route path="dynamic" element={<DynamicPage />} />
          <Route path="tables" element={<TablesPage />} />
          <Route path="frames" element={<FramesPage />} />
          <Route path="dialogs" element={<DialogsPage />} />
          <Route path="new-tab" element={<NewTabPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="shop/:productId" element={<ProductPage />} />
          <Route path="info/:slug" element={<InfoPage />} />
          <Route path="legacy" element={<LegacyPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route
            path="checkout"
            element={
              <RequireAuth>
                <CheckoutPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/:market" element={<Layout />} />
      </Routes>
    </AuthProvider>
  );
}
