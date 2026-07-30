import { useNotification } from "../context/NotificationContext.jsx";

export default function NotificationDropdown() {
    const { notifications, unreadCount } = useNotification();

    const latest = notifications.slice(0, 10); // 최근 10개만

    return (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-lg rounded border border-gray-200 z-50">
            <div className="relative p-3 border-b font-bold text-gray-800 flex items-center justify-between">
                <span>🔔 최근 알림</span>
                {unreadCount > 0 && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                )}
            </div>

            {latest.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">알림이 없습니다.</div>
            ) : (
                <ul className="max-h-64 overflow-auto text-sm text-gray-700">
                    {latest.map((n, i) => (
                        <li key={i} className="px-4 py-2 border-b hover:bg-gray-50">
                            {n.message}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
