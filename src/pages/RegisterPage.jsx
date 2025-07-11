import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
   const { register } = useAuth();
   const navigate = useNavigate();

   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [repeatPassword, setRepeatPassword] = useState('');
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);

   const handleRegister = async (e) => {
      e.preventDefault();
      setError('');

      if (!email || !password || !repeatPassword) {
         return setError('Խնդրում ենք լրացնել բոլոր դաշտերը։');
      }

      if (password !== repeatPassword) {
         return setError('Գաղտնաբառերը չեն համընկնում։');
      }

      setLoading(true);
      try {
         await register(email, password);
         // После успешной регистрации сразу редиректим на каталог или другую страницу
         navigate('/catalog');
      } catch (err) {
         console.error('Registration error:', err);
         switch (err.code) {
            case 'auth/email-already-in-use':
               setError('Այս էլ. հասցեն արդեն օգտագործվում է։');
               break;
            case 'auth/invalid-email':
               setError('Էլ. հասցեն անհավասար է։ Խնդրում ենք լրացնել ճիշտ էլ. հասցե։');
               break;
            case 'auth/weak-password':
               setError('Գաղտնաբառը շատ թույլ է։ Խնդրում ենք օգտագործել առնվազն 6 նիշ։');
               break;
            default:
               setError('Գրանցումը ձախողվեց։ Խնդրում ենք փորձել կրկին։');
         }
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className={styles.wrapper}>
         <h2 className={styles.title}>Գրանցում</h2>
         <form className={styles.form} onSubmit={handleRegister}>
            <input
               type="email"
               placeholder="Էլ. հասցե"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               disabled={loading}
               required
               autoComplete="email"
            />
            <input
               type="password"
               placeholder="Գաղտնաբառ"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               disabled={loading}
               required
               autoComplete="new-password"
            />
            <input
               type="password"
               placeholder="Կրկնել գաղտնաբառը"
               value={repeatPassword}
               onChange={(e) => setRepeatPassword(e.target.value)}
               disabled={loading}
               required
               autoComplete="new-password"
            />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" disabled={loading}>
               {loading ? 'Գրանցվում է...' : 'Գրանցվել'}
            </button>
         </form>

         <p className={styles.loginLink}>
            Արդեն ունե՞ք հաշիվ։{' '}
            <Link to="/login" className={styles.loginLinkAnchor}>
               Մուտք գործել
            </Link>
         </p>
      </div>
   );
};

export default RegisterPage;
