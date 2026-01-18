import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Globe,
  Plane,
  Wrench,
  FileText,
  Save,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { userService, User as UserType, ROLE_LABELS } from "../services/user.service";

// Role definitions
const ROLES = {
  ADMIN: { label: "系统管理员", color: "bg-purple-100 text-purple-700", description: "完全访问权限" },
  MANAGER: { label: "维保经理", color: "bg-blue-100 text-blue-700", description: "维保计划、工单管理" },
  INSPECTOR: { label: "检验员", color: "bg-green-100 text-green-700", description: "工单审核、签字放行" },
  MECHANIC: { label: "维修工", color: "bg-yellow-100 text-yellow-700", description: "执行工单、领料" },
  PILOT: { label: "飞手", color: "bg-orange-100 text-orange-700", description: "飞行记录、故障报告" },
  VIEWER: { label: "查看者", color: "bg-slate-100 text-slate-700", description: "只读访问" },
};

// Mock notification settings
const notificationSettings = {
  email: {
    workOrderAssigned: true,
    workOrderOverdue: true,
    maintenanceDue: true,
    lowStockAlert: true,
    incidentReport: true,
  },
  push: {
    workOrderAssigned: true,
    workOrderOverdue: true,
    maintenanceDue: false,
    lowStockAlert: false,
    incidentReport: true,
  },
};

// Mock system settings
const systemSettings = {
  organizationName: "无人机运营中心",
  timezone: "Asia/Shanghai",
  language: "zh-CN",
  dateFormat: "YYYY-MM-DD",
  timeFormat: "24h",
  flightHourThreshold: 50,
  cycleThreshold: 200,
  lowStockThreshold: 5,
};

// Mock aircraft types
const aircraftTypes = [
  { id: "at-001", name: "DJI M350 RTK", manufacturer: "DJI", maxPayload: 2.7, maxFlightTime: 55 },
  { id: "at-002", name: "DJI M300 RTK", manufacturer: "DJI", maxPayload: 2.3, maxFlightTime: 42 },
  { id: "at-003", name: "Matrice 30", manufacturer: "DJI", maxPayload: 1.2, maxFlightTime: 35 },
];

// Mock component types
const componentTypes = [
  { id: "ct-001", name: "电机", category: "动力系统", trackingRequired: true },
  { id: "ct-002", name: "螺旋桨", category: "动力系统", trackingRequired: true },
  { id: "ct-003", name: "电池", category: "电源系统", trackingRequired: true },
  { id: "ct-004", name: "飞控", category: "控制系统", trackingRequired: true },
  { id: "ct-005", name: "GPS模块", category: "导航系统", trackingRequired: true },
  { id: "ct-006", name: "相机", category: "任务设备", trackingRequired: false },
];

/**
 * 系统设置页面
 */
