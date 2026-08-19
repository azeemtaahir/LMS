import { rbacService } from '../services/rbacService.js';

// Roles
export const getRoles = async (req, res) => {
  try {
    const roles = await rbacService.getRoles();
    res.json(roles);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const role = await rbacService.getRoleById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const createRole = async (req, res) => {
  try {
    const role = await rbacService.createRole(req.body);
    res.status(201).json(role);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const role = await rbacService.updateRole(req.params.id, req.body);
    res.json({ message: 'Role updated successfully', role });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    await rbacService.deleteRole(req.params.id);
    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({
        error: 'Cannot delete role because it is assigned to active users or permissions.'
      });
    }
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Permissions
export const getPermissions = async (req, res) => {
  try {
    const permissions = await rbacService.getPermissions();
    res.status(200).json({
      message: 'Permissions fetched successfully',
      permissions
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error fetching permissions' });
  }
};

export const createPermission = async (req, res) => {
  try {
    const permission = await rbacService.createPermission(req.body);
    res.status(201).json({
      message: 'Permission created successfully',
      permission
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating permission' });
  }
};

export const deletePermission = async (req, res) => {
  try {
    const permission = await rbacService.deletePermission(req.params.id);
    res.status(200).json({
      message: 'Permission deleted successfully',
      permission
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error deleting permission' });
  }
};

// User Roles
export const getUserRolesList = async (req, res) => {
  try {
    const user_roles = await rbacService.getUserRolesList();
    res.status(200).json({
      message: 'User roles fetched successfully',
      user_roles
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error fetching user roles' });
  }
};

export const assignUserRoleRelation = async (req, res) => {
  try {
    const user_role = await rbacService.assignUserRoleRelation(req.body);
    res.status(201).json({
      message: 'Role assigned to user successfully',
      user_role
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error assigning role' });
  }
};

export const removeUserRoleRelation = async (req, res) => {
  try {
    const { user_id, role_id } = req.params;
    const user_role = await rbacService.removeUserRoleRelation(user_id, role_id);
    res.status(200).json({
      message: 'Role unassigned from user successfully',
      user_role
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error removing user role' });
  }
};

// Role Permissions
export const getRolePermissionsList = async (req, res) => {
  try {
    const role_permissions = await rbacService.getRolePermissionsList();
    res.status(200).json({
      message: 'Role permissions fetched successfully',
      role_permissions
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error fetching role permissions' });
  }
};

export const assignRolePermissionRelation = async (req, res) => {
  try {
    const role_permission = await rbacService.assignRolePermissionRelation(req.body);
    res.status(201).json({
      message: 'Permission granted to role',
      role_permission
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error assigning permission' });
  }
};

export const removeRolePermissionRelation = async (req, res) => {
  try {
    const role_permission = await rbacService.removeRolePermissionRelation(req.body);
    res.status(200).json({
      message: 'Permission removed from role',
      role_permission
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error removing permission' });
  }
};
