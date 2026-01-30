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
  const [editData, setEditData] = useState("");
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

  const filtered = bookings.filter((b) =>
    b.clientName?.toLowerCase().includes(search.toLowerCase())
  );

  const todaysBookings = filtered.filter(
    (b) => b.eventDate === today
  );

  const upcomingBookings = filtered
    .filter((b) => b.eventDate > today)
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
      clientName: booking.clientName,
      eventType: booking.eventType,
      eventDate: booking.eventDate,
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

  const renderCards = (list, isToday) => (
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
          isOpen={openBookingId === b.id}
          isEditing={editingId === b.id}
          onToggle={handleToggle}
          onEdit={() => handleEdit(b)}
          onDelete={handleDelete}
          onSave={handleSaveEdit}
          onCancel={() => setEditingId(null)}
          editData={editData}
          setEditData={setEditData}
        />
      ))}
    </div>
  );

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2>Dashboard</h2>

        <input
          className={styles.search}
          placeholder="Search by client name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* STATS */}
      <div className={styles.stats}>
        <StatCard title="Today's Shoots" value={todaysBookings.length} />
        <StatCard title="Pending Amount" value={`₹${pendingAmount}`} />
        <StatCard title="Completed" value={completedCount} />
        <StatCard title="Total Bookings" value={bookings.length} />
      </div>

      {todaysBookings.length > 0 && (
        <section className={styles.section}>
          <p className={styles.sectionTitle}>TODAY</p>
          {renderCards(todaysBookings, true)}
        </section>
      )}

      {upcomingBookings.length > 0 && (
        <section className={styles.section}>
          <p className={styles.sectionTitle}>UPCOMING</p>
          {renderCards(upcomingBookings, false)}
        </section>
      )}

      {pastBookings.length > 0 && (
        <section className={styles.section}>
          <p className={styles.sectionTitle}>PAST</p>
          {renderCards(pastBookings, false)}
        </section>
      )}

      {filtered.length === 0 && (
        <p className={styles.empty}>No bookings found</p>
      )}
    </div>
  );
};

export default Dashboard;
