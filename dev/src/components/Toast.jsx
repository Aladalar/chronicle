import { useEffect, useState } from "react";
import styles from "./Toast.module.css";

const listeners = new Set();
let nextId = 0;

export function toast(msg, type = "ok") {
  const id = ++nextId;
  listeners.forEach((fn) => fn({ type: "add", toast: { id, msg, type } }));
  setTimeout(() => {
    listeners.forEach((fn) => fn({ type: "remove", id }));
  }, type === "error" ? 5000 : 3000);
}
toast.ok    = (msg) => toast(msg, "ok");
toast.error = (msg) => toast(msg, "error");

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const fn = (action) => {
      if (action.type === "add")    setToasts((t) => [...t, action.toast]);
      if (action.type === "remove") setToasts((t) => t.filter((x) => x.id !== action.id));
    };
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);

  return (
    <div className={styles.host}>
      {toasts.map((t) => (
        <div key={t.id} className={styles.toast} data-type={t.type}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
