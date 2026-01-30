import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { db } from "../../firebase/firebase";
import InvoicePreview from "./InvoicePreview";
import styles from "./Payments.module.css";

const Payments = () => {
  const [bookings, setBookings] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBookings(data);
    });
    return () => unsub();
  }, []);

  const suggestions = bookings.filter((b) =>
    b.clientName?.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (booking) => {
    setSelectedBooking(booking);
    setQuery(booking.clientName);

    setInvoice({
      studioName: "Taj Photography Studio",
      businessDetails:
        "Hyderabad, India\n+91 9XXXXXXXXX\ntajstudio@email.com",
      clientName: booking.clientName,
      clientPhone: booking.phone || "",
      description: `${booking.eventType} Photography`,
      totalAmount: booking.totalAmount,
      paidAmount: booking.advancePaid || 0,
      balance: booking.balance,
      status: booking.status,
      invoiceNo: `INV-${Date.now()}`,
      invoiceDate: new Date().toLocaleDateString("en-IN"),
    });
  };

  const generatePDF = () => {
    if (!invoice) return;
    setLoading(true);

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // HEADER
    doc.setFontSize(16);
    doc.text(invoice.studioName, 15, 20);
    doc.setFontSize(9);
    doc.text(invoice.businessDetails, 15, 26);

    doc.setFontSize(11);
    doc.text("INVOICE", pageWidth - 15, 20, { align: "right" });
    doc.setFontSize(9);
    doc.text(`Invoice No: ${invoice.invoiceNo}`, pageWidth - 15, 26, { align: "right" });
    doc.text(`Date: ${invoice.invoiceDate}`, pageWidth - 15, 32, { align: "right" });

    // BILL TO / EVENT
    doc.setFontSize(10);
    doc.text("BILL TO", 15, 45);
    doc.setFontSize(9);
    doc.text(invoice.clientName.toUpperCase(), 15, 51);
    if (invoice.clientPhone) doc.text(invoice.clientPhone, 15, 56);

    doc.setFontSize(10);
    doc.text("EVENT DETAILS", pageWidth / 2 + 5, 45);
    doc.setFontSize(9);
    doc.text(invoice.description, pageWidth / 2 + 5, 51);

    // TABLE
    autoTable(doc, {
      startY: 65,
      margin: { left: 15, right: 15 },
      head: [["DESCRIPTION", "AMOUNT"]],
      body: [
        [invoice.description, `₹${invoice.totalAmount}`],
        ["Paid", `₹${invoice.paidAmount}`],
        ["Balance Due", `₹${invoice.balance}`],
      ],
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      columnStyles: { 1: { halign: "right" } },
    });

    // BALANCE (BOTTOM RIGHT)
    const balanceBoxY = pageHeight - 70;
    doc.setFontSize(10);
    doc.text("BALANCE DUE", pageWidth - 60, balanceBoxY);
    doc.setFontSize(14);
    doc.text(`₹${invoice.balance}`, pageWidth - 60, balanceBoxY + 10);

    // FOOTER
    const footerY = pageHeight - 25;
    doc.setDrawColor(200);
    doc.line(15, footerY - 6, pageWidth - 15, footerY - 6);
    doc.setFontSize(8);
    doc.text(
      "Thank you for choosing Taj Photography Studio.\nThis is a computer-generated invoice and does not require a signature.",
      15,
      footerY
    );

    const fileName = `Invoice_${invoice.clientName.replace(/\s+/g, "_").toUpperCase()}_${invoice.invoiceDate.replace(/\s+/g, "_")}.pdf`;
    doc.save(fileName);

    setTimeout(() => {
      setLoading(false);
      if (invoice.clientPhone) {
        const phone = invoice.clientPhone.replace(/\D/g, "");
        window.open(`https://wa.me/${phone}`, "_blank");
      }
    }, 500);
  };

  return (
    <div className={styles.payments}>
      <div className={styles.header}>
        <h2>Payments</h2>
        <p className={styles.sub}>Generate and send professional invoices</p>
      </div>

      {/* SEARCH */}
      <div className={styles.card}>
        <label className={styles.label}>Client Name</label>
        <input
          className={styles.input}
          value={query}
          placeholder="Search client..."
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

      {/* PREVIEW */}
      {invoice && (
        <div className={styles.previewWrap}>
          <InvoicePreview invoice={invoice} />
        </div>
      )}

      {/* ACTION */}
      {invoice && (
        <div className={styles.action}>
          <button
            className={styles.generate}
            onClick={generatePDF}
            disabled={loading}
          >
            {loading ? "Generating…" : "Generate Invoice PDF"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Payments;
