import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/catalog';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      return setError('Խնդրում ենք լրացնել էլ. հասցեն և գաղտնաբառը։');
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Էլ. հասցեն կամ գաղտնաբառը սխալ է։');
      } else if (err.code === 'auth/invalid-email') {
        setError('Էլ. հասցեն անհավասար է։ Խնդրում ենք լրացնել ճիշտ էլ. հասցե։');
      } else {
        setError('Մուտքը ձախողվեց։ Խնդրում ենք փորձել կրկին։');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Մուտք գործել</h2>
      <form className={styles.form} onSubmit={handleLogin}>
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
          autoComplete="current-password"
        />
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Մուտք գործվում է...' : 'Մուտք գործել'}
        </button>
      </form>

      <p className={styles.registerLink}>
        Արդեն չունե՞ք հաշիվ։{' '}
        <Link to="/register">
          Գրանցվել
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
