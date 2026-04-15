import { createBrowserRouter } from 'react-router';
import { Login } from './components/Login';
import { Signup } from './pages/Signup';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Applications } from './pages/Applications';
import { Performance } from './pages/Performance';
import { Attendance } from './pages/Attendance';
import { Announcements } from './pages/Announcements';
import { Messages } from './pages/Messages';
import { Users } from './pages/Users';
import { Tickets } from './pages/Tickets';
import { Calculators } from './pages/Calculators';
import { MemberApplications } from './pages/MemberApplications';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/signup',
    Component: Signup,
  },
  {
    Component: Layout,
    children: [
      {
        path: '/dashboard',
        Component: Dashboard,
      },
      {
        path: '/applications',
        Component: Applications,
      },
      {
        path: '/member-applications',
        Component: MemberApplications,
      },
      {
        path: '/tickets',
        Component: Tickets,
      },
      {
        path: '/calculators',
        Component: Calculators,
      },
      {
        path: '/performance',
        Component: Performance,
      },
      {
        path: '/attendance',
        Component: Attendance,
      },
      {
        path: '/announcements',
        Component: Announcements,
      },
      {
        path: '/messages',
        Component: Messages,
      },
      {
        path: '/users',
        Component: Users,
      },
    ],
  },
]);