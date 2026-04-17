import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Users as UsersIcon, UserCheck, Building2, Briefcase, Mail, Phone, Shield } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useIsMobile } from '../components/ui/use-mobile';

export function Users() {
  const { users } = useData();
  const isMobile = useIsMobile();
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
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3">
          <UsersIcon className="size-6 md:size-8" />
          User Management
        </h2>
        <p className="text-white/90 text-sm md:text-lg">View and manage all users in the system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4 md:p-6">
            <CardTitle className="text-xs md:text-sm font-semibold text-gray-700">Owners</CardTitle>
            <div className="bg-purple-500 p-1.5 md:p-2 rounded-lg">
              <UserCheck className="size-4 md:size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 md:p-6">
            <div className="text-2xl md:text-4xl font-bold text-purple-600">{roleStats.owner}</div>
            <p className="text-[10px] md:text-sm text-gray-600 mt-1">Total owners</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4 md:p-6">
            <CardTitle className="text-xs md:text-sm font-semibold text-gray-700">Sales</CardTitle>
            <div className="bg-blue-500 p-1.5 md:p-2 rounded-lg">
              <Briefcase className="size-4 md:size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 md:p-6">
            <div className="text-2xl md:text-4xl font-bold text-blue-600">{roleStats.sales}</div>
            <p className="text-[10px] md:text-sm text-gray-600 mt-1">Sales members</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4 md:p-6">
            <CardTitle className="text-xs md:text-sm font-semibold text-gray-700">Backend</CardTitle>
            <div className="bg-green-500 p-1.5 md:p-2 rounded-lg">
              <UsersIcon className="size-4 md:size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 md:p-6">
            <div className="text-2xl md:text-4xl font-bold text-green-600">{roleStats.backend}</div>
            <p className="text-[10px] md:text-sm text-gray-600 mt-1">Backend team</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4 md:p-6">
            <CardTitle className="text-xs md:text-sm font-semibold text-gray-700">Bank</CardTitle>
            <div className="bg-orange-500 p-1.5 md:p-2 rounded-lg">
              <Building2 className="size-4 md:size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 md:p-6">
            <div className="text-2xl md:text-4xl font-bold text-orange-600">{roleStats.bank_manager}</div>
            <p className="text-[10px] md:text-sm text-gray-600 mt-1">Bank managers</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table / Mobile List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-0" : ""}>
          {isMobile ? (
            <div className="divide-y border-t">
              {users.map((user) => (
                <div key={user.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border-2 border-indigo-100">
                        <AvatarFallback className="bg-indigo-50 text-indigo-700 font-semibold">
                          {(user.name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-gray-900">{user.name}</h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          {getRoleBadge(user.role)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Mail className="size-3.5 text-gray-400" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="size-3.5 text-gray-400" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.department && (
                      <div className="flex items-center gap-2">
                        <Shield className="size-3.5 text-gray-400" />
                        <span>Dept: {user.department}</span>
                      </div>
                    )}
                    {user.bankId && (
                      <div className="flex items-center gap-2">
                        <Building2 className="size-3.5 text-gray-400" />
                        <span>Bank: {user.bankId}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
          )}
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