import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Mail,
  User,
  Calendar,
  Wrench,
  Plane,
  Check,
  X,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

// 通知类型
const NOTIFICATION_TYPES = {
  SYSTEM: {
    label: "系统通知",
    icon: Bell,
    color: "bg-blue-100 text-blue-700",
    bgLight: "bg-blue-50",
  },
  WORK_ORDER: {
    label: "工单通知",
    icon: Wrench,
    color: "bg-purple-100 text-purple-700",
    bgLight: "bg-purple-50",
  },
  MAINTENANCE: {
    label: "维保提醒",
    icon: Calendar,
    color: "bg-orange-100 text-orange-700",
    bgLight: "bg-orange-50",
  },
  FLIGHT: {
    label: "飞行通知",
    icon: Plane,
    color: "bg-cyan-100 text-cyan-700",
    bgLight: "bg-cyan-50",
  },
  ALERT: {
    label: "警报",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-700",
    bgLight: "bg-red-50",
  },
  INFO: {
    label: "信息",
    icon: Info,
    color: "bg-slate-100 text-slate-700",
    bgLight: "bg-slate-50",
  },
};

// 通知优先级
const PRIORITY_LEVELS = {
  HIGH: { label: "高", color: "bg-red-500" },
  MEDIUM: { label: "中", color: "bg-yellow-500" },
  LOW: { label: "低", color: "bg-slate-400" },
};

/**
 * 系统通知页面
 */
