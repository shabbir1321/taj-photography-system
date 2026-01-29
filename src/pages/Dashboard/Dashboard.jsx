import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
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
  const [editData, setEditData] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(data);
    });

    return () => unsubscribe();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const handleToggle = (id) => {
    if (editingId) return;
    setOpenBookingId((prev) => (prev === id ? null : id));
  };

  // 🔍 Search by client name
  const filteredBookings = bookings.filter((b) =>
    b.clientName?.toLowerCase().includes(search.toLowerCase())
  );

  // Grouping + sorting
  const todaysBookings = filteredBookings.filter(
    (b) => b.eventDate === today
  );

  const upcomingBookings = filteredBookings
    .filter((b) => b.eventDate > today)
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

  const pastBookings = filteredBookings
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

  // ✏️ Edit booking
  const handleEdit = (booking) => {
    setEditingId(booking.id);
    setEditData({
      clientName: booking.clientName,
      eventType: booking.eventType,
      eventDate: booking.eventDate,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = async (id) => {
    await updateDoc(doc(db, "bookings", id), editData);
    setEditingId(null);
  };

  // 💰 PAYMENT LOGIC (FINAL)
  const handlePaymentUpdate = async (
    id,
    nextPayment,
    totalAmount,
    currentAdvance
  ) => {
    const newAdvance = Math.min(
      currentAdvance + nextPayment,
      totalAmount
    );

    const balance = totalAmount - newAdvance;
    const status = newAdvance === totalAmount ? "paid" : "pending";

    await updateDoc(doc(db, "bookings", id), {
      advancePaid: newAdvance,
      balance,
      status,
    });
  };

  // 🗑️ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    await deleteDoc(doc(db, "bookings", id));
  };

  const renderCards = (list, isTodayFlag) => (
    <div className={styles.bookingGrid}>
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
          isToday={isTodayFlag}
          isOpen={openBookingId === b.id}
          isEditing={editingId === b.id}
          onToggle={handleToggle}
          onEdit={() => handleEdit(b)}
          onDelete={handleDelete}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          editData={editData}
          setEditData={setEditData}
          onPaymentUpdate={handlePaymentUpdate}
        />
      ))}
    </div>
  );

  return (
    <div className={styles.dashboard}>
      <h2 className={styles.heading}>Dashboard</h2>

      {/* STATS */}
      <div className={styles.stats}>
        <StatCard title="Today's Shoots" value={todaysBookings.length} />
        <StatCard title="Pending Amount" value={`₹${pendingAmount}`} />
        <StatCard title="Completed" value={completedCount} />
        <StatCard title="All Bookings" value={bookings.length} />
      </div>

      {/* SEARCH */}
      <div className={styles.searchBox}>
        <input
          placeholder="Search by client name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {todaysBookings.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>TODAY</h4>
          {renderCards(todaysBookings, true)}
        </div>
      )}

      {upcomingBookings.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>UPCOMING</h4>
          {renderCards(upcomingBookings, false)}
        </div>
      )}

      {pastBookings.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>PAST</h4>
          {renderCards(pastBookings, false)}
        </div>
      )}

      {filteredBookings.length === 0 && (
        <p className={styles.empty}>No bookings match your search</p>
      )}
    </div>
  );
};

export default Dashboard;
