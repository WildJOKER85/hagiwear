import Header from '../components/Header/Header';
import { Outlet, useLocation } from 'react-router-dom';

const MainLayout = () => {
   const location = useLocation();
   const isAdmin = location.pathname.startsWith('/admin'); // если админка в /admin

   return (
      <>
         {!isAdmin && <Header />}
         <main className='main'>
            <div className="container">
               <Outlet />
            </div>
         </main>
      </>
   );
};

export default MainLayout;
