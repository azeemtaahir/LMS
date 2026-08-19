import lms from '../config/db.js';

export class RBACModel {
  // --- Roles ---
  static async findAllRoles() {
    const result = await lms.query('SELECT id, role_name, description FROM ROLES');
    return result.rows;
  }

  static async findRoleById(id) {
    const result = await lms.query('SELECT id, role_name, description FROM ROLES WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async createRole({ role_name, description }) {
    const result = await lms.query(
      'INSERT INTO ROLES (role_name, description) VALUES ($1, $2) RETURNING *',
      [role_name, description]
    );
    return result.rows[0];
  }

  static async updateRole(id, { role_name, description }) {
    const result = await lms.query(
      'UPDATE ROLES SET role_name = $1, description = $2 WHERE id = $3 RETURNING *',
      [role_name, description, id]
    );
    return result.rows[0] || null;
  }

  static async deleteRole(id) {
    const result = await lms.query('DELETE FROM ROLES WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }

  // --- Permissions ---
  static async findAllPermissions() {
    const result = await lms.query('SELECT * FROM permissions ORDER BY id ASC');
    return result.rows;
  }

  static async createPermission({ permission_name, resource, action }) {
    const result = await lms.query(
      `INSERT INTO permissions (permission_name, resource, action)
       VALUES ($1, $2, $3) RETURNING *`,
      [permission_name, resource, action]
    );
    return result.rows[0];
  }

  static async deletePermission(id) {
    const result = await lms.query('DELETE FROM permissions WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }

  // --- User Roles ---
  static async findAllUserRoles() {
    const result = await lms.query('SELECT * FROM user_roles ORDER BY user_id, role_id');
    return result.rows;
  }

  static async assignUserRole({ user_id, role_id, assigned_date }) {
    const result = await lms.query(
      `INSERT INTO user_roles (user_id, role_id, assigned_date)
       VALUES ($1, $2, COALESCE($3, CURRENT_DATE)) RETURNING *`,
      [user_id, role_id, assigned_date || null]
    );
    return result.rows[0];
  }

  static async removeUserRole(user_id, role_id) {
    const result = await lms.query(
      'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2 RETURNING *',
      [user_id, role_id]
    );
    return result.rows[0] || null;
  }

  // --- Role Permissions ---
  static async findAllRolePermissions() {
    const result = await lms.query('SELECT * FROM role_permissions ORDER BY role_id, permission_id');
    return result.rows;
  }

  static async assignRolePermission({ role_id, permission_id }) {
    const result = await lms.query(
      `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) RETURNING *`,
      [role_id, permission_id]
    );
    return result.rows[0];
  }

  static async removeRolePermission({ role_id, permission_id }) {
    const result = await lms.query(
      `DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2 RETURNING *`,
      [role_id, permission_id]
    );
    return result.rows[0] || null;
  }
}