export function NotificationsPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [readFilter, setReadFilter] = useState<string>("all");
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  // 通知数据
  const notifications = [
    {
      id: "notif-001",
      type: "WORK_ORDER",
      priority: "HIGH",
      title: "新工单分配",
      message: "工单 WO-2026-0120 已分配给您，请及时处理",
      link: "/work-orders/wo-001",
      isRead: false,
      createdAt: "2026-01-16T10:30:00",
      relatedEntity: "WO-2026-0120",
      relatedEntityType: "工单",
    },
    {
      id: "notif-002",
      type: "ALERT",
      priority: "HIGH",
      title: "工单即将逾期",
      message: "工单 WO-2026-0118 将于 2026-01-18 到期，请尽快完成",
      link: "/work-orders/wo-002",
      isRead: false,
      createdAt: "2026-01-16T09:00:00",
      relatedEntity: "WO-2026-0118",
      relatedEntityType: "工单",
    },
    {
      id: "notif-003",
      type: "MAINTENANCE",
      priority: "MEDIUM",
      title: "维保计划提醒",
      message: "飞机 B-7011U 的电机定期检查计划将于 2026-01-20 到期",
      link: "/maintenance/schedules",
      isRead: false,
      createdAt: "2026-01-16T08:15:00",
      relatedEntity: "B-7011U",
      relatedEntityType: "飞机",
    },
    {
      id: "notif-004",
      type: "FLIGHT",
      priority: "LOW",
      title: "飞行记录已提交",
      message: "李四 提交了新的飞行记录 FL-2026-0116",
      link: "/flight-logs/fl-001",
      isRead: true,
      createdAt: "2026-01-15T16:45:00",
      relatedEntity: "FL-2026-0116",
      relatedEntityType: "飞行记录",
    },
    {
      id: "notif-005",
      type: "SYSTEM",
      priority: "MEDIUM",
      title: "系统更新通知",
      message: "系统将于 2026-01-18 02:00-04:00 进行维护升级",
      link: null,
      isRead: false,
      createdAt: "2026-01-15T14:00:00",
      relatedEntity: null,
      relatedEntityType: null,
    },
    {
      id: "notif-006",
      type: "WORK_ORDER",
      priority: "HIGH",
      title: "工单已完成",
      message: "工单 WO-2026-0115 已完成，请进行审核",
      link: "/work-orders/wo-003/release",
      isRead: false,
      createdAt: "2026-01-15T11:30:00",
      relatedEntity: "WO-2026-0115",
      relatedEntityType: "工单",
    },
    {
      id: "notif-007",
      type: "INFO",
      priority: "LOW",
      title: "欢迎使用系统",
      message: "感谢您使用无人机维保管理系统，如有问题请随时联系管理员",
      link: "/settings",
      isRead: true,
      createdAt: "2026-01-14T09:00:00",
      relatedEntity: null,
      relatedEntityType: null,
    },
    {
      id: "notif-008",
      type: "ALERT",
      priority: "HIGH",
      title: "库存预警",
      message: "零部件 EM-2814-001 库存不足，当前库存: 2，最小库存: 5",
      link: "/inventory/alerts",
      isRead: true,
      createdAt: "2026-01-14T08:30:00",
      relatedEntity: "EM-2814-001",
      relatedEntityType: "零部件",
    },
    {
      id: "notif-009",
      type: "MAINTENANCE",
      priority: "MEDIUM",
      title: "证书即将到期",
      message: "飞机 B-7011U 的适航证将于 2025-01-15 到期，请及时续期",
      link: "/airworthiness",
      isRead: true,
      createdAt: "2026-01-13T10:00:00",
      relatedEntity: "B-7011U",
      relatedEntityType: "飞机",
    },
    {
      id: "notif-010",
      type: "FLIGHT",
      priority: "LOW",
      title: "飞行任务完成",
      message: "飞机 B-7012U 巡逻任务已完成，飞行时长: 45分钟",
      link: "/flight-logs/fl-002",
      isRead: true,
      createdAt: "2026-01-13T14:20:00",
      relatedEntity: "B-7012U",
      relatedEntityType: "飞机",
    },
    {
      id: "notif-011",
      type: "SYSTEM",
      priority: "LOW",
      title: "密码即将过期",
      message: "您的密码将在 7 天后过期，请及时修改",
      link: "/profile/settings",
      isRead: true,
      createdAt: "2026-01-12T09:00:00",
      relatedEntity: null,
      relatedEntityType: null,
    },
    {
      id: "notif-012",
      type: "WORK_ORDER",
      priority: "MEDIUM",
      title: "工单已审核通过",
      message: "工单 WO-2026-0110 已审核通过",
      link: "/work-orders/wo-004",
      isRead: true,
      createdAt: "2026-01-11T16:00:00",
      relatedEntity: "WO-2026-0110",
      relatedEntityType: "工单",
    },
  ];

  // 筛选通知
  const filteredNotifications = notifications.filter((notif) => {
    const matchesType = typeFilter === "all" || notif.type === typeFilter;
    const matchesRead = readFilter === "all" ||
      (readFilter === "unread" && !notif.isRead) ||
      (readFilter === "read" && notif.isRead);
    return matchesType && matchesRead;
  });

  // 统计
  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    high: notifications.filter((n) => n.priority === "HIGH" && !n.isRead).length,
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

  // 单选
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedNotifications);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedNotifications(newSet);
  };

  // 标记为已读
  const markAsRead = (id: string) => {
    // TODO: API call
    console.log("Mark as read:", id);
  };

  // 批量标记为已读
  const markSelectedAsRead = () => {
    // TODO: API call
    console.log("Mark selected as read:", selectedNotifications);
    setSelectedNotifications(new Set());
  };

  // 删除通知
  const deleteNotifications = () => {
    // TODO: API call
    console.log("Delete notifications:", selectedNotifications);
    setSelectedNotifications(new Set());
    setShowDeleteDialog(false);
  };

  // 查看详情
  const viewDetail = (notif: typeof notifications[0]) => {
    setSelectedNotification(notif);
    setShowDetailDialog(true);
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "刚刚";
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString("zh-CN");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6" />
            {stats.unread > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {stats.unread}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">通知中心</h1>
            <p className="text-muted-foreground">
              {stats.unread > 0 ? `您有 ${stats.unread} 条未读通知` : "暂无未读通知"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedNotifications.size > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={markSelectedAsRead}>
                <Check className="w-4 h-4 mr-2" />
                标记已读 ({selectedNotifications.size})
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                删除
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              全部通知
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              未读
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              紧急未读
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.high}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">类型:</span>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {Object.entries(NOTIFICATION_TYPES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">状态:</span>
              <Select value={readFilter} onValueChange={setReadFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="unread">未读</SelectItem>
                  <SelectItem value="read">已读</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
                unreadIds.forEach((id) => markAsRead(id));
              }}
            >
              <Check className="w-4 h-4 mr-2" />
              全部已读
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <CardTitle>通知列表</CardTitle>
            <CardDescription>
              共 {filteredNotifications.length} 条通知
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredNotifications.map((notif) => {
              const TypeInfo = NOTIFICATION_TYPES[notif.type as keyof typeof NOTIFICATION_TYPES];

              return (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notif.isRead ? "bg-blue-50/30" : ""
                  }`}
                  onClick={() => viewDetail(notif)}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedNotifications.has(notif.id)}
                      onCheckedChange={() => toggleSelect(notif.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${TypeInfo.bgLight}`}>
                      <TypeInfo.icon className={`h-5 w-5 ${TypeInfo.color.split(" ")[1]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {!notif.isRead && (
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                          <h3 className={`font-medium ${!notif.isRead ? "text-slate-900" : "text-slate-600"}`}>
                            {notif.title}
                          </h3>
                          <Badge className={TypeInfo.color} variant="outline">
                            {TypeInfo.label}
                          </Badge>
                          {notif.priority === "HIGH" && (
                            <Badge className="bg-red-100 text-red-700" variant="outline">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              紧急
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                        {notif.message}
                      </p>
                      {notif.relatedEntity && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>相关:</span>
                          <span className="font-medium">{notif.relatedEntity}</span>
                          {notif.relatedEntityType && <span>({notif.relatedEntityType})</span>}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">暂无通知</h3>
              <p className="text-muted-foreground">
                当前没有符合条件的通知
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除选中的 {selectedNotifications.size} 条通知吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={deleteNotifications}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>通知详情</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={NOTIFICATION_TYPES[selectedNotification.type as keyof typeof NOTIFICATION_TYPES].color}>
                  {NOTIFICATION_TYPES[selectedNotification.type as keyof typeof NOTIFICATION_TYPES].label}
                </Badge>
                {selectedNotification.priority === "HIGH" && (
                  <Badge className="bg-red-100 text-red-700">
                    紧急
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold">{selectedNotification.title}</h3>
              <p className="text-muted-foreground">{selectedNotification.message}</p>
              <div className="text-sm text-muted-foreground">
                接收时间: {new Date(selectedNotification.createdAt).toLocaleString("zh-CN")}
              </div>
              {selectedNotification.link && (
                <Button asChild className="w-full">
                  <Link to={selectedNotification.link}>查看详情</Link>
                </Button>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailDialog(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
