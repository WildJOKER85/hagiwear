import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../features/auth/authSlice'; // Путь поправь под свой
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const dispatch = useDispatch();
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
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.error || 'Մուտքը ձախողվեց։');
      }

      localStorage.setItem('userEmail', data.user.email);
      dispatch(login(data.user));
      navigate(from, { replace: true });
    } catch (err) {
      setError('Սերվերի սխալ։ Խնդրում ենք փորձել քիչ անց։');
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
        Չունե՞ք հաշիվ։ <Link to="/register">Գրանցվել</Link>
      </p>
    </div>
  );
};

export default LoginPage;
