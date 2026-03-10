'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { EventAnalytics, DepartmentStats, CategoryStats, CATEGORY_COLORS, CATEGORY_LABELS } from '@/types';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { BarChart3, PieChart, TrendingUp, Users } from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { size: 12 } },
    },
  },
  scales: {
    x: {
      ticks: { color: '#64748b' },
      grid: { color: 'rgba(255,255,255,0.03)' },
    },
    y: {
      ticks: { color: '#64748b' },
      grid: { color: 'rgba(255,255,255,0.03)' },
    },
  },
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: '#94a3b8', font: { size: 11 }, padding: 16 },
    },
  },
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [eventStats, setEventStats] = useState<EventAnalytics[]>([]);
  const [deptStats, setDeptStats] = useState<DepartmentStats[]>([]);
  const [catStats, setCatStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [overviewRes, eventsRes, deptRes, catRes] = await Promise.all([
        api.analytics.overview(),
        api.analytics.events(),
        api.analytics.departments(),
        api.analytics.categories(),
      ]);
      setOverview(overviewRes.data);
      setEventStats(eventsRes.data);
      setDeptStats(deptRes.data);
      setCatStats(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Chart Data
  const registrationsBarData = {
    labels: eventStats.slice(0, 10).map((e) => e.title.length > 20 ? e.title.slice(0, 20) + '...' : e.title),
    datasets: [
      {
        label: 'Registrations',
        data: eventStats.slice(0, 10).map((e) => e.registrations),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Attendance',
        data: eventStats.slice(0, 10).map((e) => e.attendance),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const departmentPieData = {
    labels: deptStats.map((d) => d._id),
    datasets: [
      {
        data: deptStats.map((d) => d.totalRegistrations),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(234, 179, 8, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const categoryDoughnutData = {
    labels: catStats.map((c) => CATEGORY_LABELS[c._id] || c._id),
    datasets: [
      {
        data: catStats.map((c) => c.totalRegistrations),
        backgroundColor: catStats.map((c) => CATEGORY_COLORS[c._id] + 'cc'),
        borderWidth: 0,
      },
    ],
  };

  const attendanceLineData = {
    labels: eventStats.slice(0, 10).map((e) => e.title.length > 15 ? e.title.slice(0, 15) + '...' : e.title),
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: eventStats.slice(0, 10).map((e) => parseFloat(e.attendanceRate)),
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
        pointBorderColor: '#1e1b4b',
        pointBorderWidth: 2,
      },
    ],
  };

  const overviewCards = [
    { label: 'Total Events', value: overview?.totalEvents || 0, icon: BarChart3, color: 'text-blue-400' },
    { label: 'Total Registrations', value: overview?.totalRegistrations || 0, icon: Users, color: 'text-purple-400' },
    { label: 'Total Attendance', value: overview?.totalAttendance || 0, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Attendance Rate', value: `${overview?.attendanceRate || 0}%`, icon: PieChart, color: 'text-orange-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-gray-400 mt-1">Event performance and participation metrics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card) => (
          <div key={card.label} className="glass-card text-center">
            <card.icon className={`w-6 h-6 mx-auto mb-2 ${card.color}`} />
            <p className="text-3xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations vs Attendance */}
        <div className="glass-card">
          <h3 className="text-lg font-semibold text-white mb-4">Registrations vs Attendance</h3>
          <div className="h-72">
            <Bar data={registrationsBarData} options={chartOptions} />
          </div>
        </div>

        {/* Attendance Rate Trend */}
        <div className="glass-card">
          <h3 className="text-lg font-semibold text-white mb-4">Attendance Rate Trend</h3>
          <div className="h-72">
            <Line data={attendanceLineData} options={chartOptions} />
          </div>
        </div>

        {/* Department Participation */}
        <div className="glass-card">
          <h3 className="text-lg font-semibold text-white mb-4">Department Participation</h3>
          <div className="h-72">
            <Pie data={departmentPieData} options={pieOptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass-card">
          <h3 className="text-lg font-semibold text-white mb-4">Category Distribution</h3>
          <div className="h-72">
            <Doughnut data={categoryDoughnutData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Event Performance Table */}
      <div className="glass-card">
        <h3 className="text-lg font-semibold text-white mb-4">Event Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Event</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Category</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Registrations</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Attended</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">No-shows</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Att. Rate</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Fill Rate</th>
              </tr>
            </thead>
            <tbody>
              {eventStats.map((e) => (
                <tr key={e.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-3 px-4 text-white font-medium">{e.title}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-xs text-gray-400 capitalize">{e.category}</span>
                  </td>
                  <td className="py-3 px-4 text-center text-primary-300">{e.registrations}</td>
                  <td className="py-3 px-4 text-center text-green-400">{e.attendance}</td>
                  <td className="py-3 px-4 text-center text-red-400">{e.noShows}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-medium ${
                      parseFloat(e.attendanceRate) >= 80 ? 'text-green-400' :
                      parseFloat(e.attendanceRate) >= 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {e.attendanceRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-400">{e.fillRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
