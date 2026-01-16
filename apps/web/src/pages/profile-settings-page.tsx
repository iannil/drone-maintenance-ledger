import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  Key,
  Globe,
  Moon,
  Sun,
  Save,
  Camera,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";

// 语言选项
const LANGUAGES = [
  { value: "zh-CN", label: "简体中文" },
  { value: "zh-TW", label: "繁體中文" },
  { value: "en-US", label: "English" },
  { value: "ja-JP", label: "日本語" },
];

// 时区选项
const TIMEZONES = [
  { value: "Asia/Shanghai", label: "中国标准时间 (UTC+8)" },
  { value: "Asia/Tokyo", label: "日本标准时间 (UTC+9)" },
  { value: "America/New_York", label: "美国东部时间 (UTC-5)" },
  { value: "America/Los_Angeles", label: "美国太平洋时间 (UTC-8)" },
  { value: "Europe/London", label: "格林威治时间 (UTC+0)" },
];

// 通知类型
const NOTIFICATION_TYPES = [
  { id: "workOrderAssigned", label: "工单分配通知", description: "当有工单分配给你时" },
  { id: "workOrderReminder", label: "工单到期提醒", description: "工单即将到期时" },
  { id: "pirepCreated", label: "故障报告通知", description: "有新的故障报告提交时" },
  { id: "scheduleDue", label: "维保计划提醒", description: "维保计划即将到期时" },
  { id: "inventoryAlert", label: "库存预警通知", description: "零部件库存低于警戒线时" },
  { id: "systemUpdate", label: "系统更新通知", description: "系统有重要更新时" },
];

/**
 * 个人设置页面
 */
