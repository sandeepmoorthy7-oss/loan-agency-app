import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, Coffee, User, LayoutGrid, List } from 'lucide-react';
import { format } from 'date-fns';
import { useIsMobile } from '../components/ui/use-mobile';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { cn } from '../lib/utils';

export function Attendance() {
  const { attendanceRecords, users, addAttendanceRecord, updateAttendanceRecord } = useData();
  const isMobile = useIsMobile();
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
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-3">
          <CalendarIcon className="size-6 md:size-8" />
          Attendance
        </h2>
        <p className="text-white/90 text-sm md:text-lg">Track employee presence</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="rounded-2xl border-none shadow-sm bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
            <CardTitle className="text-[10px] md:text-sm font-semibold text-green-600 uppercase">Present</CardTitle>
            <CheckCircle2 className="size-4 text-green-500/50" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl md:text-4xl font-bold text-green-700">{presentCount}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
            <CardTitle className="text-[10px] md:text-sm font-semibold text-red-600 uppercase">Absent</CardTitle>
            <XCircle className="size-4 text-red-500/50" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl md:text-4xl font-bold text-red-700">{absentCount}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
            <CardTitle className="text-[10px] md:text-sm font-semibold text-yellow-600 uppercase">Half Day</CardTitle>
            <Coffee className="size-4 text-yellow-500/50" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl md:text-4xl font-bold text-yellow-700">{halfDayCount}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
            <CardTitle className="text-[10px] md:text-sm font-semibold text-blue-600 uppercase">Leave</CardTitle>
            <Clock className="size-4 text-blue-500/50" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl md:text-4xl font-bold text-blue-700">{leaveCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar - Conditional rendering for mobile */}
        {!isMobile && (
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon className="size-5 text-indigo-500" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border mx-auto"
              />
            </CardContent>
          </Card>
        )}

        {/* Attendance Records */}
        <Card className="lg:col-span-2 rounded-2xl border-none shadow-sm overflow-hidden">
          <CardHeader className="p-4 md:p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-10 px-3 rounded-xl border-indigo-100 bg-indigo-50 text-indigo-700 font-semibold">
                        <CalendarIcon className="size-4 mr-2" />
                        {format(selectedDate, 'MMM dd')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        className="rounded-2xl"
                      />
                    </PopoverContent>
                  </Popover>
                )}
                <CardTitle className="text-lg md:text-xl">
                  {isMobile ? "Records" : `Attendance - ${format(selectedDate, 'MMMM dd, yyyy')}`}
                </CardTitle>
              </div>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-full md:w-[200px] h-10 rounded-xl border-gray-200">
                  <SelectValue placeholder="Filter by employee" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
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
          <CardContent className={isMobile ? "p-0" : "p-6"}>
            {isMobile ? (
              <div className="divide-y">
                {filteredRecords.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <CalendarIcon className="size-10 mx-auto mb-3 text-gray-300" />
                    <p>No records for this date</p>
                  </div>
                ) : (
                  filteredRecords.map((record) => {
                    const employee = employees.find((e) => e.id === record.userId);
                    return (
                      <div key={record.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                              {record.userName[0]}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 leading-tight">{record.userName}</h4>
                              <p className="text-xs text-gray-500">{employee?.department || 'N/A'}</p>
                            </div>
                          </div>
                          <Badge className={cn("border-none", getStatusColor(record.status))} variant="secondary">
                            {record.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-semibold">Check In</p>
                            <p className="text-sm font-mono font-medium text-gray-700">{record.checkIn || '--:--'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-semibold">Check Out</p>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-mono font-medium text-gray-700">{record.checkOut || '--:--'}</p>
                              {record.status === 'present' && record.checkIn && !record.checkOut && (
                                <Button
                                  size="sm"
                                  className="h-7 px-2 text-[10px] bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                                  onClick={() => handleCheckOut(record.id)}
                                >
                                  Check Out
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        {record.notes && (
                          <div className="text-xs text-gray-500 flex items-start gap-1.5 px-1">
                            <Info className="size-3 mt-0.5 flex-shrink-0" />
                            <p>{record.notes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
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

              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Overview */}
      <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
        <CardHeader className="p-4 md:p-6 border-b">
          <CardTitle className="text-lg md:text-xl">Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-0" : "p-6"}>
          {isMobile ? (
            <div className="divide-y">
              {employees.map((emp) => {
                const empRecords = attendanceRecords.filter((r) => r.userId === emp.id);
                const present = empRecords.filter((r) => r.status === 'present').length;
                const total = empRecords.length;
                const attendancePercent = total > 0 ? Math.round((present / total) * 100) : 0;

                return (
                  <div key={emp.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-700">
                          {emp.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 leading-tight">{emp.name}</h4>
                          <p className="text-xs text-gray-500">{emp.department}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "text-lg font-bold rounded-full px-3 py-1",
                        attendancePercent >= 90 ? 'bg-green-50 text-green-600' : attendancePercent >= 75 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                      )}>
                        {attendancePercent}%
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center p-2 rounded-xl bg-green-50/50">
                        <p className="text-[10px] text-green-600 font-bold uppercase">Pres</p>
                        <p className="text-sm font-bold text-green-700">{present}</p>
                      </div>
                      <div className="text-center p-2 rounded-xl bg-blue-50/50">
                        <p className="text-[10px] text-blue-600 font-bold uppercase">Lv</p>
                        <p className="text-sm font-bold text-blue-700">{empRecords.filter(r => r.status === 'leave').length}</p>
                      </div>
                      <div className="text-center p-2 rounded-xl bg-yellow-50/50">
                        <p className="text-[10px] text-yellow-600 font-bold uppercase">Half</p>
                        <p className="text-sm font-bold text-yellow-700">{empRecords.filter(r => r.status === 'half_day').length}</p>
                      </div>
                      <div className="text-center p-2 rounded-xl bg-red-50/50">
                        <p className="text-[10px] text-red-600 font-bold uppercase">Abs</p>
                        <p className="text-sm font-bold text-red-700">{empRecords.filter(r => r.status === 'absent').length}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}