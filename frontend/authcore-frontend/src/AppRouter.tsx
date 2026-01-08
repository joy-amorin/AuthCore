import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AdminLayout from "./layout/AdminLayout";

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
        <Route path="users" element={<div>Usuarios</div>} />
        <Route path="roles" element={<div>Roles</div>} />
      </Route>
    </Routes>
  </Router>
);

export default AppRouter;
