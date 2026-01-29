import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import InvoicePreview from "./InvoicePreview";
import styles from "./Payments.module.css";

const Payments = () => {
  const [bookings, setBookings] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [invoice, setInvoice] = useState(null);

  // 🔥 Fetch bookings
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(data);
    });

    return () => unsub();
  }, []);

  // 🔍 Client suggestions
  const suggestions = bookings.filter((b) =>
    b.clientName?.toLowerCase().includes(query.toLowerCase())
  );

  // 📌 Select booking + initialize invoice
  const handleSelect = (booking) => {
    setSelectedBooking(booking);
    setQuery(booking.clientName);

    setInvoice({
      studioName: "Taj Photography Studio",
      businessDetails:
        "Hyderabad, India\n+91 9XXXXXXXXX\ntajstudio@email.com",
      clientName: booking.clientName,
      clientPhone: booking.phone || "",
      clientEmail: "",
      description: `${booking.eventType} Photography`,
      totalAmount: booking.totalAmount,
      paidAmount: booking.advancePaid || 0,
      balance: booking.balance,
      status: booking.status,
      invoiceNo: `INV-${Date.now()}`,
      invoiceDate: new Date().toLocaleDateString("en-IN"),
      note:
        "Thank you for choosing Taj Photography Studio.\nThis is a computer-generated invoice and does not require a signature.",
    });
  };

  return (
    <div className={styles.payments}>
      <h2 className={styles.heading}>Invoice Generator</h2>

      {/* CLIENT SEARCH */}
      <div className={styles.card}>
        <label className={styles.label}>Client Name</label>
        <input
          type="text"
          placeholder="Search client..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedBooking(null);
            setInvoice(null);
          }}
        />

        {query && !selectedBooking && (
          <div className={styles.suggestions}>
            {suggestions.map((b) => (
              <div
                key={b.id}
                className={styles.suggestion}
                onClick={() => handleSelect(b)}
              >
                <strong>{b.clientName}</strong>
                <span>{b.eventType}</span>
              </div>
            ))}

            {suggestions.length === 0 && (
              <p className={styles.noResult}>No client found</p>
            )}
          </div>
        )}
      </div>

      {/* AUTO DETAILS */}
      {selectedBooking && (
        <div className={styles.card}>
          <h4 className={styles.sectionTitle}>Booking Summary</h4>

          <div className={styles.grid}>
            <div>
              <span>Client</span>
              <p>{selectedBooking.clientName}</p>
            </div>
            <div>
              <span>Phone</span>
              <p>{selectedBooking.phone || "-"}</p>
            </div>
            <div>
              <span>Event</span>
              <p>{selectedBooking.eventType}</p>
            </div>
            <div>
              <span>Event Date</span>
              <p>{selectedBooking.eventDate}</p>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT SUMMARY */}
      {selectedBooking && (
        <div className={styles.card}>
          <h4 className={styles.sectionTitle}>Payment Summary</h4>

          <div className={styles.amounts}>
            <div>
              <span>Total</span>
              <p>₹{selectedBooking.totalAmount}</p>
            </div>
            <div>
              <span>Paid</span>
              <p>₹{selectedBooking.advancePaid || 0}</p>
            </div>
            <div className={styles.balance}>
              <span>Balance</span>
              <p>₹{selectedBooking.balance}</p>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE PREVIEW */}
      {invoice && (
        <InvoicePreview invoice={invoice} setInvoice={setInvoice} />
      )}

      {/* ACTION */}
      {invoice && (
        <div className={styles.action}>
          <button
            className={styles.generate}
            onClick={() => alert("PDF generation next step")}
          >
            Generate Invoice PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default Payments;
