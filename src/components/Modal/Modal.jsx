import styles from './Modal.module.css';

const Modal = ({ isOpen, title, message, onConfirm, onCancel }) => {
   if (!isOpen) return null;

   return (
      <div className={styles.overlay}>
         <div className={styles.modal}>
            <h3>{title}</h3>
            <p>{message}</p>
            <div className={styles.buttons}>
               <button className={styles.confirmBtn} onClick={onConfirm}>Այո</button>
               <button className={styles.cancelBtn} onClick={onCancel}>Չեղարկել</button>
            </div>
         </div>
      </div>
   );
};

export default Modal;
