import CuteApologyApp, { defaultTemplateData } from "../CuteApology.jsx";

/**
 * Reusable Apology Template Registry
 * Central repository of all available apology templates.
 * To register a new template in the future, simply invoke `registerTemplate({...})`
 * or add an entry to the initial registry map below.
 */

const registry = new Map();

// Register the original Cute Apology Template
registry.set("cute-apology", {
  id: "cute-apology",
  name: "Cute Apology Website",
  tagline: "The original 6-step interactive apology journey with mini-game, letter, gallery & songs.",
  thumbnailUrl: "./assets/intro.gif",
  category: "Romantic / Whimsical",
  isActive: true,
  component: CuteApologyApp,
  defaultData: defaultTemplateData,
  supportedFields: [
    { key: "senderName", label: "Sender Name", placeholder: "e.g., Gugu or Rahul", required: true },
    { key: "receiverName", label: "Receiver Name", placeholder: "e.g., Saibun or Priya", required: true }
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
