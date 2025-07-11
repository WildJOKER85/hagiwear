import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
   const { user, loading } = useAuth();
   const location = useLocation();

   if (loading) {
      // Пока загружается — можно показать спиннер, лоадер или простой текст
      return <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>Բեռնվում է...</div>;
   }

   if (!user) {
      // Если пользователь не авторизован — редирект на логин
      return <Navigate to="/login" state={{ from: location }} replace />;
   }

   // Если авторизован — рендерим дочерние маршруты
   return <Outlet />;
};

export default PrivateRoute;
