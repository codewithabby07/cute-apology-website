import CuteApologyApp, { defaultTemplateData } from "../CuteApology.jsx";
import BirthdayWish from "../components/BirthdayWish.jsx";

/**
 * Reusable Template Registry
 * Central repository of all available personalized templates.
 */

const registry = new Map();

// 1. Register the original Cute Apology Template
registry.set("cute-apology", {
  id: "cute-apology",
  name: "Cute Apology Website",
  tagline: "The original 6-step interactive apology journey with mini-game, letter, gallery & songs.",
  thumbnailUrl: "./assets/intro.gif",
  category: "Romantic / Apology",
  isActive: true,
  component: CuteApologyApp,
  defaultData: defaultTemplateData,
  supportedFields: [
    { key: "senderName", label: "Sender Name", placeholder: "e.g., Gugu or Rahul", required: true },
    { key: "receiverName", label: "Receiver Name", placeholder: "e.g., Saibun or Priya", required: true }
  ]
});

// 2. Register the Birthday Wish Template (Cutiepage v2)
registry.set("birthday-wish", {
  id: "birthday-wish",
  name: "Birthday Wish 1 New (Cutiepage v2)",
  tagline: "9-step birthday story: phone unlock, party room lights, wrapped stats, wish, candles on cake, gift box, photos & letter.",
  thumbnailUrl: "/birthday-wish-template/assets/stickers/cat-cake-v1.webp",
  category: "Birthday / Celebration",
  isActive: true,
  component: BirthdayWish,
  defaultData: {
    receiverName: "Priya",
    senderName: "Rahul",
    age: "20",
    birthdayDate: "28 September"
  },
  supportedFields: [
    { key: "receiverName", label: "Birthday Person's Name", placeholder: "e.g., Priya or Rahul", required: true },
    { key: "age", label: "Age / Number of Candles (e.g. 20 or 15)", placeholder: "e.g., 20", required: true },
    { key: "birthdayDate", label: "Birthday Date", placeholder: "e.g., 28 September", required: false },
    { key: "senderName", label: "Sender Name (From)", placeholder: "e.g., Someone Special", required: false }
  ]
});

/**
 * Retrieve a registered template by ID.
 * Returns default "cute-apology" template if requested ID is not registered.
 */
export function getTemplate(id) {
  if (!id) return registry.get("cute-apology");
  return registry.get(id) || registry.get("cute-apology");
}

/**
 * Retrieve all registered templates as an array.
 */
export function getAllTemplates() {
  return Array.from(registry.values());
}

/**
 * Register a new template dynamically.
 * @param {Object} templateConfig
 */
export function registerTemplate(templateConfig) {
  if (!templateConfig || !templateConfig.id || !templateConfig.component) {
    throw new Error("Invalid template registration: 'id' and 'component' are required.");
  }
  registry.set(templateConfig.id, {
    ...templateConfig,
    isActive: templateConfig.isActive !== undefined ? templateConfig.isActive : true
  });
}
