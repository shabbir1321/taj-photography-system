import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "../Login/Login.module.css";

const PendingView = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // 💡 Redirect to login if user logs out
    useEffect(() => {
        if (user === null) {
            navigate("/login", { replace: true });
        }
    }, [user, navigate]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.bgElements}>
                <div className={styles.orb1}></div>
                <div className={styles.orb2}></div>
                <div className={styles.orb3}></div>
            </div>

            <div className={styles.card} style={{ 
                textAlign: 'center', 
                padding: '40px', 
                backgroundColor: 'rgba(26, 26, 26, 0.8)', 
                border: '1px solid #C9A24D',
                maxWidth: '500px'
            }}>
                <div className={styles.branding}>
                    <div className={styles.genericIcon} style={{ background: 'rgba(201, 162, 77, 0.1)', border: '1px solid #C9A24D' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C9A24D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <h2 style={{ color: '#fff', marginBottom: '10px' }}>Account Pending Approval</h2>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginTop: '10px' }}>
                        Welcome to Studio-Portal! Your account has been successfully created.
                    </p>
                </div>

                <div style={{ margin: '30px 0', color: '#fff', lineHeight: '1.6' }}>
                    <p>Our administrators are currently reviewing your registration.</p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', marginTop: '8px' }}>
                        You will gain access to your private CRM and billing tools once your identity is validated.
                    </p>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '5px' }}>Contact Admin for urgent access:</p>
                    <p style={{ fontWeight: 'bold', color: '#C9A24D', fontSize: '16px' }}>admin@studio.com</p>
                </div>

                <button 
                  onClick={handleLogout}
                  className={styles.loginBtn} 
                  style={{ 
                    marginTop: '30px', 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                    LOGOUT & CHECK LATER
                </button>
            </div>
        </div>
    );
};

export default PendingView;
