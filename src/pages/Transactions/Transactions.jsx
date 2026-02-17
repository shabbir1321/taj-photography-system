import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import styles from "./Transactions.module.css";

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snapshot) => {
            const allTransactions = [];
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.paymentHistory && Array.isArray(data.paymentHistory)) {
                    data.paymentHistory.forEach(payment => {
                        allTransactions.push({
                            id: `${doc.id}-${payment.date}-${payment.amount}`,
                            clientName: data.clientName,
                            ...payment
                        });
                    });
                }
            });

            // Sort by date descending
            allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTransactions(allTransactions);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const filtered = transactions.filter(t =>
        t.clientName?.toLowerCase().includes(search.toLowerCase()) ||
        t.mode?.toLowerCase().includes(search.toLowerCase())
    );

    const totalCollected = filtered.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    if (loading) return <div className="flex justify-center mt-lg"><div className="spinner"></div></div>;

    return (
        <div className={styles.wrapper}>
            <header className={styles.header}>
                <div className={styles.titleInfo}>
                    <h2>Payment History</h2>
                    <p>Financial records of all transactions received</p>
                </div>
                <div className={styles.searchBar}>
                    <span className={styles.searchIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search by client or mode..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </header>

            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Transactions</span>
                    <span className={styles.statValue}>{filtered.length}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Collected</span>
                    <span className={styles.statValue}>Rs. {totalCollected.toLocaleString('en-IN')}</span>
                </div>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Client Name</th>
                                <th>Amount</th>
                                <th>Payment Mode</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((t) => (
                                <tr key={t.id}>
                                    <td className={styles.dateCell}>{t.date}</td>
                                    <td className={styles.clientCell}>{t.clientName}</td>
                                    <td className={styles.amountCell}>Rs. {t.amount}</td>
                                    <td className={styles.modeCell}>
                                        <span className={`${styles.modeBadge} ${styles[t.mode.toLowerCase()] || ''}`}>
                                            {t.mode}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className={styles.empty}>
                        <p>No transactions found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;
