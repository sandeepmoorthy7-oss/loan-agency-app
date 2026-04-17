import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Progress } from '../components/ui/progress';
import { TrendingUp, TrendingDown, Award, Target, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useIsMobile } from '../components/ui/use-mobile';

export function Performance() {
  const { getPerformanceMetrics } = useData();
  const metrics = getPerformanceMetrics();
  const isMobile = useIsMobile();

  const totalApplications = metrics.reduce((sum, m) => sum + m.totalApplications, 0);
  const totalApproved = metrics.reduce((sum, m) => sum + m.approvedApplications, 0);
  const totalRejected = metrics.reduce((sum, m) => sum + m.rejectedApplications, 0);
  const totalPending = metrics.reduce((sum, m) => sum + m.pendingApplications, 0);
  const overallConversionRate = totalApplications > 0 ? Math.round((totalApproved / totalApplications) * 100) : 0;

  // Chart data
  const barChartData = metrics.map((m) => ({
    name: m.userName.split(' ')[0],
    Total: m.totalApplications,
    Approved: m.approvedApplications,
    Rejected: m.rejectedApplications,
  }));

  const pieChartData = [
    { name: 'Approved', value: totalApproved, color: '#22c55e' },
    { name: 'Rejected', value: totalRejected, color: '#ef4444' },
    { name: 'Pending', value: totalPending, color: '#f59e0b' },
  ];

  const topPerformer = metrics.reduce((prev, current) => 
    (current.conversionRate > prev.conversionRate) ? current : prev
  , metrics[0]);

  return (
    <div className={`space-y-6 ${isMobile ? 'pb-24' : ''}`}>
      <div className={`bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl ${isMobile ? 'p-6' : 'p-8'} text-white shadow-xl`}>
        <div className={`flex ${isMobile ? 'flex-col gap-6' : 'items-center justify-between'}`}>
          <div>
            <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold mb-2 flex items-center gap-3`}>
              <TrendingUp className="size-8" />
              Performance Tracker
            </h2>
            <p className="text-white/90 text-lg">Monitor sales team performance and metrics</p>
          </div>
          {topPerformer && (
            <div className={`bg-white text-green-600 rounded-xl p-4 flex items-center gap-3 ${isMobile ? 'w-full justify-center' : ''}`}>
              <Award className="size-8" />
              <div>
                <p className="text-sm font-medium">Top Performer</p>
                <p className="text-lg font-bold">{topPerformer.userName}</p>
                <p className="text-xs">{topPerformer.conversionRate}% conversion</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overall Stats */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${isMobile ? '' : 'md:gap-6'}`}>
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:shadow-lg transition-shadow">
          <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? 'p-4 pb-2' : 'pb-2'}`}>
            <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Total Apps</CardTitle>
            {!isMobile && (
              <div className="bg-indigo-500 p-2 rounded-lg">
                <Target className="size-5 text-white" />
              </div>
            )}
          </CardHeader>
          <CardContent className={isMobile ? 'p-4 pt-0' : ''}>
            <div className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-indigo-600`}>{totalApplications}</div>
            <p className="text-[10px] sm:text-sm text-gray-600 mt-1">All submissions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? 'p-4 pb-2' : 'pb-2'}`}>
            <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Approved</CardTitle>
            {!isMobile && (
              <div className="bg-green-500 p-2 rounded-lg">
                <TrendingUp className="size-5 text-white" />
              </div>
            )}
          </CardHeader>
          <CardContent className={isMobile ? 'p-4 pt-0' : ''}>
            <div className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-green-600`}>{totalApproved}</div>
            <p className="text-[10px] sm:text-sm text-gray-600 mt-1">Success rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:shadow-lg transition-shadow">
          <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? 'p-4 pb-2' : 'pb-2'}`}>
            <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Rejected</CardTitle>
            {!isMobile && (
              <div className="bg-red-500 p-2 rounded-lg">
                <TrendingDown className="size-5 text-white" />
              </div>
            )}
          </CardHeader>
          <CardContent className={isMobile ? 'p-4 pt-0' : ''}>
            <div className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-red-600`}>{totalRejected}</div>
            <p className="text-[10px] sm:text-sm text-gray-600 mt-1">Declined apps</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? 'p-4 pb-2' : 'pb-2'}`}>
            <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">Conversion</CardTitle>
            {!isMobile && (
              <div className="bg-orange-500 p-2 rounded-lg">
                <Award className="size-5 text-white" />
              </div>
            )}
          </CardHeader>
          <CardContent className={isMobile ? 'p-4 pt-0' : ''}>
            <div className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-orange-600`}>{overallConversionRate}%</div>
            <p className="text-[10px] sm:text-sm text-gray-600 mt-1">Overall</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance by Team Member</CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? 'px-2' : ''}>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Total" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Approved" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? 'px-2' : ''}>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={isMobile ? 60 : 80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detailed Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? 'p-0' : ''}>
          {isMobile ? (
            <div className="divide-y divide-gray-200">
              {metrics.map((metric) => (
                <div key={metric.userId} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900">{metric.userName}</h4>
                      <p className="text-xs text-gray-500">Total Amount: ₹{(metric.totalLoanAmount / 100000).toFixed(1)}L</p>
                    </div>
                    <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
                      {metric.conversionRate}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 rounded bg-gray-50">
                      <p className="text-[10px] text-gray-500 uppercase">Total</p>
                      <p className="font-bold text-sm">{metric.totalApplications}</p>
                    </div>
                    <div className="text-center p-2 rounded bg-green-50">
                      <p className="text-[10px] text-green-600 uppercase">Appr</p>
                      <p className="font-bold text-sm text-green-700">{metric.approvedApplications}</p>
                    </div>
                    <div className="text-center p-2 rounded bg-red-50">
                      <p className="text-[10px] text-red-600 uppercase">Rej</p>
                      <p className="font-bold text-sm text-red-700">{metric.rejectedApplications}</p>
                    </div>
                    <div className="text-center p-2 rounded bg-yellow-50">
                      <p className="text-[10px] text-yellow-600 uppercase">Pend</p>
                      <p className="font-bold text-sm text-yellow-700">{metric.pendingApplications}</p>
                    </div>
                  </div>
                  <Progress value={metric.conversionRate} className="h-1.5" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Member</TableHead>
                  <TableHead>Total Applications</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Rejected</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Conversion Rate</TableHead>
                  <TableHead>Total Loan Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((metric) => (
                  <TableRow key={metric.userId}>
                    <TableCell className="font-medium">{metric.userName}</TableCell>
                    <TableCell>{metric.totalApplications}</TableCell>
                    <TableCell className="text-green-600">{metric.approvedApplications}</TableCell>
                    <TableCell className="text-red-600">{metric.rejectedApplications}</TableCell>
                    <TableCell className="text-yellow-600">{metric.pendingApplications}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-[60px]">
                          <Progress value={metric.conversionRate} className="h-2" />
                        </div>
                        <span className="text-sm font-medium">{metric.conversionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>₹{(metric.totalLoanAmount / 100000).toFixed(1)}L</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
