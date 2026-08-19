import { userService } from '../services/userService.js';

export const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      message: 'Users fetched successfully',
      users
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error fetching users' });
  }
};

export const getUserRoles = async (req, res) => {
  try {
    const roles = await userService.getUserRoles();
    res.status(200).json({
      message: 'Roles fetched successfully',
      roles
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error fetching roles' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
      message: 'User fetched successfully',
      user
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error fetching user' });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error updating user' });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const user = await userService.updateUserStatus(req.params.id, req.body.status);
    res.status(200).json({
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error updating user status' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    res.status(200).json({
      message: 'User deleted successfully',
      user
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error deleting user' });
  }
};

export const createUserRole = async (req, res) => {
  try {
    const role = await userService.createUserRole(req.body);
    res.status(201).json({
      message: 'Role created successfully',
      role
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating role' });
  }
};

export const assignUserRole = async (req, res) => {
  try {
    const user_role = await userService.assignUserRole(req.body);
    res.status(201).json({
      message: 'Role assigned successfully',
      user_role
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error assigning role' });
  }
};
