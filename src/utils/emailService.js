import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_sl9u5uf";
const PUBLIC_KEY = "21FQiZQ7n4McE03zS";
const WELCOME_TEMPLATE_ID = "template_dy1f5u8";
const APPROVAL_TEMPLATE_ID = "template_k12w6uv";

/**
 * Send welcome email to photographer after signup.
 * @param {string} studioName - The studio/business name
 * @param {string} email - The photographer's email
 */
export const sendWelcomeEmail = async (studioName, email) => {
  try {
    await emailjs.send(
      SERVICE_ID,
      WELCOME_TEMPLATE_ID,
      {
        studio_name: studioName,
        user_email: email,
      },
      PUBLIC_KEY
    );
    console.log("Welcome email sent successfully.");
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    // Non-blocking — don't throw, just log
  }
};

/**
 * Send approval email to photographer when admin approves their account.
 * @param {string} studioName - The studio/business name
 * @param {string} email - The photographer's email
 */
export const sendApprovalEmail = async (studioName, email) => {
  try {
    await emailjs.send(
      SERVICE_ID,
      APPROVAL_TEMPLATE_ID,
      {
        studio_name: studioName,
        user_email: email,
      },
      PUBLIC_KEY
    );
    console.log("Approval email sent successfully.");
  } catch (error) {
    console.error("Failed to send approval email:", error);
    // Non-blocking — don't throw, just log
  }
};
