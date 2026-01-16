import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  User,
  Mail,
  Shield,
  MoreHorizontal,
  Edit2,
  Trash2,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
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
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Checkbox } from "../components/ui/checkbox";

// User roles
const USER_ROLES = {
  ADMIN: { label: "管理员", description: "系统完全访问权限", color: "bg-purple-100 text-purple-700" },
  MANAGER: { label: "经理", description: "报表查看和计划管理", color: "bg-blue-100 text-blue-700" },
  INSPECTOR: { label: "检验员", description: "工单审核和放行", color: "bg-green-100 text-green-700" },
  MECHANIC: { label: "维修工", description: "执行工单和领料", color: "bg-orange-100 text-orange-700" },
  PILOT: { label: "飞手", description: "飞行记录和故障报告", color: "bg-slate-100 text-slate-700" },
};

// User status
const USER_STATUS = {
  ACTIVE: { label: "正常", color: "bg-green-100 text-green-700", icon: CheckCircle },
  INACTIVE: { label: "停用", color: "bg-slate-100 text-slate-700", icon: XCircle },
  PENDING: { label: "待激活", color: "bg-yellow-100 text-yellow-700", icon: Clock },
};

// Mock users
const MOCK_USERS = [
  {
    id: "user-001",
    username: "zhangsan",
    fullName: "张三",
    email: "zhangsan@example.com",
    role: "MECHANIC",
    status: "ACTIVE",
    department: "维修部",
    phone: "13800138001",
    license: "CAAC-M-2021001",
    lastLogin: "2026-01-16T09:30:00",
    createdAt: "2025-06-15T10:00:00",
  },
  {
    id: "user-002",
    username: "lisi",
    fullName: "李四",
    email: "lisi@example.com",
    role: "INSPECTOR",
    status: "ACTIVE",
    department: "维修部",
    phone: "13800138002",
    license: "CAAC-I-2020001",
    lastLogin: "2026-01-16T08:15:00",
    createdAt: "2025-05-20T14:00:00",
  },
  {
    id: "user-003",
    username: "wangwu",
    fullName: "王五",
    email: "wangwu@example.com",
    role: "PILOT",
    status: "ACTIVE",
    department: "飞行部",
    phone: "13800138003",
    license: "CAAC-U-2021002",
    lastLogin: "2026-01-15T18:45:00",
    createdAt: "2025-07-01T09:00:00",
  },
  {
    id: "user-004",
    username: "zhaoliu",
    fullName: "赵六",
    email: "zhaoliu@example.com",
    role: "MANAGER",
    status: "ACTIVE",
    department: "运营部",
    phone: "13800138004",
    license: null,
    lastLogin: "2026-01-16T07:00:00",
    createdAt: "2025-03-10T11:00:00",
  },
  {
    id: "user-005",
    username: "admin",
    fullName: "系统管理员",
    email: "admin@example.com",
    role: "ADMIN",
    status: "ACTIVE",
    department: "IT部",
    phone: "13800138000",
    license: null,
    lastLogin: "2026-01-16T10:00:00",
    createdAt: "2025-01-01T08:00:00",
  },
  {
    id: "user-006",
    username: "feiqi",
    fullName: "飞七",
    email: "feiqi@example.com",
    role: "PILOT",
    status: "PENDING",
    department: "飞行部",
    phone: "13800138005",
    license: "CAAC-U-2022001",
    lastLogin: null,
    createdAt: "2026-01-10T16:00:00",
  },
  {
    id: "user-007",
    username: "weiba",
    fullName: "维修八",
    email: "weiba@example.com",
    role: "MECHANIC",
    status: "INACTIVE",
    department: "维修部",
    phone: "13800138006",
    license: "CAAC-M-2020002",
    lastLogin: "2025-12-01T10:00:00",
    createdAt: "2025-04-15T14:00:00",
  },
];

interface NewUser {
  username: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  license: string;
  status: string;
}

/**
 * User management page for administrators
 */
