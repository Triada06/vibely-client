import { create } from "zustand";

interface SecurityStore {
  verifiedPasswordData: {
    password: string;
    timestamp: number;
  } | null;
  setVerifiedPasswordData: (password: string) => void;
  clearVerifiedPasswordData: () => void;
}

//Function to load data from sessionStorage
const loadVerifiedPasswordData = (): SecurityStore["verifiedPasswordData"] => {
  const data = sessionStorage.getItem("verifiedPasswordData");
  if (data) {
    try {
      const parsedData = JSON.parse(data);
      if (
        parsedData &&
        typeof parsedData.password === "string" &&
        typeof parsedData.timestamp === "number"
      ) {
        const tenMinutesAgo = Date.now() - 600000;
        if (parsedData.timestamp > tenMinutesAgo) {
          return parsedData;
        } else {
          sessionStorage.removeItem("verifiedPasswordData");
          return null;
        }
      }
    } catch  {
      sessionStorage.removeItem("verifiedPasswordData");
      return null;
    }
  }
  return null;
};

const saveVerifiedPasswordData = (
  data: SecurityStore["verifiedPasswordData"]
) => {
  if (data) {
    sessionStorage.setItem("verifiedPasswordData", JSON.stringify(data));
  } else {
    sessionStorage.removeItem("verifiedPasswordData");
  }
};

export const useSecurityStore = create<SecurityStore>((set, get) => ({
  verifiedPasswordData: loadVerifiedPasswordData(),

  setVerifiedPasswordData: (password: string) => {
    const timestamp = Date.now();
    const dataToStore = { password, timestamp };
    set({ verifiedPasswordData: dataToStore });
    saveVerifiedPasswordData(dataToStore);
    setTimeout(() => {
      get().clearVerifiedPasswordData();
    }, 600000);
  },

  clearVerifiedPasswordData: () => {
    set({ verifiedPasswordData: null });
    saveVerifiedPasswordData(null);
  },
}));
