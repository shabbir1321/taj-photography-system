import { useState, useRef } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";
import styles from "./Profile.module.css";

const Profile = () => {
  const { user, profile, updateProfile, isDemoMode } = useAuth();
  const [studioName, setStudioName] = useState(profile?.studioName || "");
  const [businessDetails, setBusinessDetails] = useState(profile?.businessDetails || "");
  const [logoUrl, setLogoUrl] = useState(profile?.logoUrl || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef();

  const handleLogoChange = (e) => {
    const val = e.target.value;
    setLogoUrl(val);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isDemoMode) {
      alert("Profile updated (Simulated)!");
      updateProfile({ studioName, businessDetails, logoUrl });
      return;
    }

    setSaving(true);
    try {
      const updatedProfile = {
        studioName,
        businessDetails,
        logoUrl,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, "profiles", user.uid), updatedProfile);
      updateProfile(updatedProfile);
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2>Studio Profile</h2>
        <p>Set your brand identity for bills and portal branding</p>
      </div>

      <form className={styles.form} onSubmit={handleSave}>
        <div className={styles.card}>
          <div className={styles.inputGroup}>
            <label>Studio / Business Name</label>
            <input 
              type="text" 
              value={studioName} 
              onChange={(e) => setStudioName(e.target.value)} 
              placeholder="e.g. Taj Photography Studio"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Business Details (Address, Phone, Email etc.)</label>
            <textarea 
              value={businessDetails} 
              onChange={(e) => setBusinessDetails(e.target.value)} 
              placeholder="Line 1: Address&#10;Line 2: Phone Number&#10;Line 3: GST or Email"
              rows={4}
              required
            />
            <p className={styles.hint}>This will appear exactly as typed on your generated PDF bills.</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Saving..." : "Save Identity"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