export function ProfileSettingsPage() {
  // 个人信息
  const [profile, setProfile] = useState({
    name: "张三",
    email: "zhangsan@example.com",
    phone: "13800138000",
    department: "维修部",
    position: "维修工程师",
    employeeId: "EMP-001",
    location: "北京基地",
    bio: "负责无人机维修和保养工作，具有5年相关经验。",
  });

  // 偏好设置
  const [preferences, setPreferences] = useState({
    language: "zh-CN",
    timezone: "Asia/Shanghai",
    theme: "light",
    dateFormat: "YYYY-MM-DD",
    timeFormat: "24h",
  });

  // 通知设置
  const [notifications, setNotifications] = useState({
    workOrderAssigned: { email: true, push: true, sms: false },
    workOrderReminder: { email: true, push: true, sms: false },
    pirepCreated: { email: false, push: true, sms: false },
    scheduleDue: { email: true, push: true, sms: true },
    inventoryAlert: { email: true, push: false, sms: false },
    systemUpdate: { email: true, push: true, sms: false },
  });

  // 密码修改
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 保存状态
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // 处理保存
  const handleSave = (section: string) => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 500);
  };

  // 更新个人信息
  const updateProfile = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  // 更新偏好设置
  const updatePreference = (field: string, value: string) => {
    setPreferences({ ...preferences, [field]: value });
  };

  // 更新通知设置
  const updateNotification = (
    type: string,
    channel: "email" | "push" | "sms",
    value: boolean
  ) => {
    setNotifications({
      ...notifications,
      [type]: { ...notifications[type as keyof typeof notifications], [channel]: value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">个人设置</h1>
        <p className="text-muted-foreground">
          管理您的账户信息和偏好设置
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            基本信息
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Globe className="h-4 w-4" />
            偏好设置
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            通知设置
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            安全设置
          </TabsTrigger>
        </TabsList>

        {/* 基本信息 */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>头像</CardTitle>
              <CardDescription>
                点击头像更换您的个人头像
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-medium">
                    {profile.name.charAt(0)}
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    更换头像
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>个人信息</CardTitle>
              <CardDescription>
                更新您的个人资料和联系信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">姓名 *</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => updateProfile("name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="employeeId">员工编号</Label>
                  <Input id="employeeId" value={profile.employeeId} disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">邮箱 *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateProfile("email", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">手机号码</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => updateProfile("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">部门</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) => updateProfile("department", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="position">职位</Label>
                  <Input
                    id="position"
                    value={profile.position}
                    onChange={(e) => updateProfile("position", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">工作地点</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => updateProfile("location", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">个人简介</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => updateProfile("bio", e.target.value)}
                  rows={3}
                  placeholder="介绍一下自己..."
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                {saveStatus === "saved" && (
                  <span className="flex items-center text-green-600 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    已保存
                  </span>
                )}
                <Button onClick={() => handleSave("profile")}>
                  <Save className="h-4 w-4 mr-2" />
                  保存更改
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 偏好设置 */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>外观设置</CardTitle>
              <CardDescription>
                自定义应用程序的外观和显示
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>主题</Label>
                  <p className="text-sm text-muted-foreground">
                    选择应用程序的主题颜色
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={preferences.theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updatePreference("theme", "light")}
                  >
                    <Sun className="h-4 w-4 mr-1" />
                    浅色
                  </Button>
                  <Button
                    variant={preferences.theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updatePreference("theme", "dark")}
                  >
                    <Moon className="h-4 w-4 mr-1" />
                    深色
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>日期格式</Label>
                  <p className="text-sm text-muted-foreground">
                    选择日期显示格式
                  </p>
                </div>
                <Select value={preferences.dateFormat} onValueChange={(v) => updatePreference("dateFormat", v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YYYY-MM-DD">2026-01-15</SelectItem>
                    <SelectItem value="DD/MM/YYYY">15/01/2026</SelectItem>
                    <SelectItem value="MM/DD/YYYY">01/15/2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>时间格式</Label>
                  <p className="text-sm text-muted-foreground">
                    选择时间显示格式
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={preferences.timeFormat === "24h" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updatePreference("timeFormat", "24h")}
                  >
                    24小时
                  </Button>
                  <Button
                    variant={preferences.timeFormat === "12h" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updatePreference("timeFormat", "12h")}
                  >
                    12小时
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>区域设置</CardTitle>
              <CardDescription>
                设置语言和时区
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">语言</Label>
                  <Select value={preferences.language} onValueChange={(v) => updatePreference("language", v)}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">时区</Label>
                  <Select value={preferences.timezone} onValueChange={(v) => updatePreference("timezone", v)}>
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                {saveStatus === "saved" && (
                  <span className="flex items-center text-green-600 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    已保存
                  </span>
                )}
                <Button onClick={() => handleSave("preferences")}>
                  <Save className="h-4 w-4 mr-2" />
                  保存更改
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>通知偏好</CardTitle>
              <CardDescription>
                选择您希望接收通知的方式
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {NOTIFICATION_TYPES.map((type) => (
                  <div key={type.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <Label className="font-medium">{type.label}</Label>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">邮件</span>
                        <Switch
                          checked={notifications[type.id as keyof typeof notifications].email}
                          onCheckedChange={(v) => updateNotification(type.id, "email", v)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">推送</span>
                        <Switch
                          checked={notifications[type.id as keyof typeof notifications].push}
                          onCheckedChange={(v) => updateNotification(type.id, "push", v)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">短信</span>
                        <Switch
                          checked={notifications[type.id as keyof typeof notifications].sms}
                          onCheckedChange={(v) => updateNotification(type.id, "sms", v)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 mt-6">
                {saveStatus === "saved" && (
                  <span className="flex items-center text-green-600 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    已保存
                  </span>
                )}
                <Button onClick={() => handleSave("notifications")}>
                  <Save className="h-4 w-4 mr-2" />
                  保存更改
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全设置 */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>修改密码</CardTitle>
              <CardDescription>
                定期更改密码有助于保护账户安全
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">当前密码</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="newPassword">新密码</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  密码至少包含8个字符，包括大小写字母、数字和特殊字符
                </p>
              </div>
              <div>
                <Label htmlFor="confirmPassword">确认新密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-end">
                <Button>
                  <Key className="h-4 w-4 mr-2" />
                  更新密码
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>两步验证</CardTitle>
              <CardDescription>
                添加额外的安全层保护您的账户
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用两步验证</Label>
                  <p className="text-sm text-muted-foreground">
                    登录时需要输入额外的验证码
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>活跃会话</CardTitle>
              <CardDescription>
                管理您在其他设备上的登录会话
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium">当前会话</p>
                      <p className="text-sm text-muted-foreground">
                        北京, 中国 · Chrome on Windows
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">当前</Badge>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium">移动设备</p>
                      <p className="text-sm text-muted-foreground">
                        上海, 中国 · App on iOS · 2天前活跃
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    撤销
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
