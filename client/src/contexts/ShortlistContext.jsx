import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { shortlistAPI } from "../utils/api";
import { getSessionId } from "../utils/formatters";

const ShortlistContext = createContext();

export function ShortlistProvider({ children }) {
  const [shortlist, setShortlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const sessionId = getSessionId();

  const fetchShortlist = useCallback(async () => {
    try {
      const res = await shortlistAPI.get(sessionId);
      setShortlist(res.data);
    } catch (err) {
      console.error("Failed to fetch shortlist:", err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchShortlist();
  }, [fetchShortlist]);

  const addToShortlist = async (carId) => {
    try {
      const res = await shortlistAPI.add(sessionId, carId);
      setShortlist((prev) => [...prev, res.data]);
      return true;
    } catch (err) {
      if (err.response?.status === 409) {
        return false; // already in shortlist
      }
      console.error("Failed to add to shortlist:", err);
      return false;
    }
  };

  const removeFromShortlist = async (carId) => {
    try {
      await shortlistAPI.remove(sessionId, carId);
      setShortlist((prev) => prev.filter((s) => s.carId?._id !== carId));
      return true;
    } catch (err) {
      console.error("Failed to remove from shortlist:", err);
      return false;
    }
  };

  const isInShortlist = (carId) => {
    return shortlist.some((s) => s.carId?._id === carId);
  };

  const clearShortlist = async () => {
    try {
      await shortlistAPI.clear(sessionId);
      setShortlist([]);
    } catch (err) {
      console.error("Failed to clear shortlist:", err);
    }
  };

  return (
    <ShortlistContext.Provider
      value={{
        shortlist,
        loading,
        addToShortlist,
        removeFromShortlist,
        isInShortlist,
        clearShortlist,
        refreshShortlist: fetchShortlist,
        shortlistCount: shortlist.length,
      }}
    >
      {children}
    </ShortlistContext.Provider>
  );
}

export function useShortlist() {
  const context = useContext(ShortlistContext);
  if (!context) {
    throw new Error("useShortlist must be used within a ShortlistProvider");
  }
  return context;
}
