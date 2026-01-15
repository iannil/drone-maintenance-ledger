import { useParams } from "react-router-dom";

/**
 * Aircraft detail page
 */
export function AircraftDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">飞机详情</h2>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-500">飞机 ID: {id}</p>
        <p className="text-gray-500 mt-2">详情加载中...</p>
      </div>
    </div>
  );
}
