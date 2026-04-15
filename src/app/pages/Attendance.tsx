import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, Coffee } from 'lucide-react';
import { format } from 'date-fns';

export function Attendance() {
  const { attendanceRecords, users, addAttendanceRecord, updateAttendanceRecord } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedUser, setSelectedUser] = useState<string>('all');

  const employees = users.filter((user) => user.role !== 'owner');

  // Filter attendance records
  const getFilteredRecords = () => {
    let filtered = attendanceRecords;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    filtered = filtered.filter((record) => record.date === dateStr);

    if (selectedUser !== 'all') {
      filtered = filtered.filter((record) => record.userId === selectedUser);
    }

    return filtered;
  };

  const filteredRecords = getFilteredRecords();

  // Get attendance summary
  const presentCount = filteredRecords.filter((r) => r.status === 'present').length;
  const absentCount = filteredRecords.filter((r) => r.status === 'absent').length;
  const leaveCount = filteredRecords.filter((r) => r.status === 'leave').length;
  const halfDayCount = filteredRecords.filter((r) => r.status === 'half_day').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'absent':
        return 'bg-gradient-to-r from-red-500 to-rose-500 text-white';
      case 'half_day':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'leave':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleCheckOut = (recordId: string) => {
    const currentTime = format(new Date(), 'HH:mm');
    updateAttendanceRecord(recordId, { checkOut: currentTime });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <CalendarIcon className="size-8" />
          Attendance Management
        </h2>
        <p className="text-white/90 text-lg">Track employee attendance and presence</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Present</CardTitle>
            <div className="bg-green-500 p-2 rounded-lg">
              <CheckCircle2 className="size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{presentCount}</div>
            <p className="text-sm text-gray-600 mt-1">Employees present</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Absent</CardTitle>
            <div className="bg-red-500 p-2 rounded-lg">
              <XCircle className="size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">{absentCount}</div>
            <p className="text-sm text-gray-600 mt-1">Employees absent</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Half Day</CardTitle>
            <div className="bg-yellow-500 p-2 rounded-lg">
              <Coffee className="size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-600">{halfDayCount}</div>
            <p className="text-sm text-gray-600 mt-1">Half day attendance</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">On Leave</CardTitle>
            <div className="bg-blue-500 p-2 rounded-lg">
              <Clock className="size-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{leaveCount}</div>
            <p className="text-sm text-gray-600 mt-1">Employees on leave</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="size-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Attendance - {format(selectedDate, 'MMMM dd, yyyy')}
              </CardTitle>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      No attendance records for this date
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => {
                    const employee = employees.find((e) => e.id === record.userId);
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{record.userName}</TableCell>
                        <TableCell>{employee?.department || 'N/A'}</TableCell>
                        <TableCell>
                          {record.checkIn ? (
                            <span className="text-sm font-mono">{record.checkIn}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.checkOut ? (
                            <span className="text-sm font-mono">{record.checkOut}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)} variant="secondary">
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{record.notes || '-'}</span>
                        </TableCell>
                        <TableCell>
                          {record.status === 'present' && record.checkIn && !record.checkOut && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCheckOut(record.id)}
                            >
                              Check Out
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Attendance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Present Days</TableHead>
                <TableHead>Leave Days</TableHead>
                <TableHead>Half Days</TableHead>
                <TableHead>Absent Days</TableHead>
                <TableHead>Attendance %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => {
                const empRecords = attendanceRecords.filter((r) => r.userId === emp.id);
                const present = empRecords.filter((r) => r.status === 'present').length;
                const leave = empRecords.filter((r) => r.status === 'leave').length;
                const halfDay = empRecords.filter((r) => r.status === 'half_day').length;
                const absent = empRecords.filter((r) => r.status === 'absent').length;
                const total = empRecords.length;
                const attendancePercent = total > 0 ? Math.round((present / total) * 100) : 0;

                return (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell className="text-green-600">{present}</TableCell>
                    <TableCell className="text-blue-600">{leave}</TableCell>
                    <TableCell className="text-yellow-600">{halfDay}</TableCell>
                    <TableCell className="text-red-600">{absent}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={attendancePercent >= 90 ? 'text-green-600' : attendancePercent >= 75 ? 'text-yellow-600' : 'text-red-600'}>
                          {attendancePercent}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}