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
  where,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";
import { MOCK_BOOKINGS } from "../../data/mockData";
import StatCard from "../../components/StatCard/StatCard";
import BookingCard from "../../components/BookingCard/BookingCard";
import styles from "./Dashboard.module.css";
import { Link, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const { user, isDemoMode } = useAuth();
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode || user?.isMockUser) {
      setBookings(MOCK_BOOKINGS);
      setLoading(false);
      return;
    }

    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(data);
      setLoading(false);
    });

    return () => unsub();
  }, [isDemoMode, user?.uid]);

  const todayStr = new Date().toISOString().split("T")[0];

  // LOGIC FOR FEATURED BOOKINGS
  // 1. Latest Added (First in array due to createdAt desc)
  const latestBooking = bookings.length > 0 ? bookings[0] : null;

  // 2. Closest Upcoming (Future or Today)
  const closestUpcoming = bookings
    .filter(b => b.eventDate >= todayStr)
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))[0];

  // 3. Closest Past (Closest to today among past bookings)
  const closestPast = bookings
    .filter(b => b.eventDate < todayStr)
    .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))[0];

  // Stats
  const pendingAmount = bookings.reduce((sum, b) => sum + (b.balance || 0), 0);
  const completedCount = bookings.filter((b) => b.status === "paid").length;

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
    if (isDemoMode) {
      alert("Demo Mode: Changes not saved.");
      setEditingId(null);
      return;
    }
    const total = Number(editData.totalAmount) || 0;
    const advance = Number(editData.advancePaid) || 0;
    const balance = Math.max(total - advance, 0);
    const status = balance === 0 ? "paid" : (advance > 0 ? "advance" : "pending");

    await updateDoc(doc(db, "bookings", id), {
      ...editData,
      totalAmount: total,
      advancePaid: advance,
      balance,
      status
    });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (isDemoMode) return;
    if (!window.confirm("Delete this booking?")) return;
    await deleteDoc(doc(db, "bookings", id));
  };

  const handlePaymentUpdate = async (id, amount, total, currentPaid, newPayment) => {
    if (isDemoMode) return;
    const newPaid = currentPaid + (Number(amount) || 0);
    const newBalance = Math.max(total - newPaid, 0);

    await updateDoc(doc(db, "bookings", id), {
      advancePaid: newPaid,
      balance: newBalance,
      paymentHistory: arrayUnion(newPayment),
      status: newBalance === 0 ? "paid" : "advance",
    });
  };

  const renderFeaturedCard = (title, booking, icon) => {
    if (!booking) return (
      <div className={styles.emptyFeatured}>
        <div className={styles.featuredHeader}>
          {icon}
          <h3>{title}</h3>
        </div>
        <p>No bookings available in this category.</p>
      </div>
    );

    return (
      <div className={styles.featuredSection}>
        <div className={styles.featuredHeader}>
          {icon}
          <h3>{title}</h3>
        </div>
        <BookingCard
          key={booking.id}
          id={booking.id}
          clientName={booking.clientName}
          eventType={booking.eventType}
          eventDate={formatDate(booking.eventDate)}
          eventTime={booking.eventTime}
          location={booking.location}
          phone={booking.phone}
          totalAmount={booking.totalAmount}
          advancePaid={booking.advancePaid || 0}
          balance={booking.balance ?? booking.totalAmount}
          status={booking.status || "pending"}
          isOpen={openBookingId === booking.id}
          isEditing={false}
          onToggle={handleToggle}
          onEdit={() => navigate(`/edit-booking/${booking.id}`)}
          onDelete={handleDelete}
          onSave={handleSaveEdit}
          onCancel={() => setEditingId(null)}
          editData={editData}
          setEditData={setEditData}
          events={booking.events}
          paymentHistory={booking.paymentHistory}
          onPaymentUpdate={handlePaymentUpdate}
        />
      </div>
    );
  };

  if (loading) return <div className="flex justify-center mt-xl"><div className="spinner"></div></div>;

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2>System Overview</h2>
          <p>Welcome back, keep track of your most important shoots.</p>
        </div>
        
        <Link to="/bookings" className={styles.allBookingsBtn}>
            View All Bookings
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </Link>
      </div>

      <div className={styles.stats}>
        <StatCard
          title="Potential Income"
          value={`Rs. ${pendingAmount}`}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="12" y1="10" x2="12" y2="10"></line><line x1="2" y1="10" x2="22" y2="10"></line></svg>}
        />
        <StatCard
          title="Completed"
          value={completedCount}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
        />
        <StatCard
          title="Total Management"
          value={bookings.length}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>}
        />
      </div>

      <div className={styles.featuredGrid}>
        {renderFeaturedCard(
          "LATEST ADDED", 
          latestBooking,
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="2.5"><path d="M12 5v14M5 12h14"></path></svg>
        )}
        
        {renderFeaturedCard(
          "CLOSEST UPCOMING", 
          closestUpcoming,
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        )}

        {renderFeaturedCard(
          "CLOSEST PAST", 
          closestPast,
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="2.5"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
