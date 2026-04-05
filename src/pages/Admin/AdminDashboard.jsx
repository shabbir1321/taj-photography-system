import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, query, orderBy, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";
import { sendApprovalEmail } from "../../utils/emailService";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
    const { profile } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [provisioning, setProvisioning] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const q = query(collection(db, "profiles"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(data);
            setLoading(false);
            setErrorMessage("");
        }, (err) => {
            console.error("Firestore error:", err);
            setErrorMessage("Permission Denied: Ensure the Master Admin is activated and Firestore rules are set.");
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        if (!newEmail) return;
        setProvisioning(true);
        try {
            const userId = `pre-approved-${Date.now()}`;
            await setDoc(doc(db, "profiles", userId), {
                studioName: "Legacy Member",
                email: newEmail,
                status: "active",
                isAdmin: newEmail === "admin@studio.com",
                businessDetails: "Manually Added by Admin",
                createdAt: serverTimestamp(),
            });
            alert(`Account ${newEmail} added to directory!`);
            setNewEmail("");
        } catch (error) {
            console.error("Provisioning error:", error);
            alert("Failed to add user. Check permissions.");
        } finally {
            setProvisioning(false);
        }
    };

    const handleSyncLegacy = async () => {
        setProvisioning(true);
        try {
            const legacyEmails = ["admin@taj.com", "studio@mustafa.com"];
            let syncedCount = 0;

            for (const email of legacyEmails) {
                const exists = users.find(u => u.email === email);
                if (!exists) {
                    const userId = `legacy-${email.replace(/[@.]/g, '-')}`;
                    await setDoc(doc(db, "profiles", userId), {
                        studioName: email === "admin@taj.com" ? "Taj Photography" : "Mustafa Studio",
                        email: email,
                        status: "active",
                        isAdmin: false,
                        businessDetails: "Migrated Legacy Account",
                        createdAt: serverTimestamp(),
                    });
                    syncedCount++;
                }
            }
            alert(`Sync Complete! ${syncedCount} account(s) added to the list.`);
        } catch (error) {
            console.error("Sync error:", error);
            alert("Sync failed. Check permissions.");
        } finally {
            setProvisioning(false);
        }
    };

    const toggleApproval = async (userId, currentStatus, studioName, email) => {
        const newStatus = currentStatus === "active" ? "pending" : "active";
        try {
            await updateDoc(doc(db, "profiles", userId), {
                status: newStatus
            });
            // Send approval email only when activating (not revoking)
            if (newStatus === "active") {
                sendApprovalEmail(studioName || "Photographer", email);
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Failed to update user status.");
        }
    };

    const handleDeleteUser = async (userId, email) => {
        const confirmed = window.confirm(`Are you sure you want to permanently delete the account for "${email}"? This cannot be undone.`);
        if (!confirmed) return;
        try {
            await deleteDoc(doc(db, "profiles", userId));
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete user. Check permissions.");
        }
    };


    if (!profile?.isAdmin) {
        return <div className={styles.error}>Access Denied. Admins Only.</div>;
    }

    if (loading) return <div className="flex justify-center mt-xl"><div className="spinner"></div></div>;

    if (errorMessage) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.errorCard}>
                    <h3>Access Denied</h3>
                    <p>{errorMessage}</p>
                    <p style={{ marginTop: '20px', color: 'var(--muted)', fontSize: '13px' }}>
                        If you are the administrator, ensure you have published the <strong>Firestore Security Rules</strong> in your console.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <header className={styles.header}>
                <div className={styles.titleInfo}>
                    <h2>Studio-Portal Management</h2>
                    <p>Approve and manage photographers in the system</p>
                </div>
            </header>

            <div className={styles.tableCard}>
                <div className={styles.adminActions}>
                    <div className={styles.leftActions}>
                        <button className={styles.syncBtn} onClick={handleSyncLegacy} disabled={provisioning}>
                            {provisioning ? "SYNCING..." : "SYNC ONLY"}
                        </button>
                        <div className={styles.searchWrapper}>
                            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input 
                                type="text" 
                                placeholder="Search by email or studio..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                    </div>
                    
                    <form className={styles.quickAdd} onSubmit={handleQuickAdd}>
                        <input 
                            type="email" 
                            placeholder="Add by email..." 
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={provisioning}>
                            ADD
                        </button>
                    </form>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Studio Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Registration Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users
                            .filter(u => 
                                u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                u.studioName?.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((user) => (
                            <tr key={user.id}>
                                <td className={styles.studioCell}>{user.studioName}</td>
                                <td className={styles.emailCell}>{user.email}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${styles[user.status]}`}>
                                        {user.status || "pending"}
                                    </span>
                                </td>
                                <td className={styles.dateCell}>{user.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}</td>
                                <td>
                                    {user.isAdmin ? (
                                        <span className={styles.adminLabel}>MASTER ADMIN</span>
                                    ) : (
                                        <div className={styles.actionsGroup}>
                                            <button 
                                                className={user.status === "active" ? styles.revokeBtn : styles.approveBtn}
                                                onClick={() => toggleApproval(user.id, user.status, user.studioName, user.email)}
                                            >
                                                {user.status === "active" ? "REVOKE" : "APPROVE"}
                                            </button>
                                            <button 
                                                className={styles.deleteBtn}
                                                onClick={() => handleDeleteUser(user.id, user.email)}
                                                title="Delete Account"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && <p className={styles.empty}>No photographers registered yet.</p>}
            </div>
        </div>
    );
};

export default AdminDashboard;
