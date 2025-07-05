
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Calendar, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { QRScanner } from './QRScanner';

interface StatsData {
  today: number;
  week: number;
  month: number;
  totalCustomers: number;
}

export const StaffDashboard = () => {
  const [stats, setStats] = useState<StatsData>({
    today: 0,
    week: 0,
    month: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get today's scans
      const { data: todayData } = await supabase
        .from('visits')
        .select('*')
        .eq('staff_id', user.id)
        .gte('created_at', today.toISOString().split('T')[0]);

      // Get this week's scans
      const { data: weekData } = await supabase
        .from('visits')
        .select('*')
        .eq('staff_id', user.id)
        .gte('created_at', weekAgo.toISOString());

      // Get this month's scans
      const { data: monthData } = await supabase
        .from('visits')
        .select('*')
        .eq('staff_id', user.id)
        .gte('created_at', monthAgo.toISOString());

      // Get total customers
      const { data: customersData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer');

      setStats({
        today: todayData?.length || 0,
        week: weekData?.length || 0,
        month: monthData?.length || 0,
        totalCustomers: customersData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Today's Scans",
      value: stats.today,
      icon: Calendar,
      color: "from-blue-400 to-blue-600"
    },
    {
      title: "This Week",
      value: stats.week,
      icon: BarChart3,
      color: "from-green-400 to-green-600"
    },
    {
      title: "This Month",
      value: stats.month,
      icon: TrendingUp,
      color: "from-purple-400 to-purple-600"
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "from-rose-400 to-pink-600"
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-light text-gray-800 mb-2">Staff Dashboard</h2>
        <p className="text-gray-600">Manage customer loyalty and track visits</p>
      </div>

      <Tabs defaultValue="scanner" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-rose-100">
          <TabsTrigger value="scanner" className="data-[state=active]:bg-white data-[state=active]:text-rose-600">
            QR Scanner
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-white data-[state=active]:text-rose-600">
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scanner">
          <QRScanner />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CardContent className="p-4">
                    <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg mb-3`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-gray-800">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-600 text-center py-8">
                  Scan QR codes to see recent customer activity here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
