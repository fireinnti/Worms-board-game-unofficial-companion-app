import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSessionWriter, newSession, parseSession } from "./session";

const KEY = "worms.session.v1";
const writeSession = createSessionWriter(AsyncStorage, KEY);

export function useSession() {
  const [session, setSession] = useState(newSession);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [retry, setRetry] = useState(0);
  const revision = useRef(0);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (active && raw) setSession(parseSession(raw));
      })
      .catch(() => {
        if (active)
          setStorageError(
            "Could not restore your saved game. Check the current team and step before continuing.",
          );
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    // Loading must finish before anything can overwrite the stored session.
    // Do not silently overwrite an unreadable save with defaults on startup.
    if (!ready) return;
    if (revision.current === 0) {
      revision.current = 1;
      return;
    }
    const current = ++revision.current;
    writeSession(session)
      .then(() => {
        if (revision.current === current) setStorageError("");
      })
      .catch(() => {
        if (revision.current === current)
          setStorageError(
            "Your latest changes could not be saved. Keep the app open and retry saving.",
          );
      });
  }, [session, ready, retry]);
  return {
    session,
    setSession,
    ready,
    storageError,
    retrySave: () => setRetry((n) => n + 1),
  };
}
