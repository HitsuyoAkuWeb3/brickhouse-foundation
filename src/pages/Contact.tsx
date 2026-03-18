import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Instagram, Send } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/brickhouse-logo.png";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSending(true);

    // mailto fallback — replace with edge function when ready
    const subject = encodeURIComponent(`Brickhouse Contact: ${name.trim()}`);
    const body = encodeURIComponent(`From: ${name.trim()} (${email.trim()})\n\n${message.trim()}`);
    window.location.href = `mailto:hello@brickhousemindset.com?subject=${subject}&body=${body}`;

    setTimeout(() => {
      setSending(false);
      toast.success("Opening your email client...");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-lg mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>

        <img src={logo} alt="Brickhouse Mindset" className="w-32 mb-8 opacity-80" />

        <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2">Get in Touch</h1>
        <p className="font-body text-sm text-muted-foreground mb-8">
          Questions, partnerships, or just want to say hi — we'd love to hear from you.
        </p>

        {/* Direct links */}
        <div className="flex gap-4 mb-10">
          <a
            href="mailto:hello@brickhousemindset.com"
            className="flex items-center gap-3 bg-gradient-card border border-border rounded-xl px-5 py-4 flex-1 hover:border-primary/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-display text-xs tracking-wider">Email</div>
              <div className="font-body text-[10px] text-muted-foreground">hello@brickhousemindset.com</div>
            </div>
          </a>
          <a
            href="https://instagram.com/BrickhouseMindset"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-gradient-card border border-border rounded-xl px-5 py-4 flex-1 hover:border-accent/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <Instagram className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="font-display text-xs tracking-wider">Instagram</div>
              <div className="font-body text-[10px] text-muted-foreground">@BrickhouseMindset</div>
            </div>
          </a>
        </div>

        {/* Contact form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-display text-xs tracking-wider block mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="font-display text-xs tracking-wider block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="font-display text-xs tracking-wider block mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              rows={5}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder="How can we help?"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase py-3.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {sending ? "..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
