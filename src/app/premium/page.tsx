'use client';

import { useEffect, useState } from 'react';
import { Crown, Check, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface PremiumPlan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  features: string[];
}

interface PremiumStatus {
  isPremium: boolean;
  premiumExpiry: string | null;
  remainingDays: number;
}

export default function PremiumPage() {
  const [plans, setPlans] = useState<Record<string, PremiumPlan> | null>(null);
  const [userStatus, setUserStatus] = useState<PremiumStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetchPremiumPlans();
  }, []);

  const fetchPremiumPlans = async () => {
    try {
      const response = await fetch('/api/premium');
      const data = await response.json();
      setPlans(data.plans);
      setUserStatus(data.userPremiumStatus);
    } catch (error) {
      console.error('Failed to fetch premium plans:', error);
      toast.error('Gagal memuat paket premium');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId: string) => {
    setPurchasing(planId);
    try {
      const response = await fetch('/api/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      toast.success(data.message || 'Premium berhasil diaktifkan!');
      fetchPremiumPlans();
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Gagal membeli premium');
    } finally {
      setPurchasing(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Apakah Anda yakin ingin membatalkan premium Anda?')) return;

    try {
      const response = await fetch('/api/premium', {
        method: 'DELETE'
      });

      const data = await response.json();
      toast.success(data.message || 'Premium berhasil dibatalkan');
      fetchPremiumPlans();
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Gagal membatalkan premium');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto mb-8" />
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-[500px]">
                  <CardHeader>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-6 w-24" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <Skeleton key={j} className="h-5 w-full" />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPopular = (planId: string) => planId === 'yearly';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="w-12 h-12 text-yellow-500" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                Premium Membership
              </h1>
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              Buka fitur eksklusif dan nikmati pengalaman terbaik di MemeVerse
            </p>

            {/* Premium Status */}
            {userStatus && userStatus.isPremium && (
              <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-purple-500" />
                      <div className="text-left">
                        <p className="font-semibold text-purple-900 dark:text-purple-100">
                          Premium Aktif! 🎉
                        </p>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Sisa {userStatus.remainingDays} hari
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="border-red-500 text-red-500 hover:bg-red-500/10"
                    >
                      Batalkan Premium
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {plans && Object.entries(plans).map(([planId, plan]) => (
              <Card
                key={planId}
                className={`relative transition-all duration-300 hover:shadow-2xl ${
                  isPopular(planId)
                    ? 'scale-105 border-2 border-purple-500 shadow-purple-500/20'
                    : 'border-border'
                }`}
              >
                {isPopular(planId) && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 shadow-lg">
                      <Zap className="w-3 h-3 mr-1" />
                      Paling Populer
                    </Badge>
                  </div>
                )}

                <CardHeader className={isPopular(planId) ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10' : ''}>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.durationMonths === 999 ? 'Selamanya' : `${plan.durationMonths} Bulan`}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price.toLocaleString()}</span>
                    <span className="text-muted-foreground ml-1">Koin</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handlePurchase(planId)}
                    disabled={purchasing === planId || (userStatus?.isPremium && planId !== 'lifetime')}
                    className={`w-full ${
                      isPopular(planId)
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                        : ''
                    }`}
                  >
                    {purchasing === planId ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Memproses...
                      </span>
                    ) : userStatus?.isPremium ? (
                      'Sudah Premium'
                    ) : (
                      'Beli Sekarang'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Features Highlight */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Upload Tanpa Batas</h3>
              <p className="text-sm text-muted-foreground">
                Upload hingga 200 meme per hari sebagai premium member
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-semibold mb-2">Badge Eksklusif</h3>
              <p className="text-sm text-muted-foreground">
                Dapatkan badge premium limited edition yang tidak tersedia untuk user biasa
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Priority Support</h3>
              <p className="text-sm text-muted-foreground">
                Dapatkan prioritas support dari tim kami 24/7
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Tanpa Iklan</h3>
              <p className="text-sm text-muted-foreground">
                Nikmati pengalaman berselancar tanpa gangguan iklan
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
