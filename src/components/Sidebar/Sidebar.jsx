import styles from './Sidebar.module.css';
import {
   FaBoxOpen,
   FaUsers,
   FaBell,
   FaShoppingBag,
   FaPlusSquare,
} from 'react-icons/fa';

const tabs = [
   { id: 'products', label: 'Ապրանքներ', icon: FaBoxOpen },
   { id: 'orders', label: 'Պատվերներ', icon: FaShoppingBag },
   { id: 'users', label: 'Օգտվողներ', icon: FaUsers },
   { id: 'notifications', label: 'Ծանուցումներ', icon: FaBell },
   { id: 'add-product', label: 'Ավելացնել ապրանք', icon: FaPlusSquare },
];

const Sidebar = ({ activeTab, onTabChange }) => {
   return (
      <div className={styles.sidebar}>
         {tabs.map(({ id, label, icon: Icon }) => (
            <div
               key={id}
               className={`${styles.tab} ${activeTab === id ? styles.active : ''}`}
               onClick={() => onTabChange(id)}
            >
               <Icon className={styles.icon} />
               <span>{label}</span>
            </div>
         ))}
      </div>
   );
};

export default Sidebar;