export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load current user and users list
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const profile = await userService.getProfile();
        setCurrentUser(profile);

        // Try to load users list
        try {
          const usersList = await userService.list({ limit: 50 });
          setUsers(usersList);
        } catch {
          console.warn("Failed to load users list");
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">系统设置</h1>
          <p className="text-muted-foreground">
            管理账户、偏好和系统配置
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "保存中..." : "保存更改"}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-2">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            个人资料
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            通知
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            外观
          </TabsTrigger>
          <TabsTrigger value="users">
            <Shield className="w-4 h-4 mr-2" />
            用户管理
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Wrench className="w-4 h-4 mr-2" />
            维保设置
          </TabsTrigger>
          <TabsTrigger value="aircraft">
            <Plane className="w-4 h-4 mr-2" />
            机型配置
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="w-4 h-4 mr-2" />
            数据管理
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>个人资料</CardTitle>
              <CardDescription>更新您的个人信息和账户设置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    更换头像
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    支持 JPG、PNG 格式，最大 2MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">姓名</Label>
                  <Input id="fullName" defaultValue={currentUser?.name || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input id="email" type="email" defaultValue={currentUser?.email || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号</Label>
                  <Input id="phone" defaultValue={currentUser?.phone || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">角色</Label>
                  <Select defaultValue={currentUser?.role || "VIEWER"}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLES).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">修改密码</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">当前密码</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">新密码</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">确认密码</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>邮件通知</CardTitle>
                <CardDescription>选择您希望接收的邮件通知类型</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries({
                  workOrderAssigned: "工单分配",
                  workOrderOverdue: "工单逾期",
                  maintenanceDue: "维保到期",
                  lowStockAlert: "库存预警",
                  incidentReport: "事故报告",
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">
                        当有新的{label}时发送邮件通知
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={notificationSettings.email[key as keyof typeof notificationSettings.email]}
                      className="w-4 h-4 rounded border-input"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>推送通知</CardTitle>
                <CardDescription>选择您希望接收的推送通知类型</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries({
                  workOrderAssigned: "工单分配",
                  workOrderOverdue: "工单逾期",
                  maintenanceDue: "维保到期",
                  lowStockAlert: "库存预警",
                  incidentReport: "事故报告",
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">
                        当有新的{label}时发送推送通知
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={notificationSettings.push[key as keyof typeof notificationSettings.push]}
                      className="w-4 h-4 rounded border-input"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>外观设置</CardTitle>
              <CardDescription>自定义系统的显示和格式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">语言</Label>
                  <Select defaultValue={systemSettings.language}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-CN">简体中文</SelectItem>
                      <SelectItem value="zh-TW">繁體中文</SelectItem>
                      <SelectItem value="en-US">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">时区</Label>
                  <Select defaultValue={systemSettings.timezone}>
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Shanghai">中国标准时间 (UTC+8)</SelectItem>
                      <SelectItem value="Asia/Hong_Kong">香港时间 (UTC+8)</SelectItem>
                      <SelectItem value="Asia/Taipei">台北时间 (UTC+8)</SelectItem>
                      <SelectItem value="UTC">协调世界时 (UTC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">日期格式</Label>
                  <Select defaultValue={systemSettings.dateFormat}>
                    <SelectTrigger id="dateFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">2024-01-15</SelectItem>
                      <SelectItem value="DD/MM/YYYY">15/01/2024</SelectItem>
                      <SelectItem value="MM/DD/YYYY">01/15/2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeFormat">时间格式</Label>
                  <Select defaultValue={systemSettings.timeFormat}>
                    <SelectTrigger id="timeFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24小时制 (14:30)</SelectItem>
                      <SelectItem value="12h">12小时制 (2:30 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">主题预览</h3>
                <div className="grid grid-cols-3 gap-4">
                  {["light", "dark", "auto"].map((theme) => (
                    <button
                      key={theme}
                      className={`p-4 rounded-lg border-2 text-center ${
                        theme === "light" ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <div className={`w-full h-16 rounded mb-2 ${
                        theme === "light" ? "bg-white border" :
                        theme === "dark" ? "bg-slate-900" : "bg-gradient-to-r from-white to-slate-900"
                      }`} />
                      <p className="text-sm font-medium capitalize">
                        {theme === "light" ? "浅色" : theme === "dark" ? "深色" : "跟随系统"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>用户管理</CardTitle>
                  <CardDescription>管理系统用户和权限</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  添加用户
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        用户
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        用户名
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        角色
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        状态
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={ROLES[user.role as keyof typeof ROLES]?.color || "bg-slate-100 text-slate-700"}>
                            {ROLES[user.role as keyof typeof ROLES]?.label || user.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "活跃" : "停用"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          暂无用户数据
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-3">角色权限说明</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  {Object.entries(ROLES).map(([key, { label, description }]) => (
                    <div key={key} className="flex items-start gap-2">
                      <Badge className={`${ROLES[key as keyof typeof ROLES].color} mt-0.5`}>
                        {label}
                      </Badge>
                      <span className="text-muted-foreground">{description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>维保设置</CardTitle>
              <CardDescription>配置维保计划和预警阈值</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flightHourThreshold">
                    飞行小时提醒阈值
                  </Label>
                  <Input
                    id="flightHourThreshold"
                    type="number"
                    defaultValue={systemSettings.flightHourThreshold}
                  />
                  <p className="text-xs text-muted-foreground">
                    剩余飞行小时低于此值时发送预警
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cycleThreshold">
                    起降循环提醒阈值
                  </Label>
                  <Input
                    id="cycleThreshold"
                    type="number"
                    defaultValue={systemSettings.cycleThreshold}
                  />
                  <p className="text-xs text-muted-foreground">
                    剩余起降循环低于此值时发送预警
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">
                    库存低量阈值
                  </Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    defaultValue={systemSettings.lowStockThreshold}
                  />
                  <p className="text-xs text-muted-foreground">
                    库存数量低于此值时发送预警
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">零部件类型配置</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                          名称
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                          类别
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                          追踪履历
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {componentTypes.map((type) => (
                        <tr key={type.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{type.name}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{type.category}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            {type.trackingRequired ? (
                              <Badge className="bg-green-100 text-green-700">
                                <Check className="w-3 h-3 mr-1" />
                                是
                              </Badge>
                            ) : (
                              <Badge variant="secondary">否</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  添加零部件类型
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aircraft Tab */}
        <TabsContent value="aircraft">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>机型配置</CardTitle>
                  <CardDescription>管理系统支持的机型和参数</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  添加机型
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        机型名称
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        制造商
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        最大载重
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        最大飞行时间
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {aircraftTypes.map((type) => (
                      <tr key={type.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{type.name}</td>
                        <td className="py-3 px-4">{type.manufacturer}</td>
                        <td className="py-3 px-4">{type.maxPayload} kg</td>
                        <td className="py-3 px-4">{type.maxFlightTime} min</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>数据导出</CardTitle>
                <CardDescription>导出系统数据用于备份或分析</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto py-4">
                    <FileText className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">导出飞机数据</p>
                      <p className="text-xs text-muted-foreground">
                        包含所有飞机和零部件信息
                      </p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-4">
                    <FileText className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">导出维保记录</p>
                      <p className="text-xs text-muted-foreground">
                        包含所有维保计划和工单
                      </p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-4">
                    <FileText className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">导出飞行记录</p>
                      <p className="text-xs text-muted-foreground">
                        包含所有飞行日志和航线
                      </p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-4">
                    <FileText className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">导出库存数据</p>
                      <p className="text-xs text-muted-foreground">
                        包含所有库存和出入库记录
                      </p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>数据同步</CardTitle>
                <CardDescription>与外部系统同步数据</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">云端同步</p>
                      <p className="text-sm text-muted-foreground">
                        上次同步: 10分钟前
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">立即同步</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">危险区域</CardTitle>
                <CardDescription>
                  这些操作不可逆，请谨慎操作
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                  <div>
                    <p className="font-medium">清除所有飞行记录</p>
                    <p className="text-sm text-muted-foreground">
                      删除所有飞行日志和航线数据
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    清除
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                  <div>
                    <p className="font-medium">重置系统数据</p>
                    <p className="text-sm text-muted-foreground">
                      删除所有数据并恢复出厂设置
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    重置
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
