import styles from "./StatCard.module.css";

const StatCard = ({ title, value }) => {
  return (
    <div className={styles.card}>
      <p className={styles.title}>{title}</p>
      <p className={styles.value}>{value}</p>
    </div>
  );
};

export default StatCard;
