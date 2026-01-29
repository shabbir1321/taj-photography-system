import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} onClick={() => navigate("/")}>
        <img src="/taj.jpg" alt="" />
      </div>
      <div>
        <h2 className={styles.title}>Taj Photography Studio</h2>
      </div>

      <ul className={styles.links}>
        <li onClick={() => navigate("/")}>Dashboard</li>
        <li onClick={() => navigate("/add-booking")}>Add Booking</li>
        <li onClick={() => navigate("/tasks")}>Tasks</li>
        <li onClick={() => navigate("/payments")}>Payments</li>
      </ul>
    </nav>
  );
};

export default Navbar;
