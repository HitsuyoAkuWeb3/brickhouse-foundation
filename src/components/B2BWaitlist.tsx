import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAnalytics } from '@/hooks/useAnalytics';

export const B2BWaitlist = () => {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { trackEvent } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !company) {
      toast.error('Email and Company Name are required.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from('b2b_waitlist').insert({
        email,
        company_name: company,
        role,
      });

      if (error) {
        if (error.code === '23505') {
          toast.info('You are already on the waitlist!');
          setIsSubmitted(true);
          return;
        }
        throw error;
      }

      toast.success('Successfully added to the Corporate Waitlist!');
      trackEvent('b2b_waitlist_signup', { company, role });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Waitlist error:', error);
      toast.error('Failed to join waitlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-sov-white/5 border border-sov-white/10 rounded-lg p-8 text-center space-y-4">
        <h3 className="text-2xl font-brutalist font-bold text-sov-white">Priority Access Reserved</h3>
        <p className="text-sov-gray/80">
          Your organization is on the priority list. Our partnerships team will be in touch with {company} soon.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1A0010]/90 border border-[#D4006A]/30 rounded-lg p-6 sm:p-8">
      <div className="space-y-2 mb-6 text-center sm:text-left">
        <h3 className="text-2xl font-brutalist font-bold text-sov-white uppercase tracking-wider">
          Enterprise & Corporate
        </h3>
        <p className="text-sov-gray/80 text-sm">
          Bring the 12 Bricks framework to your organization. Join the waitlist for priority access to our B2B team licensing, executive retreats, and bulk insights dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company" className="text-sov-white">Company / Organization *</Label>
          <Input 
            id="company" 
            placeholder="e.g. Acme Corp" 
            className="bg-sov-deep/50 border-sov-white/20 text-sov-white placeholder:text-sov-gray/50"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sov-white">Work Email *</Label>
            <Input 
              id="email" 
              type="email"
              placeholder="you@company.com" 
              className="bg-sov-deep/50 border-sov-white/20 text-sov-white placeholder:text-sov-gray/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sov-white">Your Role</Label>
            <Input 
              id="role" 
              placeholder="e.g. HR Director, CEO" 
              className="bg-sov-deep/50 border-sov-white/20 text-sov-white placeholder:text-sov-gray/50"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[#D4006A] hover:bg-[#D4006A]/80 text-white font-bold tracking-widest uppercase mt-4"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Secure Waitlist Position'}
        </Button>
      </form>
    </div>
  );
};
