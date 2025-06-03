import { create } from "zustand";

interface SecurityStore {
  verifiedPasswordData: {
    password: string;
    timestamp: number;
  } | null;
  setVerifiedPasswordData: (password: string) => void;
  clearVerifiedPasswordData: () => void;
}

// Function to load data from sessionStorage
const loadVerifiedPasswordData = (): SecurityStore["verifiedPasswordData"] => {
  console.log("Attempting to load verifiedPasswordData from sessionStorage...");
  const data = sessionStorage.getItem("verifiedPasswordData");
  if (data) {
    try {
      const parsedData = JSON.parse(data);
      // Basic validation to ensure the cached data has the expected structure
      if (
        parsedData &&
        typeof parsedData.password === "string" &&
        typeof parsedData.timestamp === "number"
      ) {
        // Check if the data has expired (10 minutes)
        const tenMinutesAgo = Date.now() - 600000;
        if (parsedData.timestamp > tenMinutesAgo) {
          console.log(
            "Loaded valid verifiedPasswordData from sessionStorage:",
            parsedData
          );
          return parsedData;
        } else {
          console.log(
            "verifiedPasswordData in sessionStorage expired. Clearing."
          );
          sessionStorage.removeItem("verifiedPasswordData"); // Clear expired data
          return null;
        }
      }
    } catch (e) {
      console.error(
        "Failed to parse verified password data from sessionStorage:",
        e
      );
      sessionStorage.removeItem("verifiedPasswordData"); // Clear invalid data
      return null;
    }
  }
  console.log("No valid verifiedPasswordData found in sessionStorage.");
  return null;
};

// Function to save data to sessionStorage
const saveVerifiedPasswordData = (
  data: SecurityStore["verifiedPasswordData"]
) => {
  if (data) {
    console.log("Saving verifiedPasswordData to sessionStorage:", data);
    sessionStorage.setItem("verifiedPasswordData", JSON.stringify(data));
  } else {
    console.log("Clearing verifiedPasswordData from sessionStorage.");
    sessionStorage.removeItem("verifiedPasswordData");
  }
};

export const useSecurityStore = create<SecurityStore>((set, get) => ({
  verifiedPasswordData: loadVerifiedPasswordData(), // Load initial state from sessionStorage

  setVerifiedPasswordData: (password: string) => {
    const timestamp = Date.now();
    const dataToStore = { password, timestamp };
    set({ verifiedPasswordData: dataToStore });
    saveVerifiedPasswordData(dataToStore); // Save to sessionStorage
    // Set a timer to clear the data after 10 minutes (600,000 milliseconds)
    setTimeout(() => {
      console.log("Timer expired. Clearing verifiedPasswordData.");
      get().clearVerifiedPasswordData();
    }, 600000);
  },

  clearVerifiedPasswordData: () => {
    console.log("clearVerifiedPasswordData called.");
    set({ verifiedPasswordData: null });
    saveVerifiedPasswordData(null); // Clear from sessionStorage
  },
}));
