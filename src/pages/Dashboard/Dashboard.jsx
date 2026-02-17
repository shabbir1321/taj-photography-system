import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";
import StatCard from "../../components/StatCard/StatCard";
import BookingCard from "../../components/BookingCard/BookingCard";
import styles from "./Dashboard.module.css";

// Format date → 14 Feb 2026
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [openBookingId, setOpenBookingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    clientName: "",
    eventType: "",
    eventDate: "",
    totalAmount: "",
    advancePaid: "",
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "bookings"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(data);
    });

    return () => unsub();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const next48h = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split("T")[0];

  const filtered = bookings.filter((b) =>
    b.clientName?.toLowerCase().includes(search.toLowerCase())
  );

  const todaysBookings = filtered.filter(
    (b) => b.eventDate === today
  );

  const urgentBookings = filtered.filter(
    (b) => b.eventDate > today && b.eventDate <= next48h
  );

  const upcomingBookings = filtered
    .filter((b) => b.eventDate > next48h)
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

  const pastBookings = filtered
    .filter((b) => b.eventDate < today)
    .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

  // Stats
  const pendingAmount = bookings.reduce(
    (sum, b) => sum + (b.balance || 0),
    0
  );

  const completedCount = bookings.filter(
    (b) => b.status === "paid"
  ).length;

  const handleToggle = (id) => {
    if (editingId) return;
    setOpenBookingId((prev) => (prev === id ? null : id));
  };

  const handleEdit = (booking) => {
    setEditingId(booking.id);
    setEditData({
      clientName: booking.clientName || "",
      eventType: booking.eventType || "",
      eventDate: booking.eventDate || "",
      totalAmount: booking.totalAmount || "",
      advancePaid: booking.advancePaid || "",
    });
  };

  const handleSaveEdit = async (id) => {
    await updateDoc(doc(db, "bookings", id), editData);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    await deleteDoc(doc(db, "bookings", id));
  };

  const handlePaymentUpdate = async (id, amount, total, currentPaid, newPayment) => {
    const newPaid = currentPaid + amount;
    const newBalance = Math.max(total - newPaid, 0);

    const updateData = {
      advancePaid: newPaid,
      balance: newBalance,
      paymentHistory: arrayUnion(newPayment),
      status: newBalance === 0 ? "paid" : "advance",
    };

    await updateDoc(doc(db, "bookings", id), updateData);
  };

  const renderCards = (list, isToday, isUrgent) => (
    <div className={styles.cards}>
      {list.map((b) => (
        <BookingCard
          key={b.id}
          id={b.id}
          clientName={b.clientName}
          eventType={b.eventType}
          eventDate={formatDate(b.eventDate)}
          eventTime={b.eventTime}
          location={b.location}
          phone={b.phone}
          totalAmount={b.totalAmount}
          advancePaid={b.advancePaid || 0}
          balance={b.balance ?? b.totalAmount}
          status={b.status || "pending"}
          isToday={isToday}
          isUrgent={isUrgent}
          isOpen={openBookingId === b.id}
          isEditing={editingId === b.id}
          onToggle={handleToggle}
          onEdit={() => handleEdit(b)}
          onDelete={handleDelete}
          onSave={handleSaveEdit}
          onCancel={() => setEditingId(null)}
          editData={editData}
          setEditData={setEditData}
          events={b.events}
          paymentHistory={b.paymentHistory}
          onPaymentUpdate={handlePaymentUpdate}
        />
      ))}
    </div>
  );

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2>System Overview</h2>

        <input
          className={styles.search}
          placeholder="Search by client name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* STATS */}
      <div className={styles.stats}>
        <StatCard
          title="Today's Shoots"
          value={todaysBookings.length}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>}
        />
        <StatCard
          title="Pending Amount"
          value={`Rs. ${pendingAmount}`}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="12" y1="10" x2="12" y2="10"></line><line x1="2" y1="10" x2="22" y2="10"></line></svg>}
        />
        <StatCard
          title="Completed"
          value={completedCount}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
        />
        <StatCard
          title="Total Bookings"
          value={bookings.length}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>}
        />
      </div>

      {todaysBookings.length > 0 && (
        <section className={styles.section}>
          <p className={styles.sectionTitle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            TODAY
          </p>
          {renderCards(todaysBookings, true, false)}
        </section>
      )}

      {urgentBookings.length > 0 && (
        <section className={styles.section}>
          <p className={styles.sectionTitle} style={{ color: 'var(--error)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            URGENT (Next 48h)
          </p>
          {renderCards(urgentBookings, false, true)}
        </section>
      )}

      {upcomingBookings.length > 0 && (
        <section className={styles.section}>
          <p className={styles.sectionTitle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            UPCOMING
          </p>
          {renderCards(upcomingBookings, false, false)}
        </section>
      )}

      {pastBookings.length > 0 && (
        <section className={styles.section}>
          <p className={styles.sectionTitle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
            PAST
          </p>
          {renderCards(pastBookings, false, false)}
        </section>
      )}

      {filtered.length === 0 && (
        <p className={styles.empty}>No bookings found</p>
      )}
    </div>
  );
};

export default Dashboard;
