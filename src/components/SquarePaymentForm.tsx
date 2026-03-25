import { useState } from 'react';
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface SquarePaymentFormProps {
  amount: number;
  tier: string;
  label?: string;
  onSuccess?: () => void;
}

// Ensure the production appId and locationId are set.
const appId = "sq0idp-b6XVLQTSsxBCW37KbEaNnw";
const locationId = "L529B2WDZ3BJ9"; // Production Location ID

export const SquarePaymentForm = ({ amount, tier, label = "Pay Now", onSuccess }: SquarePaymentFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleCardNonceResponseReceived = async (
    tokenResult: { status?: string, errors?: { message: string }[], token?: string },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    verifiedBuyer?: any
  ) => {
    if (tokenResult.status === 'ERROR' || tokenResult.errors) {
      console.error(tokenResult.errors);
      toast.error('Failed to process card details.');
      return;
    }

    const nonce = tokenResult.token;
    setIsProcessing(true);
    const toastId = toast.loading('Processing your payment...');

    try {
      const { data, error } = await supabase.functions.invoke('process-square-payment', {
        body: {
          source_id: nonce,
          amount: amount,
          tier: tier
        },
      });

      if (error || data?.error) {
        throw new Error(error?.message || data?.error || 'Payment failed on server');
      }

      toast.success('Payment successful!', { id: toastId });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      console.error('Payment processing error:', err);
      toast.error(err instanceof Error ? err.message : 'Payment processing error', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="mb-6 text-center">
        <h3 className="font-display text-2xl mb-1">{label}</h3>
        <p className="font-body text-muted-foreground">Total: ${amount.toFixed(2)}</p>
      </div>

      <div className="relative z-10 w-full min-h-[160px]">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="font-body text-sm text-muted-foreground animate-pulse">Securing transaction...</p>
          </div>
        ) : (
          <PaymentForm
            applicationId={appId}
            locationId={locationId}
            cardTokenizeResponseReceived={handleCardNonceResponseReceived}
            createPaymentRequest={() => ({
              countryCode: 'US',
              currencyCode: 'USD',
              total: {
                amount: amount.toString(),
                label: label,
              },
            })}
          >
            <CreditCard 
              buttonProps={{
                css: {
                  backgroundColor: 'white',
                  color: 'black',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  '&:hover': {
                    backgroundColor: '#f1f1f1',
                  },
                },
              }}
            />
          </PaymentForm>
        )}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest flex items-center justify-center gap-2">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Secured by Square
        </p>
      </div>
    </div>
  );
};
