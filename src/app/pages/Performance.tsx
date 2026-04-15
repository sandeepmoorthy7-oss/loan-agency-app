import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Progress } from '../components/ui/progress';
import { TrendingUp, TrendingDown, Award, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function Performance() {
  const { getPerformanceMetrics } = useData();
  const metrics = getPerformanceMetrics();

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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <TrendingUp className="size-8" />
              Performance Tracker
            </h2>
            <p className="text-white/90 text-lg">Monitor sales team performance and metrics</p>
          </div>
          {topPerformer && (
            <div className="bg-white text-green-600 rounded-xl p-4 flex items-center gap-3">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Applications</CardTitle>
            <div className="bg-indigo-500 p-2 rounded-lg">
              <Target className="size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-indigo-600">{totalApplications}</div>
            <p className="text-sm text-gray-600 mt-1">All submissions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Approved</CardTitle>
            <div className="bg-green-500 p-2 rounded-lg">
              <TrendingUp className="size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{totalApproved}</div>
            <p className="text-sm text-gray-600 mt-1">Success rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Rejected</CardTitle>
            <div className="bg-red-500 p-2 rounded-lg">
              <TrendingDown className="size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">{totalRejected}</div>
            <p className="text-sm text-gray-600 mt-1">Declined applications</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Conversion Rate</CardTitle>
            <div className="bg-orange-500 p-2 rounded-lg">
              <Award className="size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-600">{overallConversionRate}%</div>
            <p className="text-sm text-gray-600 mt-1">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance by Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Total" fill="#8b5cf6" />
                <Bar dataKey="Approved" fill="#22c55e" />
                <Bar dataKey="Rejected" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
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
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <TableCell>{metric.userName}</TableCell>
                  <TableCell>{metric.totalApplications}</TableCell>
                  <TableCell className="text-green-600">{metric.approvedApplications}</TableCell>
                  <TableCell className="text-red-600">{metric.rejectedApplications}</TableCell>
                  <TableCell className="text-yellow-600">{metric.pendingApplications}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Progress value={metric.conversionRate} className="h-2" />
                      </div>
                      <span className="text-sm">{metric.conversionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>₹{(metric.totalLoanAmount / 100000).toFixed(1)}L</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}