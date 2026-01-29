import styles from "./InvoicePreview.module.css";

const InvoicePreview = ({ invoice, setInvoice }) => {
  return (
    <div className={styles.wrapper}>
      <p className={styles.previewLabel}>INVOICE PREVIEW</p>

      <div className={styles.invoice}>
        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <img
              src="/taj.jpg"
              alt="Studio Logo"
              className={styles.logo}
            />
            <input
              className={styles.studioName}
              value={invoice.studioName}
              onChange={(e) =>
                setInvoice({ ...invoice, studioName: e.target.value })
              }
            />
          </div>

          <div className={styles.invoiceMeta}>
            <h2>INVOICE</h2>
            <p>Invoice No: {invoice.invoiceNo}</p>
            <p>Date: {invoice.invoiceDate}</p>
          </div>
        </div>

        {/* BUSINESS DETAILS */}
        <textarea
          className={styles.business}
          value={invoice.businessDetails}
          onChange={(e) =>
            setInvoice({ ...invoice, businessDetails: e.target.value })
          }
        />

        {/* CLIENT */}
        <div className={styles.section}>
          <h4>BILL TO</h4>
          <p>{invoice.clientName}</p>
          <input
            value={invoice.clientEmail}
            onChange={(e) =>
              setInvoice({ ...invoice, clientEmail: e.target.value })
            }
            placeholder="Client Email"
          />
          <p>{invoice.clientPhone}</p>
        </div>

        {/* TABLE */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Description</th>
              <th align="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input
                  value={invoice.description}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      description: e.target.value,
                    })
                  }
                />
              </td>
              <td align="right">₹{invoice.totalAmount}</td>
            </tr>
            <tr>
              <td>Paid</td>
              <td align="right">₹{invoice.paidAmount}</td>
            </tr>
            <tr className={styles.balance}>
              <td>Balance Due</td>
              <td align="right">₹{invoice.balance}</td>
            </tr>
          </tbody>
        </table>

        {/* STATUS */}
        <p className={styles.status}>
          Status: <strong>{invoice.status.toUpperCase()}</strong>
        </p>

        {/* FOOTER */}
        <textarea
          className={styles.footer}
          value={invoice.note}
          onChange={(e) =>
            setInvoice({ ...invoice, note: e.target.value })
          }
        />
      </div>
    </div>
  );
};

export default InvoicePreview;
