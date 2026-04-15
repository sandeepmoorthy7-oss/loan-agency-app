import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Users as UsersIcon, UserCheck, Building2, Briefcase } from 'lucide-react';
import { useData } from '../context/DataContext';

export function Users() {
  const { users } = useData();
  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      owner: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
      sales: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      backend: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      bank_manager: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
    };
    const roleLabels: Record<string, string> = {
      owner: 'Owner',
      sales: 'Sales Team',
      backend: 'Backend Staff',
      bank_manager: 'Bank Manager',
    };
    return (
      <Badge className={roleColors[role] || ''} variant="secondary">
        {roleLabels[role] || role}
      </Badge>
    );
  };

  const roleStats = {
    owner: users.filter((u) => u.role === 'owner').length,
    sales: users.filter((u) => u.role === 'sales').length,
    backend: users.filter((u) => u.role === 'backend').length,
    bank_manager: users.filter((u) => u.role === 'bank_manager').length,
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <UsersIcon className="size-8" />
          User Management
        </h2>
        <p className="text-white/90 text-lg">View and manage all users in the system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Owners</CardTitle>
            <div className="bg-purple-500 p-2 rounded-lg">
              <UserCheck className="size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-600">{roleStats.owner}</div>
            <p className="text-sm text-gray-600 mt-1">Total owners</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Sales Team</CardTitle>
            <div className="bg-blue-500 p-2 rounded-lg">
              <Briefcase className="size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{roleStats.sales}</div>
            <p className="text-sm text-gray-600 mt-1">Sales members</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Backend Staff</CardTitle>
            <div className="bg-green-500 p-2 rounded-lg">
              <UsersIcon className="size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{roleStats.backend}</div>
            <p className="text-sm text-gray-600 mt-1">Backend team</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Bank Managers</CardTitle>
            <div className="bg-orange-500 p-2 rounded-lg">
              <Building2 className="size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-600">{roleStats.bank_manager}</div>
            <p className="text-sm text-gray-600 mt-1">Bank representatives</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Bank (if applicable)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                          {(user.name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-sm">{user.department || '-'}</TableCell>
                  <TableCell className="text-sm">{user.phone || '-'}</TableCell>
                  <TableCell className="text-sm">{user.bankId || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users
                .filter((u) => u.role === 'sales')
                .map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {(user.name || 'S').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Managers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users
                .filter((u) => u.role === 'bank_manager')
                .map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-orange-100 text-orange-700">
                        {(user.name || 'B').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <Building2 className="size-3 inline mr-1" />
                        {user.bankId}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}