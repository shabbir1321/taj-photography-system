import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, serverTimestamp, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";
import styles from "./AddBooking.module.css";

const AddBooking = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const { user, isDemoMode } = useAuth();
  
  const [loading, setLoading] = useState(!!id);

  // Client
  const [clientName, setClientName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);

  // Events (Multiple)
  const [events, setEvents] = useState([
    { date: "", time: "", location: "", functionName: "" },
  ]);

  const [eventType, setEventType] = useState("Wedding");
  const [clientSuggestions, setClientSuggestions] = useState([]);

  // Fetch unique client names for suggestions
  useEffect(() => {
    if (!user || isDemoMode) return;
    const fetchClients = async () => {
      try {
        const q = query(collection(db, "bookings"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const names = new Set();
        snap.forEach(d => {
          if (d.data().clientName) names.add(d.data().clientName);
        });
        setClientSuggestions(Array.from(names));
      } catch(err) {
        console.error("Failed to fetch client suggestions", err);
      }
    };
    fetchClients();
  }, [user, isDemoMode]);

  // Payment
  const [totalAmount, setTotalAmount] = useState("");
  const [advancePaid, setAdvancePaid] = useState("");
  const [advanceDate, setAdvanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id || isDemoMode) return;
      try {
        const docRef = doc(db, "bookings", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setClientName(data.clientName || "");
          setEventType(data.eventType || "Wedding");
          setTotalAmount(data.totalAmount || "");
          setAdvancePaid(data.advancePaid || "");
          setPaymentHistory(data.paymentHistory || []);
          setBookingDate(data.bookingDate || new Date(data.createdAt?.toMillis() || Date.now()).toISOString().split('T')[0]);
          
          if (data.events && data.events.length > 0) {
            setEvents(data.events);
          } else {
            // fallback for older bookings
            setEvents([{ date: data.eventDate || "", time: data.eventTime || "", location: data.location || "", functionName: "" }]);
          }

          // parse phone if it has country code (rudimentary split)
          if (data.phone) {
            if (data.phone.startsWith("+91")) { setCountryCode("+91"); setPhone(data.phone.substring(3)); }
            else if (data.phone.startsWith("+1")) { setCountryCode("+1"); setPhone(data.phone.substring(2)); }
            else if (data.phone.startsWith("+44")) { setCountryCode("+44"); setPhone(data.phone.substring(3)); }
            else if (data.phone.startsWith("+971")) { setCountryCode("+971"); setPhone(data.phone.substring(4)); }
            else if (data.phone.startsWith("+966")) { setCountryCode("+966"); setPhone(data.phone.substring(4)); }
            else if (data.phone.startsWith("+61")) { setCountryCode("+61"); setPhone(data.phone.substring(3)); }
            else { setPhone(data.phone); }
          }
        }
      } catch (error) {
        console.error("Error fetching booking", error);
      }
      setLoading(false);
    };

    if (id) {
      fetchBooking();
    }
  }, [id, isDemoMode]);

  const total = Number(totalAmount) || 0;
  const advance = Number(advancePaid) || 0;
  const balance = Math.max(total - advance, 0);

  const addEvent = () => {
    setEvents([...events, { date: "", time: "", location: "", functionName: "" }]);
  };

  const removeEvent = (index) => {
    if (events.length > 1) {
      setEvents(events.filter((_, i) => i !== index));
    }
  };

  const updateEvent = (index, field, value) => {
    const updatedEvents = [...events];
    updatedEvents[index][field] = value;
    setEvents(updatedEvents);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Minimal validation
    const hasWaitRequired = events.some(ev => !ev.date);
    if (!clientName || hasWaitRequired || !totalAmount) {
      alert("Please fill required fields (Client Name, Event Dates, and Total Amount)");
      return;
    }

    // Use first event for top-level compatibility
    const firstEvent = events[0];

    // Build payment history array
    let updatedHistory = [...paymentHistory];
    
    // Only push to history if this is a NEW booking with an advance, 
    // OR if we wanted to register advance modifications (we will just keep original history for now during edit)
    if (!id && advance > 0) {
      updatedHistory.push({
        amount: advance,
        date: advanceDate,
        mode: paymentMode,
      });
    }

    const bookingData = {
      clientName,
      phone: `${countryCode}${phone}`,
      eventType,
      bookingDate, // Timestamp string of when they booked
      events, // Full events array
      eventDate: firstEvent.date,
      eventTime: firstEvent.time,
      location: firstEvent.location,

      totalAmount: total,
      advancePaid: advance,
      balance,
      paymentHistory: updatedHistory, // Track payment history

      status:
        balance === 0
          ? "paid"
          : advance > 0
            ? "advance"
            : "pending",

      userId: user.uid, // Tag the booking with the current user's ID
    };

    if (isDemoMode) {
      alert(`Demo Mode Success! Record ${id ? 'updated' : 'simulated'} but not saved.`);
      navigate(-1);
      return;
    }

    try {
      if (id) {
        // Edit mode
        await updateDoc(doc(db, "bookings", id), bookingData);
      } else {
        // Create mode
        bookingData.createdAt = serverTimestamp();
        await addDoc(collection(db, "bookings"), bookingData);
      }
      navigate(-1);
    } catch (error) {
      console.error("Error saving booking:", error);
      alert("Failed to save booking. Please check console for details.");
    }
  };

  if (loading) return <div className="flex justify-center mt-xl"><div className="spinner"></div></div>;

  return (
    <>
      <div className={styles.wrapper}>
        <h2 className={styles.heading}>{id ? "Edit Booking Record" : "New Booking Record"}</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Client */}
          <div className={styles.group}>
            <h4 className={styles.groupTitle}>Client Details</h4>

            <label>
              Client Name
              <input
                type="text"
                list="client-suggestions"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
              />
              <datalist id="client-suggestions">
                {clientSuggestions.map((name, idx) => (
                  <option key={idx} value={name} />
                ))}
              </datalist>
            </label>

            <div className={styles.phoneInput}>
              <label className={styles.countrySelect}>
                Code
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+971">+971 (UAE)</option>
                  <option value="+966">+966 (KSA)</option>
                  <option value="+61">+61 (AU)</option>
                </select>
              </label>

              <label className={styles.phoneField}>
                Phone Number
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </label>
            </div>

            <div className={styles.phoneInput}>
              <label className={styles.countrySelect} style={{ flex: 1 }}>
                Date of Booking
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card)' }}
                />
              </label>

              <label style={{ flex: 1, marginTop: '2px' }}>
                Main Event Type
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card)' }}
                >
                  <option>Wedding</option>
                  <option>Birthday</option>
                  <option>Pre-Wedding</option>
                  <option>Baby Shower</option>
                  <option>Maternity</option>
                  <option>Other</option>
                </select>
              </label>
            </div>
          </div>

          {/* Events */}
          <div className={styles.group}>
            <div className={styles.groupHeader}>
              <h4 className={styles.groupTitle}>Schedule (Dates)</h4>
              <button type="button" className={styles.addBtn} onClick={addEvent}>
                + Add Date
              </button>
            </div>

            {events.map((event, index) => (
              <div key={index} className={styles.eventRow}>
                <div className={styles.eventIndex}>Date {index + 1}</div>
                <div className={styles.eventFields}>
                  <label>
                    What function? (e.g. Reception, Haldi)
                    <input
                      type="text"
                      value={event.functionName || ""}
                      onChange={(e) => updateEvent(index, "functionName", e.target.value)}
                      placeholder="Enter function name"
                    />
                  </label>
                  <div className={styles.dateTimeRow}>
                    <label>
                      Date
                      <input
                        type="date"
                        value={event.date || ""}
                        onChange={(e) => updateEvent(index, "date", e.target.value)}
                      />
                    </label>
                    <label>
                      Time
                      <input
                        type="time"
                        value={event.time || ""}
                        onChange={(e) => updateEvent(index, "time", e.target.value)}
                      />
                    </label>
                  </div>
                  <label>
                    Location
                    <input
                      type="text"
                      value={event.location || ""}
                      onChange={(e) => updateEvent(index, "location", e.target.value)}
                      placeholder="Event location"
                    />
                  </label>
                </div>
                {events.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeEvent(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Payment */}
          <div className={styles.group}>
            <h4 className={styles.groupTitle}>Payment Details</h4>

            <label>
              Total Amount
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="Rs."
              />
            </label>

            <label>
              Advance Paid
              <input
                type="number"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
                placeholder="Rs."
                disabled={!!id} // Do not change total advance from here if editing, use payment update instead ideally, or we can leave it enabled for master edit
              />
              {!!id && <small style={{ color: "var(--text-muted)", display: "block", marginTop: "4px" }}>Use quick payment form on booking list to add split payments safely.</small>}
            </label>

            {!id && (
              <div className={styles.dateTimeRow}>
                <label>
                  Payment Date
                  <input
                    type="date"
                    value={advanceDate}
                    onChange={(e) => setAdvanceDate(e.target.value)}
                  />
                </label>
                <label>
                  Payment Mode
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Card</option>
                    <option>Bank Transfer</option>
                  </select>
                </label>
              </div>
            )}

            <label>
              Balance
              <input type="number" value={balance} disabled />
            </label>
          </div>

          {/* Notes */}
          <div className={styles.group}>
            <h4 className={styles.groupTitle}>Notes</h4>
            <textarea placeholder="Special instructions, deliverables, etc." />
          </div>

          {/* ACTION BAR moved inside form */}
          <div className={styles.actionBar}>
            <button type="submit" className={styles.submit}>
              {id ? "Save Changes" : "Confirm Record"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddBooking;
