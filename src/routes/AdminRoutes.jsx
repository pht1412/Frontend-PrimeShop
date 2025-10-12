import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/DashBoard";
import OrderManager from "../pages/admin/OrderManager";
import ProductManager from "../pages/admin/ProductManager";
import UserManager from "../pages/admin/UserManager";
import AdminRoute from "../components/AdminRoute";
import CategoryManager from "../pages/admin/CategoryManager";
import NewsManager from "../pages/admin/NewsManager";
import RevenueManager from "../pages/admin/RevenueManager";
import ImportTransactionManager from "../pages/admin/ImportTransactionManager";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={
          <AdminRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="orders"
        element={
          <AdminRoute>
            <AdminLayout>
              <OrderManager />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="products"
        element={
          <AdminRoute>
            <AdminLayout>
              <ProductManager />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="users"
        element={
          <AdminRoute>
            <AdminLayout>
              <UserManager />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="categories"
        element={
          <AdminRoute>
            <AdminLayout>
              <CategoryManager />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="news"
        element={
          <AdminRoute>
            <AdminLayout>
              <NewsManager />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="revenues"
        element={
          <AdminRoute>
            <AdminLayout>
              <RevenueManager />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="import-transactions"
        element={
          <AdminRoute>
            <AdminLayout>
              <ImportTransactionManager />
            </AdminLayout>
          </AdminRoute>
        }
      />
    </Routes>
  );
};

export default AdminRoutes;
