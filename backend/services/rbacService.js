import { RBACModel } from '../models/rbacModel.js';

export const rbacService = {
  // Roles
  async getRoles() {
    return await RBACModel.findAllRoles();
  },

  async getRoleById(id) {
    return await RBACModel.findRoleById(id);
  },

  async createRole({ role_name, description }) {
    if (!role_name) {
      const err = new Error('role_name is required');
      err.status = 400;
      throw err;
    }
    return await RBACModel.createRole({ role_name, description });
  },

  async updateRole(id, { role_name, description }) {
    const role = await RBACModel.updateRole(id, { role_name, description });
    if (!role) {
      const err = new Error('Role not found');
      err.status = 404;
      throw err;
    }
    return role;
  },

  async deleteRole(id) {
    const role = await RBACModel.deleteRole(id);
    if (!role) {
      const err = new Error('Role not found');
      err.status = 404;
      throw err;
    }
    return role;
  },

  // Permissions
  async getPermissions() {
    return await RBACModel.findAllPermissions();
  },

  async createPermission(data) {
    return await RBACModel.createPermission(data);
  },

  async deletePermission(id) {
    const permission = await RBACModel.deletePermission(id);
    if (!permission) {
      const err = new Error('Permission not found');
      err.status = 404;
      throw err;
    }
    return permission;
  },

  // User Roles
  async getUserRolesList() {
    return await RBACModel.findAllUserRoles();
  },

  async assignUserRoleRelation({ user_id, role_id, assigned_date }) {
    if (!user_id || !role_id) {
      const err = new Error('user_id and role_id are required');
      err.status = 400;
      throw err;
    }
    return await RBACModel.assignUserRole({ user_id, role_id, assigned_date });
  },

  async removeUserRoleRelation(user_id, role_id) {
    const userRole = await RBACModel.removeUserRole(user_id, role_id);
    if (!userRole) {
      const err = new Error('User role assignment not found');
      err.status = 404;
      throw err;
    }
    return userRole;
  },

  // Role Permissions
  async getRolePermissionsList() {
    return await RBACModel.findAllRolePermissions();
  },

  async assignRolePermissionRelation({ role_id, permission_id }) {
    if (!role_id || !permission_id) {
      const err = new Error('role_id and permission_id are required');
      err.status = 400;
      throw err;
    }
    return await RBACModel.assignRolePermission({ role_id, permission_id });
  },

  async removeRolePermissionRelation({ role_id, permission_id }) {
    if (!role_id || !permission_id) {
      const err = new Error('role_id and permission_id are required');
      err.status = 400;
      throw err;
    }
    const rolePermission = await RBACModel.removeRolePermission({ role_id, permission_id });
    if (!rolePermission) {
      const err = new Error('Role permission assignment not found');
      err.status = 404;
      throw err;
    }
    return rolePermission;
  }
};