export function UsersPage() {
  // State
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_USERS[0] | null>(null);
  const [newUser, setNewUser] = useState<NewUser>({
    username: "",
    fullName: "",
    email: "",
    role: "MECHANIC",
    department: "",
    phone: "",
    license: "",
    status: "ACTIVE",
  });

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "ACTIVE").length;
    const pending = users.filter((u) => u.status === "PENDING").length;
    const inactive = users.filter((u) => u.status === "INACTIVE").length;

    return { total, active, pending, inactive };
  }, [users]);

  // Get role info
  const getRoleInfo = (role: string) => {
    return USER_ROLES[role as keyof typeof USER_ROLES] || {
      label: role,
      color: "bg-gray-100 text-gray-700",
    };
  };

  // Get status info
  const getStatusInfo = (status: string) => {
    return USER_STATUS[status as keyof typeof USER_STATUS] || {
      label: status,
      color: "bg-gray-100 text-gray-700",
      icon: Clock,
    };
  };

  // Handle create user
  const handleCreateUser = () => {
    console.log("Create user:", newUser);
    // TODO: API call to create user
    setUsers((prev) => [
      {
        id: `user-${Date.now()}`,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role as any,
        status: newUser.status as any,
        department: newUser.department,
        phone: newUser.phone,
        license: newUser.license || null,
        lastLogin: null,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setShowNewUserDialog(false);
    setNewUser({
      username: "",
      fullName: "",
      email: "",
      role: "MECHANIC",
      department: "",
      phone: "",
      license: "",
      status: "ACTIVE",
    });
  };

  // Handle delete user
  const handleDeleteUser = () => {
    if (selectedUser) {
      console.log("Delete user:", selectedUser.id);
      // TODO: API call to delete user
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setShowDeleteDialog(false);
      setSelectedUser(null);
    }
  };

  // Toggle user status
  const toggleUserStatus = (user: typeof MOCK_USERS[0]) => {
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, status: newStatus as any } : u
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">用户管理</h1>
          <p className="text-muted-foreground">
            管理系统用户、角色和权限
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            角色权限
          </Button>
          <Button onClick={() => setShowNewUserDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            新增用户
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              全部用户
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              正常
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              待激活
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              停用
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户名、姓名或邮箱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="角色筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部角色</SelectItem>
                {Object.entries(USER_ROLES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {Object.entries(USER_STATUS).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
              >
                清除筛选
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>用户列表</CardTitle>
              <CardDescription>
                共 {filteredUsers.length} 个用户
              </CardDescription>
            </div>
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
                    角色
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    部门
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    联系方式
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    执照号
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    状态
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    最后登录
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                        ? "未找到匹配的用户"
                        : "暂无用户"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    const statusInfo = getStatusInfo(user.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              <p className="text-sm text-muted-foreground">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{user.department}</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          <div className="text-muted-foreground">{user.phone}</div>
                        </td>
                        <td className="py-3 px-4 text-sm font-mono">
                          {user.license || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString("zh-CN")
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            {user.status === "ACTIVE" ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toggleUserStatus(user)}
                                title="停用用户"
                              >
                                <XCircle className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toggleUserStatus(user)}
                                title="激活用户"
                              >
                                <CheckCircle className="h-4 w-4 text-muted-foreground hover:text-green-500" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New User Dialog */}
      <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新增用户</DialogTitle>
            <DialogDescription>
              创建新的系统用户并分配角色
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <Label htmlFor="username">用户名 *</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="输入用户名"
                />
              </div>

              {/* Full Name */}
              <div>
                <Label htmlFor="fullName">姓名 *</Label>
                <Input
                  id="fullName"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="输入真实姓名"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">邮箱 *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="example@email.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Role */}
              <div>
                <Label htmlFor="role">角色 *</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_ROLES).map(([key, { label, description }]) => (
                      <SelectItem key={key} value={key}>
                        <div>
                          <div className="font-medium">{label}</div>
                          <div className="text-xs text-muted-foreground">
                            {description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department */}
              <div>
                <Label htmlFor="department">部门</Label>
                <Input
                  id="department"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  placeholder="所属部门"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="手机号码"
                />
              </div>

              {/* License */}
              <div>
                <Label htmlFor="license">执照号</Label>
                <Input
                  id="license"
                  value={newUser.license}
                  onChange={(e) => setNewUser({ ...newUser, license: e.target.value })}
                  placeholder="CAAC执照号（可选）"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">初始状态</Label>
              <Select
                value={newUser.status}
                onValueChange={(value) => setNewUser({ ...newUser, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(USER_STATUS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Info */}
            <div className="p-3 bg-blue-50 rounded text-sm text-blue-800">
              <p className="font-medium">提示</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• 新用户创建后，系统将发送激活邮件</li>
                <li>• 用户首次登录需要修改密码</li>
                <li>• 角色决定用户在系统中的权限</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewUserDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCreateUser} disabled={!newUser.username || !newUser.fullName || !newUser.email}>
              <Plus className="h-4 w-4 mr-2" />
              创建用户
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除用户</DialogTitle>
            <DialogDescription>
              您确定要删除用户 "{selectedUser?.fullName}" 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded text-red-800 text-sm">
            <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              删除用户后，该用户将无法登录系统，其创建的历史记录将保留但无法编辑。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              <Trash2 className="h-4 w-4 mr-2" />
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
