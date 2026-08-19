import { UserModel } from '../models/userModel.js';
import { RBACModel } from '../models/rbacModel.js';

export const userService = {
  async getAllUsers() {
    return await UserModel.findAll();
  },

  async getUserById(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return user;
  },

  async createUser(userData) {
    const { username, password_hash, email } = userData;
    if (!username || !password_hash || !email) {
      const err = new Error('Username, password_hash and email are required');
      err.status = 400;
      throw err;
    }
    return await UserModel.create(userData);
  },

  async updateUser(id, userData) {
    const user = await UserModel.update(id, userData);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return user;
  },

  async updateUserStatus(id, status) {
    if (!['active', 'disabled', 'locked'].includes(status)) {
      const err = new Error('Invalid status. Use active, disabled, or locked');
      err.status = 400;
      throw err;
    }
    const user = await UserModel.updateStatus(id, status);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return user;
  },

  async deleteUser(id) {
    const user = await UserModel.delete(id);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return user;
  },

  async getUserRoles() {
    return await RBACModel.findAllRoles();
  },

  async createUserRole({ role_name, description }) {
    if (!role_name) {
      const err = new Error('Role name is required');
      err.status = 400;
      throw err;
    }
    return await RBACModel.createRole({ role_name, description });
  },

  async assignUserRole({ user_id, role_id }) {
    if (!user_id || !role_id) {
      const err = new Error('user_id and role_id are required');
      err.status = 400;
      throw err;
    }
    return await RBACModel.assignUserRole({ user_id, role_id });
  }
};
