import { motion, AnimatePresence } from "framer-motion";
import { X, Paperclip, Sparkles, Send, Image as ImageIcon, Smile } from "lucide-react";
import { useEffect } from "react";

export function Compose({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 24, scale: 0.97, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="glass-strong fixed bottom-6 right-6 z-50 w-[min(640px,calc(100vw-2rem))] overflow-hidden rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">New message</div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-0 px-4">
              <Field label="To" placeholder="recipients@…" />
              <Field label="Subject" placeholder="Subject" />
            </div>
            <div className="px-4 pb-2">
              <textarea
                rows={8}
                placeholder="Write your message…"
                className="glow-ring w-full resize-none rounded-lg border border-transparent bg-transparent px-1 py-2 text-sm placeholder:text-muted-foreground focus:border-white/10"
              />
              <motion.div
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-muted-foreground"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI suggests: "Confirming Friday's review at 10am — let me know if that still works for you."</span>
                <button className="ml-auto rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] text-foreground/90 transition hover:bg-white/[0.1]">Tab to insert</button>
              </motion.div>
            </div>
            <div className="flex items-center gap-1 border-t border-white/5 px-3 py-2.5">
              {[Paperclip, ImageIcon, Smile].map((Icon, i) => (
                <motion.button key={i} whileTap={{ scale: 0.9 }} className="rounded-lg p-2 text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground">
                  <Icon className="h-4 w-4" />
                </motion.button>
              ))}
              <motion.button
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                className="ml-auto inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-white/[0.14]"
                style={{ boxShadow: "0 8px 30px -10px rgba(0,0,0,0.6)" }}
              >
                <Send className="h-3.5 w-3.5" /> Send
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/5 py-2">
      <span className="w-16 shrink-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input placeholder={placeholder} className="glow-ring w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none" />
    </div>
  );
}
