/**
 * Human-Designed UI Example
 * This is a realistic, human-crafted UI with varied patterns and asymmetry
 * Used as a baseline to test false positive rates
 */

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-black rounded-lg" />
          <span className="font-bold text-lg">Acme</span>
        </div>

        <nav className="space-y-1">
          {[
            { icon: '📊', label: 'Dashboard', active: true },
            { icon: '📁', label: 'Projects', active: false },
            { icon: '👥', label: 'Team', active: false },
            { icon: '📅', label: 'Calendar', active: false },
            { icon: '⚙️', label: 'Settings', active: false },
          ].map(item => (
            <a
              key={item.label}
              href="#"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                item.active
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, Alex. Here's what's happening.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium">
              New Project
            </button>
            <div className="w-9 h-9 bg-gray-200 rounded-full" />
          </div>
        </header>

        {/* Stats Row - Asymmetric layout */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200 col-span-2">
            <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
            <div className="text-3xl font-bold">$84,250</div>
            <div className="text-sm text-green-600 mt-1">↑ 12.5% vs last month</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Active Users</div>
            <div className="text-2xl font-bold">2,847</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Conversion</div>
            <div className="text-2xl font-bold">3.2%</div>
          </div>
        </div>

        {/* Content Area - Mixed layout */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Chart (spans 2 columns) */}
          <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Revenue Over Time</h2>
              <select className="text-sm border border-gray-200 rounded px-2 py-1">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </div>
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
              [Chart Component]
            </div>
          </div>

          {/* Recent Activity (1 column) */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { user: 'Sarah', action: 'created a new project', time: '2m ago' },
                { user: 'Mike', action: 'deployed to production', time: '15m ago' },
                { user: 'Emily', action: 'commented on design', time: '1h ago' },
                { user: 'Alex', action: 'merged PR #284', time: '2h ago' },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full flex-shrink-0" />
                  <div>
                    <div className="text-sm">
                      <span className="font-medium">{activity.user}</span>{' '}
                      {activity.action}
                    </div>
                    <div className="text-xs text-gray-400">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Table - No cards, just data */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold">Active Projects</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Team</th>
                <th className="px-6 py-3 font-medium">Due</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Website Redesign', status: 'In Progress', team: 'Design', due: 'Apr 15' },
                { name: 'Mobile App v2', status: 'Review', team: 'Engineering', due: 'May 1' },
                { name: 'API Migration', status: 'Done', team: 'Backend', due: 'Mar 28' },
              ].map((project, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-6 py-4 font-medium">{project.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      project.status === 'Done' ? 'bg-green-50 text-green-700' :
                      project.status === 'Review' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{project.team}</td>
                  <td className="px-6 py-4 text-gray-600">{project.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
