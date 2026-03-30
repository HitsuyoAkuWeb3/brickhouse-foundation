import { useState } from "react";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LandingFooter from "@/components/LandingFooter";
import logo from "@/assets/brickhouse-logo.png";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";

const LIFE_STAGES = [
  "Career transition / job change",
  "Divorce or relationship ending",
  "Building a business",
  "Personal reinvention",
  "Healing from trauma or loss",
  "Feeling stuck and ready for more",
  "Thriving and want to level up",
  "Other",
];

const OUT_OF_ALIGNMENT = [
  "Mindset & self-worth",
  "Relationships & love",
  "Career & finances",
  "Health & body image",
  "Purpose & direction",
  "Daily habits & routine",
  "Energy & spiritual connection",
  "Family & parenting",
];

const SPECIFIC_RESULTS = [
  "Unshakeable self-confidence",
  "A loving, healthy relationship",
  "Increased income or wealth",
  "Launch or grow a business",
  "Find my purpose and direction",
  "Break free from toxic patterns",
  "Design a daily life I actually love",
  "Improve my health and body",
  "A personalized life operating system",
  "Inner peace and less stress",
];

const formSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  location: z.string().optional(),
  life_stage: z.array(z.string()).default([]),
  
  obstacle: z.string().optional(),
  out_of_alignment: z.array(z.string()).default([]),
  urgency: z.array(z.number()).default([5]),
  
  ideal_life: z.string().optional(),
  specific_results: z.array(z.string()).default([]),
  prior_coaching: z.string().optional(),
  
  interested_experience: z.string().optional(),
  investment_comfort: z.string().optional(),
  readiness: z.string().optional(),
  
  discovery_source: z.string().optional(),
  additional_info: z.string().optional(),
  connect_preference: z.string().optional(),
});

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const CoachingIntake = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      location: "",
      life_stage: [],
      obstacle: "",
      out_of_alignment: [],
      urgency: [5],
      ideal_life: "",
      specific_results: [],
      prior_coaching: "",
      interested_experience: "",
      investment_comfort: "",
      readiness: "",
      discovery_source: "",
      additional_info: "",
      connect_preference: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any).from('coaching_intakes').insert({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        location: values.location,
        life_stage: values.life_stage,
        obstacle: values.obstacle,
        out_of_alignment: values.out_of_alignment,
        urgency: values.urgency[0],
        ideal_life: values.ideal_life,
        specific_results: values.specific_results,
        prior_coaching: values.prior_coaching,
        interested_experience: values.interested_experience,
        investment_comfort: values.investment_comfort,
        readiness: values.readiness,
        discovery_source: values.discovery_source,
        additional_info: values.additional_info,
        connect_preference: values.connect_preference,
      });

      if (error) throw error;
      
      toast.success("Intake submitted successfully. Redirecting to schedule...");
      
      // Delay to let toast show, then redirect to Calendly route
      setTimeout(() => {
        window.location.href = "http://calendly.com/che-brickhousemindset";
      }, 1500);
      
    } catch (error) {
      console.error("Error submitting intake:", error);
      toast.error("There was an error saving your form. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pt-24 pb-12">
      {/* Pink radial glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[100%] h-[80%] pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, hsl(330 100% 42% / 0.12) 0%, transparent 80%)",
        }}
      />
      
      <div className="relative z-10 max-w-3xl mx-auto px-6">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={logo}
            alt="Brickhouse Mindset"
            className="w-[180px] sm:w-[220px] mx-auto mb-8 drop-shadow-[0_0_30px_hsl(330_100%_42%/0.3)]"
          />
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.1] mb-4">
            Pre-Discovery <span className="text-gradient-pink">Intake Form</span>
          </h1>
          <p className="font-body text-lg text-muted-foreground/80 max-w-xl mx-auto">
            Thank you for reaching out. Before we connect, I'd love to get to know you better so I can show up fully prepared for our conversation.
          </p>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 pb-24">
            
            {/* SECTION 1: ABOUT YOU */}
            <motion.section 
              className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 sm:p-10 shadow-lg"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <div className="flex items-center gap-2 text-xs tracking-widest text-accent uppercase mb-8">
                <span className="h-px bg-accent/30 w-8" />
                Section 1: About You
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jane@example.com" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Location (City, State/Country)</FormLabel>
                      <FormControl>
                        <Input placeholder="Atlanta, GA" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="life_stage"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-foreground/80 text-base">Current Life Stage</FormLabel>
                      <FormDescription>Check all that apply</FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {LIFE_STAGES.map((item) => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="life_stage"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border/40 bg-background/30 p-4"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm pt-0.5 cursor-pointer flex-1">
                                  {item}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.section>

            {/* SECTION 2: WHERE YOU ARE RIGHT NOW */}
            <motion.section 
              className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 sm:p-10 shadow-lg"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <div className="flex items-center gap-2 text-xs tracking-widest text-accent uppercase mb-8">
                <span className="h-px bg-accent/30 w-8" />
                Section 2: Where You Are Right Now
              </div>

              <FormField
                control={form.control}
                name="obstacle"
                render={({ field }) => (
                  <FormItem className="mb-10">
                    <FormLabel className="text-foreground/80 text-base">What's the #1 thing keeping you from the life you want?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="I feel stuck because..." 
                        className="resize-none min-h-[100px] bg-background/50" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="out_of_alignment"
                render={() => (
                  <FormItem className="mb-10">
                    <div className="mb-4">
                      <FormLabel className="text-foreground/80 text-base">Which areas of your life feel most out of alignment?</FormLabel>
                      <FormDescription>Check all that apply</FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {OUT_OF_ALIGNMENT.map((item) => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="out_of_alignment"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border/40 bg-background/30 p-4"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm pt-0.5 cursor-pointer flex-1">
                                  {item}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-6">
                      <FormLabel className="text-foreground/80 text-base">On a scale of 1-10, how urgent is it that you make a change?</FormLabel>
                      <FormDescription>1 = Not urgent, 10 = I needed this yesterday</FormDescription>
                    </div>
                    <FormControl>
                      <div className="px-2">
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          defaultValue={[5]}
                          onValueChange={field.onChange}
                          className="py-4"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2 font-mono">
                          {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <span key={n} className={field.value[0] === n ? "text-primary font-bold scale-125 transition-all" : "transition-all"}>{n}</span>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.section>

            {/* SECTION 3: WHERE YOU WANT TO GO */}
            <motion.section 
              className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 sm:p-10 shadow-lg"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <div className="flex items-center gap-2 text-xs tracking-widest text-accent uppercase mb-8">
                <span className="h-px bg-accent/30 w-8" />
                Section 3: Where You Want To Go
              </div>

              <FormField
                control={form.control}
                name="ideal_life"
                render={({ field }) => (
                  <FormItem className="mb-10">
                    <FormLabel className="text-foreground/80 text-base">What does your ideal life look like 12 months from now?</FormLabel>
                    <FormDescription>How do you feel? What are you doing? Who's in your life?</FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="In 12 months, I am..." 
                        className="resize-none min-h-[100px] bg-background/50 mt-2" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specific_results"
                render={() => (
                  <FormItem className="mb-10">
                    <div className="mb-4">
                      <FormLabel className="text-foreground/80 text-base">What specific results are you hoping to achieve?</FormLabel>
                      <FormDescription>Check all that apply</FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {SPECIFIC_RESULTS.map((item) => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="specific_results"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border/40 bg-background/30 p-4"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm pt-0.5 cursor-pointer flex-1">
                                  {item}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prior_coaching"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-foreground/80 text-base">Have you worked with a coach or therapist before?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2 mt-2"
                      >
                        {[
                          "Yes — it was transformative",
                          "Yes — but it didn't fully work",
                          "No — this would be my first time"
                        ].map((option) => (
                          <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={option} className="text-primary border-primary/50" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer text-sm">
                              {option}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.section>

            {/* SECTION 4: YOUR INVESTMENT READINESS */}
            <motion.section 
              className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 sm:p-10 shadow-lg"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <div className="flex items-center gap-2 text-xs tracking-widest text-accent uppercase mb-8">
                <span className="h-px bg-accent/30 w-8" />
                Section 4: Your Investment Readiness
              </div>

              <FormField
                control={form.control}
                name="interested_experience"
                render={({ field }) => (
                  <FormItem className="space-y-4 mb-10">
                    <FormLabel className="text-foreground/80 text-base">Which Brickhouse experience interests you most?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-3"
                      >
                        {[
                          "🏛️ Brickhouse Collective/ APP — Monthly membership ($55–$123/mo)",
                          "🔑 Brickhouse Blueprint — Deep dive reset ($2,500)",
                          "👑 Goddess Coaching — 3-6-month private 1:1 coaching ($9,000–$15,000)",
                          "🤔 Not sure yet — help me decide what's right for me",
                          "🏢 Corporate / Organizational Wellness — for my team or company"
                        ].map((option) => (
                          <FormItem key={option} className="flex items-center space-x-3 space-y-0 rounded-md border border-border/40 bg-background/30 p-4">
                            <FormControl>
                              <RadioGroupItem value={option} className="text-primary border-primary/50" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer text-sm flex-1">
                              {option}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="investment_comfort"
                render={({ field }) => (
                  <FormItem className="space-y-4 mb-10">
                    <FormLabel className="text-foreground/80 text-base">Investment comfort zone</FormLabel>
                    <FormDescription>No judgment — this helps me match you to the right program</FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                      >
                        {[
                          "Under $500",
                          "$500–$2,500",
                          "$2,500–$7,500",
                          "$7,500–$15,000",
                          "$15,000+",
                          "Corporate / organizational budget"
                        ].map((option) => (
                          <FormItem key={option} className="flex items-center space-x-3 space-y-0 rounded-md border border-border/40 bg-background/30 p-4">
                            <FormControl>
                              <RadioGroupItem value={option} className="text-primary border-primary/50" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer text-sm">
                              {option}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="readiness"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-foreground/80 text-base">How soon are you ready to start?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2 mt-2"
                      >
                        {[
                          "Immediately — I'm ready right now",
                          "Within 30 days",
                          "Within 60–90 days",
                          "Just exploring for now"
                        ].map((option) => (
                          <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={option} className="text-primary border-primary/50" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer text-sm">
                              {option}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.section>

            {/* SECTION 5: ONE LAST THING */}
            <motion.section 
              className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 sm:p-10 shadow-lg"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <div className="flex items-center gap-2 text-xs tracking-widest text-accent uppercase mb-8">
                <span className="h-px bg-accent/30 w-8" />
                Section 5: One Last Thing
              </div>

              <FormField
                control={form.control}
                name="discovery_source"
                render={({ field }) => (
                  <FormItem className="space-y-3 mb-10">
                    <FormLabel className="text-foreground/80 text-base">How did you find Brickhouse Mindset?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2"
                      >
                        {[
                          "Instagram Ad",
                          "Instagram (organic)",
                          "Referral",
                          "Google",
                          "YouTube",
                          "The book",
                          "Other"
                        ].map((option) => (
                          <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={option} className="text-primary border-primary/50" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer text-sm text-muted-foreground whitespace-nowrap">
                              {option}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additional_info"
                render={({ field }) => (
                  <FormItem className="mb-10">
                    <FormLabel className="text-foreground/80 text-base">Anything else you'd like me to know before our conversation?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional thoughts..." 
                        className="resize-none min-h-[100px] bg-background/50 mt-2" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="connect_preference"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-foreground/80 text-base">How would you prefer to connect for your discovery call?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-6 space-y-0 mt-2"
                      >
                        {[
                          "Phone call",
                          "Video call (Zoom)"
                        ].map((option) => (
                          <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={option} className="text-primary border-primary/50" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer text-sm">
                              {option}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.section>

            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm text-muted-foreground mb-8">
                Once I receive your form, you will be redirected to schedule your complimentary discovery call time.
                <br />
                <span className="italic">Loving yourself is not an option — it's THE solution.</span>
              </p>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center bg-gradient-pink text-foreground font-body font-extrabold text-[13px] tracking-[2px] uppercase px-14 py-5 cursor-pointer [clip-path:polygon(8px_0%,100%_0%,calc(100%-8px)_100%,0%_100%)] hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit & Schedule"
                )}
              </button>
            </motion.div>
          </form>
        </Form>
      </div>

      <LandingFooter />
    </div>
  );
};

export default CoachingIntake;
