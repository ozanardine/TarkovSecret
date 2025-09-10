import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function useCheckout() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const createCheckoutSession = async (priceId: string) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Erro ao criar sessão de pagamento');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const createPortalSession = async () => {
    if (!session) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Erro ao acessar portal de assinatura');
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckoutSession,
    createPortalSession,
    isLoading,
  };
}
