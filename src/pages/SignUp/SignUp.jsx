import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { sendWelcomeEmail } from "../../utils/emailService";
import styles from "../Login/Login.module.css"; // Reuse login styles for consistency

const SignUp = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [studioName, setStudioName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signUp(email, password, studioName);
            // Send welcome email — non-blocking, fire and forget
            sendWelcomeEmail(studioName, email);
            navigate("/pending");
        } catch (err) {
            setError(err.message || "Failed to create account");
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

            <form className={styles.card} onSubmit={handleSignUp}>
                <div className={styles.branding}>
                    <div className={styles.genericIcon}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    </div>
                    <h2>Photographer Registration</h2>
                    <p>Create your private Studio-Portal</p>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        placeholder="Studio / Business Name"
                        value={studioName}
                        onChange={(e) => setStudioName(e.target.value)}
                        required
                    />
                </div>

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
                        placeholder="Choose Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button className={styles.loginBtn} disabled={loading}>
                    {loading ? "CREATING ACCOUNT..." : "REGISTER"}
                </button>

                <div className={styles.footer}>
                    <p>Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>Login here</Link></p>
                </div>
            </form>
        </div>
    );
};

export default SignUp;
