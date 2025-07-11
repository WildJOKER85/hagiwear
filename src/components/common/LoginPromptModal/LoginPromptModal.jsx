import styles from './LoginPromptModal.module.css';
import { useNavigate } from 'react-router-dom';

export default function LoginPromptModal({ isOpen, onClose }) {
   const navigate = useNavigate();

   if (!isOpen) return null;

   return (
      <div className={styles.backdrop} onClick={onClose}>
         <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Զգուշացում</h2>
            <p>Խնդրում ենք մուտք գործել, որպեսզի կարողանաք գնել այս ապրանքը:</p>
            <div className={styles.buttons}>
               <button
                  className={styles.loginBtn}
                  onClick={() => navigate('/login')}
               >
                  Մուտք
               </button>
               <button className={styles.cancelBtn} onClick={onClose}>Հետ</button>
            </div>
         </div>
      </div>
   );
}
