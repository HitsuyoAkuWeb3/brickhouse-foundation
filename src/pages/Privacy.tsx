import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/BHhres-white.png";

const Privacy = () => (
  <div className="min-h-screen bg-background px-6 py-12">
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <img src={logo} alt="Brickhouse Mindset" className="w-32 mb-8 opacity-80" />

      <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2">Privacy Policy</h1>
      <p className="font-body text-sm text-muted-foreground mb-8">Last updated: March 9, 2026</p>

      <div className="font-body text-sm text-foreground/80 space-y-6 leading-relaxed">
        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">1. Information We Collect</h2>
          <p><strong>Account Data:</strong> Name, email address, birth date (optional), and authentication credentials.</p>
          <p className="mt-2"><strong>Usage Data:</strong> Lesson progress, daily ritual completions, affirmations, goals, and audit scores.</p>
          <p className="mt-2"><strong>Technical Data:</strong> Browser type, device information, IP address, and cookies for session management.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">2. How We Use Your Information</h2>
          <p>We use your data to: (a) provide and personalize the Platform experience; (b) track your progress across lessons and rituals; (c) send transactional emails (verification, password reset); (d) improve the Platform through anonymized analytics; (e) process payments when applicable.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">3. Data Sharing</h2>
          <p>We do <strong>not</strong> sell, rent, or trade your personal information. We share data only with: (a) service providers who help operate the Platform (hosting, payments, email); (b) law enforcement when legally required.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">4. Data Storage & Security</h2>
          <p>Your data is stored securely using industry-standard encryption. We use Row Level Security to ensure users can only access their own data. While no system is 100% secure, we implement best practices to protect your information.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">5. Cookies</h2>
          <p>We use essential cookies for authentication and session management. We do not use third-party advertising cookies. You can disable cookies in your browser settings, but this may affect Platform functionality.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">6. Your Rights</h2>
          <p>You have the right to: (a) access your personal data; (b) correct inaccurate data; (c) request deletion of your account and data; (d) export your data; (e) withdraw consent for optional data collection. To exercise these rights, contact us at the email below.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">7. Children's Privacy</h2>
          <p>The Platform is not intended for users under 18. We do not knowingly collect data from minors. If we learn a child has provided personal information, we will delete it immediately.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">8. Third-Party Links</h2>
          <p>The Platform may contain links to external websites. We are not responsible for the privacy practices of third-party sites.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy periodically. We will notify you of material changes via email or in-app notification. Continued use after changes constitutes acceptance.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">10. Contact</h2>
          <p>For privacy questions or data requests, email <a href="mailto:hello@brickhousemindset.com" className="text-accent hover:underline">hello@brickhousemindset.com</a>.</p>
        </section>
      </div>
    </div>
  </div>
);

export default Privacy;
