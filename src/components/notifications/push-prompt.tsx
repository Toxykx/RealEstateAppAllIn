"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { saveOwnPushSubscription } from "@/lib/actions/push";

const STORAGE_KEY = "push-prompt-seen";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/**
 * One-time "enable notifications?" prompt shown after a user's first login
 * on a given device (tracked in localStorage — a new device/reinstall asks
 * again, which is correct since each device needs its own permission grant).
 * Rendered inside both authenticated shells so every role sees it once.
 */
export function PushPrompt() {
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "default") return;
    setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  async function enable() {
    setPending(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("ההרשאה לא אושרה. ניתן להפעיל מאוחר יותר דרך הגדרות הדפדפן.");
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        toast.error("שגיאה בהגדרת ההתראות. נסו שוב מאוחר יותר.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await saveOwnPushSubscription(subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
      toast.success("התראות הופעלו בהצלחה!");
    } catch (error) {
      toast.error(error instanceof Error ? `שגיאה בהפעלת ההתראות: ${error.message}` : "שגיאה בהפעלת ההתראות.");
    } finally {
      setPending(false);
      dismiss();
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-20 z-30 mx-auto flex max-w-md items-center gap-3 rounded-md border border-primary/30 bg-card p-3 shadow-lg sm:bottom-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
        <Bell className="h-4 w-4" />
      </span>
      <div className="flex-1 text-sm">
        <p className="font-medium text-foreground">להפעיל התראות?</p>
        <p className="text-xs text-muted-foreground">קבלו עדכונים על נכסים, מפתחות ופעילות ישירות לטלפון.</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button size="sm" onClick={enable} disabled={pending}>
          {pending ? "מפעיל..." : "הפעלה"}
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="סגירה" onClick={dismiss} disabled={pending}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
