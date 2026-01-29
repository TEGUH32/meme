'use client';

import { useEffect, useState } from 'react';
import { Coins, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  metadata?: string;
}

interface TransactionTotals {
  totalEarned: number;
  totalSpent: number;
  balance: number;
}

export default function WalletPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<TransactionTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async (type = 'all') => {
    setLoading(true);
    try {
      const url = type === 'all' ? '/api/transactions' : `/api/transactions?type=${type}`;
      const response = await fetch(url);
      const data = await response.json();
      setTransactions(data.transactions || []);
      setTotals(data.totals || null);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Gagal memuat transaksi');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    fetchTransactions(type);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
      case 'referral':
      case 'reward':
        return <ArrowDownRight className="w-5 h-5 text-green-500" />;
      case 'spent':
      case 'premium':
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
      case 'referral':
      case 'reward':
        return 'text-green-600 dark:text-green-400';
      case 'spent':
      case 'premium':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      earned: 'Dapat Koin',
      spent: 'Belanja',
      referral: 'Referral',
      premium: 'Premium',
      reward: 'Reward'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-yellow-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Coins className="w-8 h-8 text-yellow-500" />
              <h1 className="text-3xl font-bold">Dompet Koin</h1>
            </div>
            <p className="text-muted-foreground">
              Kelola koin Anda dan lihat riwayat transaksi
            </p>
          </div>

          {/* Balance Card */}
          <Card className="mb-8 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-amber-500/10 border-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-yellow-900 dark:text-yellow-100">Saldo Koin</CardTitle>
              <CardDescription>Total koin yang Anda miliki saat ini</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-12 w-48" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-yellow-600 dark:text-yellow-400">
                    {totals?.balance.toLocaleString() || 0}
                  </span>
                  <Coins className="w-8 h-8 text-yellow-500" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Koin Didapat
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      +{(totals?.totalEarned || 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Koin Dibelanjakan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-500" />
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      -{(totals?.totalSpent || 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Transaksi</CardTitle>
              <CardDescription>Semua aktivitas koin Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={filterType} onValueChange={handleFilterChange} className="mb-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">Semua</TabsTrigger>
                  <TabsTrigger value="earned">Masuk</TabsTrigger>
                  <TabsTrigger value="spent">Keluar</TabsTrigger>
                </TabsList>
              </Tabs>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada transaksi</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {getTransactionIcon(transaction.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">
                            {transaction.description}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(transaction.type)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>

                      <div className={`text-right flex-shrink-0 ${getTransactionColor(transaction.type)}`}>
                        <p className="font-semibold">
                          {transaction.amount >= 0 ? '+' : ''}
                          {transaction.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Coins className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Cara Mendapatkan Koin
                  </p>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Upload meme: +10 koin</li>
                    <li>• Komen: +5 koin</li>
                    <li>• Like: +1 koin</li>
                    <li>• Follow user: +5 koin</li>
                    <li>• Follow topic: +3 koin</li>
                    <li>• Referral: +50 koin (referrer) / +100 koin (referred)</li>
                    <li>• Achievement badge: bonus 0-500 koin</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
