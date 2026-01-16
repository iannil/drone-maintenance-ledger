import { useState } from "react";
import {
  Shield,
  Save,
  Undo,
  Users,
  Plus,
  Trash2,
  Eye,
  EyeOff,
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
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

// Permission modules
const PERMISSION_MODULES = [
  {
    id: "aircraft",
    name: "飞机管理",
    permissions: [
      { id: "aircraft.view", name: "查看飞机信息" },
      { id: "aircraft.create", name: "新增飞机" },
      { id: "aircraft.edit", name: "编辑飞机" },
      { id: "aircraft.delete", name: "删除飞机" },
    ],
  },
  {
    id: "component",
    name: "零部件管理",
    permissions: [
      { id: "component.view", name: "查看零部件" },
      { id: "component.create", name: "新增零部件" },
      { id: "component.edit", name: "编辑零部件" },
      { id: "component.delete", name: "删除零部件" },
      { id: "component.transfer", name: "零部件调拨" },
    ],
  },
  {
    id: "maintenance",
    name: "维保管理",
    permissions: [
      { id: "maintenance.schedule_view", name: "查看维保计划" },
      { id: "maintenance.schedule_edit", name: "编辑维保计划" },
      { id: "maintenance.workorder_view", name: "查看工单" },
      { id: "maintenance.workorder_create", name: "创建工单" },
      { id: "maintenance.workorder_execute", name: "执行工单" },
      { id: "maintenance.workorder_release", name: "放行工单" },
      { id: "maintenance.workorder_delete", name: "删除工单" },
    ],
  },
  {
    id: "flight",
    name: "飞行管理",
    permissions: [
      { id: "flight.log_view", name: "查看飞行记录" },
      { id: "flight.log_create", name: "创建飞行记录" },
      { id: "flight.log_edit", name: "编辑飞行记录" },
      { id: "flight.log_delete", name: "删除飞行记录" },
      { id: "flight.pirep_create", name: "提交故障报告" },
    ],
  },
  {
    id: "inventory",
    name: "库存管理",
    permissions: [
      { id: "inventory.view", name: "查看库存" },
      { id: "inventory.edit", name: "编辑库存" },
      { id: "inventory.inbound", name: "入库操作" },
      { id: "inventory.outbound", name: "出库操作" },
      { id: "inventory.transfer", name: "库存调拨" },
      { id: "inventory.adjust", name: "库存调整" },
    ],
  },
  {
    id: "report",
    name: "报表分析",
    permissions: [
      { id: "report.view", name: "查看报表" },
      { id: "report.export", name: "导出报表" },
    ],
  },
  {
    id: "system",
    name: "系统管理",
    permissions: [
      { id: "system.user_view", name: "查看用户" },
      { id: "system.user_edit", name: "管理用户" },
      { id: "system.role_edit", name: "管理角色" },
      { id: "system.settings", name: "系统设置" },
      { id: "system.audit_log", name: "审计日志" },
    ],
  },
];

// Default role permissions
const DEFAULT_ROLE_PERMISSIONS = {
  ADMIN: PERMISSION_MODULES.flatMap((m) => m.permissions.map((p) => p.id)),
  MANAGER: [
    "aircraft.view",
    "component.view",
    "component.transfer",
    "maintenance.schedule_view",
    "maintenance.workorder_view",
    "maintenance.workorder_create",
    "flight.log_view",
    "inventory.view",
    "inventory.transfer",
    "report.view",
    "report.export",
    "system.user_view",
  ],
  INSPECTOR: [
    "aircraft.view",
    "component.view",
    "maintenance.schedule_view",
    "maintenance.workorder_view",
    "maintenance.workorder_release",
    "flight.log_view",
    "inventory.view",
    "report.view",
  ],
  MECHANIC: [
    "aircraft.view",
    "component.view",
    "maintenance.schedule_view",
    "maintenance.workorder_view",
    "maintenance.workorder_execute",
    "flight.log_view",
    "inventory.view",
    "inventory.outbound",
  ],
  PILOT: [
    "aircraft.view",
    "component.view",
    "maintenance.schedule_view",
    "maintenance.workorder_view",
    "flight.log_view",
    "flight.log_create",
    "flight.pirep_create",
    "inventory.view",
  ],
};

// Mock roles with user counts
const MOCK_ROLES = [
  { id: "ADMIN", name: "管理员", description: "系统完全访问权限", userCount: 1, isSystem: true },
  { id: "MANAGER", name: "经理", description: "报表查看和计划管理", userCount: 3, isSystem: true },
  { id: "INSPECTOR", name: "检验员", description: "工单审核和放行", userCount: 2, isSystem: true },
  { id: "MECHANIC", name: "维修工", description: "执行工单和领料", userCount: 5, isSystem: true },
  { id: "PILOT", name: "飞手", description: "飞行记录和故障报告", userCount: 4, isSystem: true },
];

/**
 * Role and permission management page
 */
export function RolesPage() {
  // State
  const [roles, setRoles] = useState(MOCK_ROLES);
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(DEFAULT_ROLE_PERMISSIONS);
  const [hasChanges, setHasChanges] = useState(false);
  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");

  // Check if permission is enabled
  const isPermissionEnabled = (permissionId: string) => {
    return rolePermissions[selectedRole.id]?.includes(permissionId) || false;
  };

  // Toggle permission
  const togglePermission = (permissionId: string) => {
    const currentPermissions = rolePermissions[selectedRole.id] || [];
    const newPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter((id) => id !== permissionId)
      : [...currentPermissions, permissionId];

    setRolePermissions({
      ...rolePermissions,
      [selectedRole.id]: newPermissions,
    });
    setHasChanges(true);
  };

  // Toggle all permissions in a module
  const toggleModule = (module: typeof PERMISSION_MODULES[0]) => {
    const modulePermissionIds = module.permissions.map((p) => p.id);
    const currentPermissions = rolePermissions[selectedRole.id] || [];

    // Check if all permissions in this module are enabled
    const allEnabled = modulePermissionIds.every((id) => currentPermissions.includes(id));

    let newPermissions;
    if (allEnabled) {
      // Remove all permissions in this module
      newPermissions = currentPermissions.filter((id) => !modulePermissionIds.includes(id));
    } else {
      // Add all permissions in this module
      newPermissions = [...new Set([...currentPermissions, ...modulePermissionIds])];
    }

    setRolePermissions({
      ...rolePermissions,
      [selectedRole.id]: newPermissions,
    });
    setHasChanges(true);
  };

  // Check if all permissions in a module are enabled
  const isModuleFullyEnabled = (module: typeof PERMISSION_MODULES[0]) => {
    const modulePermissionIds = module.permissions.map((p) => p.id);
    const currentPermissions = rolePermissions[selectedRole.id] || [];
    return modulePermissionIds.every((id) => currentPermissions.includes(id));
  };

  // Check if some permissions in a module are enabled
  const isModulePartiallyEnabled = (module: typeof PERMISSION_MODULES[0]) => {
    const modulePermissionIds = module.permissions.map((p) => p.id);
    const currentPermissions = rolePermissions[selectedRole.id] || [];
    return modulePermissionIds.some((id) => currentPermissions.includes(id));
  };

  // Save changes
  const handleSave = () => {
    console.log("Save role permissions:", rolePermissions);
    // TODO: API call to save permissions
    setHasChanges(false);
  };

  // Reset changes
  const handleReset = () => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    setHasChanges(false);
  };

  // Create new role
  const handleCreateRole = () => {
    if (newRoleName.trim()) {
      const newRoleId = `ROLE_${Date.now()}`;
      const newRole = {
        id: newRoleId,
        name: newRoleName,
        description: newRoleDescription,
        userCount: 0,
        isSystem: false,
      };
      setRoles([...roles, newRole]);
      setRolePermissions({
        ...rolePermissions,
        [newRoleId]: [],
      });
      setSelectedRole(newRole);
      setShowNewRoleDialog(false);
      setNewRoleName("");
      setNewRoleDescription("");
    }
  };

  // Delete role
  const handleDeleteRole = () => {
    if (selectedRole && !selectedRole.isSystem && selectedRole.userCount === 0) {
      setRoles(roles.filter((r) => r.id !== selectedRole.id));
      setSelectedRole(roles[0]);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">角色权限</h1>
          <p className="text-muted-foreground">
            配置系统角色和功能权限
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <Undo className="w-4 h-4 mr-2" />
            重置
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            保存更改
          </Button>
        </div>
      </div>

      {/* Changes Warning */}
      {hasChanges && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <p>您有未保存的权限更改，请记得保存。</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">角色列表</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowNewRoleDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedRole.id === role.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium truncate">{role.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs ${
                            selectedRole.id === role.id ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}>
                            {role.userCount} 用户
                          </span>
                          {role.isSystem && (
                            <Badge variant="outline" className={`text-xs ${
                              selectedRole.id === role.id ? "border-primary-foreground/30" : ""
                            }`}>
                              系统
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permission Configuration */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedRole.name} 权限配置</CardTitle>
                  <CardDescription>{selectedRole.description}</CardDescription>
                </div>
                {!selectedRole.isSystem && selectedRole.userCount === 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    删除角色
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {PERMISSION_MODULES.map((module) => {
                  const fullyEnabled = isModuleFullyEnabled(module);
                  const partiallyEnabled = isModulePartiallyEnabled(module);

                  return (
                    <div key={module.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`module-${module.id}`}
                            checked={fullyEnabled}
                            onCheckedChange={() => toggleModule(module)}
                          />
                          <Label
                            htmlFor={`module-${module.id}`}
                            className="cursor-pointer font-medium"
                          >
                            {module.name}
                          </Label>
                          <Badge variant="outline" className="text-xs">
                            {module.permissions.filter((p) => isPermissionEnabled(p.id))}/{module.permissions.length}
                          </Badge>
                        </div>
                        {partiallyEnabled && !fullyEnabled && (
                          <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                            部分启用
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 ml-7">
                        {module.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`perm-${permission.id}`}
                              checked={isPermissionEnabled(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                            />
                            <Label
                              htmlFor={`perm-${permission.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Permission Summary */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      总权限:
                    </span>
                    <span className="font-medium">
                      {rolePermissions[selectedRole.id]?.length || 0} / {PERMISSION_MODULES.flatMap((m) => m.permissions).length}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {(rolePermissions[selectedRole.id]?.length || 0) / PERMISSION_MODULES.flatMap((m) => m.permissions).length * 100 > 75 ? (
                      <Badge className="bg-purple-100 text-purple-700">
                        高权限
                      </Badge>
                    ) : (rolePermissions[selectedRole.id]?.length || 0) / PERMISSION_MODULES.flatMap((m) => m.permissions).length * 100 > 50 ? (
                      <Badge className="bg-blue-100 text-blue-700">
                        中等权限
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-700">
                        低权限
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Role Dialog */}
      <Dialog open={showNewRoleDialog} onOpenChange={setShowNewRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新角色</DialogTitle>
            <DialogDescription>
              创建一个自定义角色并配置权限
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="roleName">角色名称 *</Label>
              <Input
                id="roleName"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="例如：仓库管理员"
              />
            </div>
            <div>
              <Label htmlFor="roleDescription">描述</Label>
              <Input
                id="roleDescription"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                placeholder="简要描述角色职责"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRoleDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCreateRole} disabled={!newRoleName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除角色</DialogTitle>
            <DialogDescription>
              确认要删除角色 "{selectedRole?.name}" 吗？
            </DialogDescription>
          </DialogHeader>
          {selectedRole && selectedRole.userCount > 0 ? (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded text-amber-800 text-sm">
              <Eye className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                该角色下还有 {selectedRole.userCount} 个用户，无法删除。请先将用户分配到其他角色。
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded text-red-800 text-sm">
              <EyeOff className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                删除角色后，该角色的权限配置将被永久删除。
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRole}
              disabled={selectedRole?.isSystem || (selectedRole?.userCount || 0) > 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
