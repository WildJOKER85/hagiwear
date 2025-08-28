import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './AdminPage.module.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import ProductsTab from '../../components/ProductsTab/ProductsTab';
import OrdersTab from '../../components/OrdersTab/OrdersTab';
import UsersTab from '../../components/UsersTab/UsersTab';
import NotificationsTab from '../../components/NotificationsTab/NotificationsTab';
import AddProductForm from '../../components/AddProductForm/AddProductForm';

const AdminPage = () => {
   const [searchParams, setSearchParams] = useSearchParams();
   const [activeTab, setActiveTab] = useState('products');

   // Читаем URL при монтировании
   useEffect(() => {
      const tabFromUrl = searchParams.get('tab');
      if (tabFromUrl) setActiveTab(tabFromUrl);
   }, [searchParams]);

   const handleTabChange = (tab) => {
      setActiveTab(tab);
      setSearchParams({ tab }); // Обновляем URL
   };

   const renderContent = () => {
      switch (activeTab) {
         case 'add-product':
            return <AddProductForm />;
         case 'products':
            return <ProductsTab />;
         case 'orders':
            return <OrdersTab />;
         case 'users':
            return <UsersTab />;
         case 'notifications':
            return <NotificationsTab />;
         default:
            return <ProductsTab />;
      }
   };

   return (
      <div className={styles.adminContainer}>
         <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
         <div className={styles.contentContainer}>
            {renderContent()}
         </div>
      </div>
   );
};

export default AdminPage;
