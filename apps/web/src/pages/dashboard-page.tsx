/**
 * Dashboard home page
 */
export function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">首页</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">机队总数</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">可用飞机</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">-</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">维修中</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">-</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">欢迎使用无人机维保账本系统</h3>
        <p className="text-gray-600">
          这是一个面向无人机和 eVTOL 飞行器的开源 MRO（维护、维修和运行）系统。
        </p>
      </div>
    </div>
  );
}
