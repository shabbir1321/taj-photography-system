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

import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";
import { MOCK_BOOKINGS } from "../../data/mockData";
import BookingRow from "../../components/BookingRow/BookingRow";
import styles from "./Bookings.module.css";

// Format date → 14 Feb 2026
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Bookings = () => {
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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode || user?.isMockUser) {
      setBookings(MOCK_BOOKINGS);
      setLoading(false);
      return;
    }

    if (!user) return;

    // Sorting by eventDate conceptually better for tabular schedules, but using createdAt to keep newest at top
    const q = query(
      collection(db, "bookings"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const raw = doc.data();
        let fallbackDate = "N/A";
        if (raw.createdAt?.toDate) {
            fallbackDate = raw.createdAt.toDate().toISOString().split('T')[0];
        } else if (raw.createdAt) {
           fallbackDate = new Date(raw.createdAt).toISOString().split('T')[0];
        }
        return {
          id: doc.id,
          bookingDate: fallbackDate,
          ...raw,
        };
      });
      setBookings(data);
      setLoading(false);
    });

    return () => unsub();
  }, [isDemoMode, user?.uid]);

  const filtered = bookings.filter((b) =>
    b.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    b.eventType?.toLowerCase().includes(search.toLowerCase())
  );

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
      alert("Demo Mode: Changes are not saved.");
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
    if (isDemoMode) {
      alert("Demo Mode: Deletion is disabled.");
      return;
    }
    if (!window.confirm("Delete this booking?")) return;
    await deleteDoc(doc(db, "bookings", id));
  };

  const handlePaymentUpdate = async (id, amount, total, currentPaid, newPayment) => {
    if (isDemoMode) {
      alert("Demo Mode: Payment updates not saved.");
      return;
    }
    const newPaid = currentPaid + (Number(amount) || 0);
    const newBalance = Math.max(total - newPaid, 0);

    await updateDoc(doc(db, "bookings", id), {
      advancePaid: newPaid,
      balance: newBalance,
      paymentHistory: arrayUnion(newPayment),
      status: newBalance === 0 ? "paid" : "advance",
    });
  };

  if (loading) return <div className="flex justify-center mt-xl"><div className="spinner"></div></div>;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.titleInfo}>
          <h2>Bookings Directory</h2>
          <p>Total {bookings.length} events managed</p>
        </div>

        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input
            type="text"
            placeholder="Search by client or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {filtered.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.nameColHeader}>CLIENT & EVENT</th>
                <th className={styles.dateColHeader}>EVENT DATE</th>
                <th className={styles.statusColHeader}>STATUS</th>
                <th className={styles.balanceColHeader}>BALANCE</th>
                <th className={styles.actionsColHeader}>ACTIONS</th>
              </tr>
            </thead>
            {filtered.map((b) => (
              <BookingRow
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
                isOpen={openBookingId === b.id}
                isEditing={false}
                onToggle={handleToggle}
                onEdit={() => navigate(`/edit-booking/${b.id}`)}
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
          </table>
        </div>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <h3>No bookings found</h3>
          <p>Try searching for a different client or event name.</p>
        </div>
      )}
    </div>
  );
};

export default Bookings;
