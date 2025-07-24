import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {

   const register = async (email, password) => {
      const response = await fetch('http://localhost:5000/api/auth/register', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
         throw new Error(data.message || 'Ошибка при регистрации');
      }
      return data;
   };

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
         navigate('/catalog');
      } catch (err) {
         // Временно общий catch без конкретных ошибок
         setError('Գրանցումը ձախողվեց։ Խնդրում ենք փորձել կրկին։');
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
