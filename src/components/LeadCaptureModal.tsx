import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { analytics } from "@/lib/analytics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("")),
});

type LeadData = z.infer<typeof leadSchema>;

interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: "audit" | "breakthrough";
}

const copy = {
  audit: {
    title: "Start Your Life Audit",
    description:
      "Enter your info to get your personalized results — it only takes 2 minutes.",
    cta: "Begin My Audit →",
  },
  breakthrough: {
    title: "Register for Brickhouse Breakthrough",
    description:
      "3 days. 44 minutes a day. Enter your info to save your spot.",
    cta: "Save My Spot →",
  },
};

const LeadCaptureModal = ({
  open,
  onOpenChange,
  variant,
}: LeadCaptureModalProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LeadData>({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LeadData, string>>>(
    {}
  );
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { title, description, cta } = copy[variant];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = leadSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LeadData, string>> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof LeadData;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const { error } = await supabase.from("leads").insert({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone || null,
      variant,
    });

    setSubmitting(false);

    if (error) {
      setErrors({ email: "Something went wrong. Please try again." });
      return;
    }

    setSubmitted(true);
    analytics.leadCaptured(variant);

    if (variant === "audit") {
      setTimeout(() => {
        onOpenChange(false);
        navigate("/life-audit");
      }, 1500);
    } else if (variant === "breakthrough") {
      setTimeout(() => {
        onOpenChange(false);
        navigate("/breakthrough-confirmation");
      }, 1500);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setSubmitted(false);
      setFormData({ name: "", email: "", phone: "" });
      setErrors({});
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        {submitted ? (
          <div className="text-center py-6">
            <p className="font-display text-3xl mb-2">You're In 🔥</p>
            <p className="font-body text-muted-foreground">
              Check your email for next steps.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl tracking-wide">
                {title}
              </DialogTitle>
              <DialogDescription className="font-body text-muted-foreground">
                {description}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <Label htmlFor="name" className="font-body text-sm">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, name: e.target.value }))
                  }
                  className="bg-input border-border mt-1"
                />
                {errors.name && (
                  <p className="text-destructive text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="font-body text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, email: e.target.value }))
                  }
                  className="bg-input border-border mt-1"
                />
                {errors.email && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="font-body text-sm">
                  Phone{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, phone: e.target.value }))
                  }
                  className="bg-input border-border mt-1"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-6 rounded-xl bg-gradient-pink font-body font-semibold tracking-wide text-foreground hover:scale-[1.02] transition-transform disabled:opacity-60"
              >
                {submitting ? "Submitting…" : cta}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureModal;
