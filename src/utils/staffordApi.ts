// BlockPlanner's own API (Stafford). Block lookups come from here; checkout
// still goes through VITE_API_URL until it moves over too.
export const STAFFORD_API_URL = (
  import.meta.env.VITE_STAFFORD_API_URL || "https://api.blockplanner.com.au"
).replace(/\/$/, "");
