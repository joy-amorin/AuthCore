import AppRouter from "./AppRouter";
import { ToastProvider } from "./contexts/ToastContexts";
import { AuthProvider } from "./auth/AuthContext";


function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
