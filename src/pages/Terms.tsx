import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/BHhres-white.png";

const Terms = () => (
  <div className="min-h-screen bg-background px-6 py-12">
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <img src={logo} alt="Brickhouse Mindset" className="w-32 mb-8 opacity-80" />

      <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2">Terms of Service</h1>
      <p className="font-body text-sm text-muted-foreground mb-8">Last updated: March 9, 2026</p>

      <div className="font-body text-sm text-foreground/80 space-y-6 leading-relaxed">
        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using Brickhouse Mindset ("the Platform"), operated by Che' Lovelight ("we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">2. Description of Service</h2>
          <p>Brickhouse Mindset is a personal development and lifestyle coaching platform offering digital courses, interactive assessments, daily ritual tools, affirmation systems, and community access. Content is for educational and informational purposes only and does not constitute professional therapy, medical, financial, or legal advice.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">3. Account Registration</h2>
          <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. You must be at least 18 years old to create an account.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">4. Payments & Subscriptions</h2>
          <p>Certain features require payment. Prices are displayed at checkout. Subscriptions auto-renew until cancelled. You may cancel at any time; access continues through the end of the billing period. Refunds are handled on a case-by-case basis within 7 days of purchase.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">5. Intellectual Property</h2>
          <p>All content — including text, graphics, logos, audio, video, and software — is owned by Che' Lovelight and protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without written permission.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">6. User Content</h2>
          <p>You retain ownership of content you submit (affirmations, journal entries, goals). By submitting content, you grant us a non-exclusive, royalty-free license to use anonymized and aggregated data for improving the Platform. We will never share your personal content publicly without your explicit consent.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">7. Prohibited Conduct</h2>
          <p>You agree not to: (a) use the Platform for unlawful purposes; (b) attempt to gain unauthorized access; (c) harass, threaten, or harm other users; (d) reverse engineer or scrape Platform content; (e) share account credentials with others.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">8. Limitation of Liability</h2>
          <p>The Platform is provided "as is." We are not liable for any indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability shall not exceed the amount you paid in the 12 months preceding the claim.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">9. Termination</h2>
          <p>We reserve the right to suspend or terminate your account for violations of these Terms. You may delete your account at any time through your account settings.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">10. Changes to Terms</h2>
          <p>We may update these Terms at any time. Continued use after changes constitutes acceptance. Material changes will be communicated via email or in-app notification.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">11. Governing Law</h2>
          <p>These Terms are governed by the laws of the United States. Any disputes will be resolved through binding arbitration.</p>
        </section>

        <section>
          <h2 className="font-display text-lg tracking-wider mb-2">12. Contact</h2>
          <p>Questions about these Terms? Email us at <a href="mailto:hello@brickhousemindset.com" className="text-accent hover:underline">hello@brickhousemindset.com</a>.</p>
        </section>
      </div>
    </div>
  </div>
);

export default Terms;
