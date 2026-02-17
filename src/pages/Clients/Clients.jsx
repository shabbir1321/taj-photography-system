import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import styles from "./Clients.module.css";
import { Link } from "react-router-dom";

const Clients = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "bookings"), (snapshot) => {
            const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setBookings(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // Group bookings by client phone
    const clientMap = bookings.reduce((acc, booking) => {
        const phone = booking.phone || "No Phone";
        if (!acc[phone]) {
            acc[phone] = {
                name: booking.clientName,
                phone,
                bookings: [],
                totalSpent: 0,
                lastBookingDate: booking.eventDate,
            };
        }
        acc[phone].bookings.push(booking);
        acc[phone].totalSpent += Number(booking.totalAmount) || 0;

        // Update last booking date if this one is newer
        if (new Date(booking.eventDate) > new Date(acc[phone].lastBookingDate)) {
            acc[phone].lastBookingDate = booking.eventDate;
        }

        return acc;
    }, {});

    const clientList = Object.values(clientMap).filter(client =>
        client.name?.toLowerCase().includes(search.toLowerCase()) ||
        client.phone?.includes(search)
    ).sort((a, b) => b.totalSpent - a.totalSpent);

    if (loading) return <div className="flex justify-center mt-lg"><div className="spinner"></div></div>;

    return (
        <div className={styles.wrapper}>
            <header className={styles.header}>
                <div className={styles.titleInfo}>
                    <h2>Client Directory</h2>
                    <p>Manage your client relationships and booking history</p>
                </div>
                <div className={styles.searchBar}>
                    <span className={styles.searchIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search clients by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </header>

            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Clients</span>
                    <span className={styles.statValue}>{Object.keys(clientMap).length}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Avg. Value</span>
                    <span className={styles.statValue}>
                        Rs. {Math.round(bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0) / (Object.keys(clientMap).length || 1))}
                    </span>
                </div>
            </div>

            <div className={styles.clientGrid}>
                {clientList.map((client) => (
                    <div key={client.phone} className={styles.clientCard}>
                        <div className={styles.clientHeader}>
                            <div className={styles.avatar}>
                                {client.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.nameInfo}>
                                <h3>{client.name}</h3>
                                <p>{client.phone}</p>
                            </div>
                        </div>

                        <div className={styles.clientDetails}>
                            <div className={styles.detail}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                    Total Bookings
                                </span>
                                <strong>{client.bookings.length}</strong>
                            </div>
                            <div className={styles.detail}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                    Total Revenue
                                </span>
                                <strong className={styles.revenue}>Rs. {client.totalSpent.toLocaleString('en-IN')}</strong>
                            </div>
                            <div className={styles.detail}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    Last Event
                                </span>
                                <strong>{client.lastBookingDate}</strong>
                            </div>
                        </div>

                        <div className={styles.historySection}>
                            <p className={styles.historyTitle}>Recent Events</p>
                            <div className={styles.events}>
                                {client.bookings.slice(0, 3).map((b, idx) => (
                                    <div key={idx} className={styles.miniBooking}>
                                        <span>{b.eventType}</span>
                                        <span>{b.eventDate}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className={styles.contactBtn} onClick={() => window.open(`https://wa.me/${client.phone.replace(/\D/g, "")}`, "_blank")}>
                            Contact via WhatsApp
                        </button>
                    </div>
                ))}
            </div>

            {clientList.length === 0 && (
                <div className={styles.empty}>
                    <span className={styles.emptyIcon}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </span>
                    <h3>No clients found</h3>
                    <p>Try searching with a different name or add a new booking.</p>
                </div>
            )}
        </div>
    );
};

export default Clients;
