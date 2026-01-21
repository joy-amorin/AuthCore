import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import UsersPage from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import AdminLayout from "./layout/AdminLayout";
import RolesList from "./pages/RolesList";
import RoleDetail from "./pages/RoleDetail";
import UserEdit from "./pages/UserEdit";
import RegisterPage from "./pages/RegisterPage";
import AuditLogList from "./pages/AuditLogList";

const AppRouter = () => (
  <Router>
    <Routes>
      {/* public routes */}
      <Route path="/" element={<Login />} />
      {/* private routes within the panel */}
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
        <Route path="users/edit/:id" element={<UserEdit />} />
        <Route path="roles" element={<RolesList />} />
        <Route path="roles/:id" element={<RoleDetail />} />
        <Route path="audit" element={< AuditLogList />} />

        {/* route for user registration */}
        <Route
          path="register"
          element={
            <PrivateRoute>
              <RegisterPage />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  </Router>
);

export default AppRouter;
