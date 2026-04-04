import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";
import styles from "./Login.module.css";

const Login = () => {
  const navigate = useNavigate();
  const { user, loginAsDemo, loginWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, send to dashboard directly
  useEffect(() => {
    if (user) {
      if (user.email === "admin@studio.com") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      // Success is handled by state updates in context
      if (email === "admin@studio.com") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.bgElements}>
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
        <div className={styles.orb3}></div>
      </div>

      <form className={styles.card} onSubmit={handleLogin}>
        <div className={styles.branding}>
          <div className={styles.genericIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </div>
          <h2>Studio-Portal</h2>
          <p>Secure Photographer Login</p>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.inputGroup}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
                <button className={styles.loginBtn} disabled={loading} type="submit">
                    {loading ? "AUTHENTICATING..." : "ENTRY"}
                </button>

                <Link to="/signup" className={styles.joinBtn}>
                    JOIN AS PHOTOGRAPHER
                </Link>

                <div className={styles.divider}>
                    <span>OR</span>
                </div>

                <button 
                    type="button" 
                    className={styles.demoBtn} 
                    onClick={loginAsDemo}
                >
                    TRY DEMO PORTAL
                </button>
            </form>
        </div>
    );
};

export default Login;
