import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import UsersPage from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import AdminLayout from "./layout/AdminLayout";
import RolesList from "./pages/RolesList";
import RoleDetail from "./pages/RoleDetail";

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/panel/*"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route path="home" element={<Home />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="roles" element={<RolesList />} />
        <Route path="roles/:id" element={<RoleDetail />} />
      </Route>
    </Routes>
  </Router>
);

export default AppRouter;
