import { MemberModel } from '../models/memberModel.js';
import { UserModel } from '../models/userModel.js';
import bcrypt from 'bcrypt';

export const memberService = {
  async getAllMembers() {
    return await MemberModel.findAll();
  },

  async getMemberById(id) {
    return await MemberModel.findById(id);
  },

  async createMember(memberData) {
    const fullName = memberData.fullName || memberData.name || `${memberData.first_name || ''} ${memberData.last_name || ''}`.trim() || 'New User';
    const parts = fullName.split(' ');
    const first_name = memberData.first_name || parts[0] || 'User';
    const last_name = memberData.last_name || parts.slice(1).join(' ') || 'Member';
    const rawStatus = (memberData.status || 'active').toLowerCase();
    const ALLOWED_STATUSES = ['active', 'suspended', 'inactive'];
    const safeStatus = ALLOWED_STATUSES.includes(rawStatus) ? rawStatus : 'active';
    const userId = memberData.user_id || memberData.studentId || (memberData.email ? memberData.email.split('@')[0] : `MEM-${Date.now().toString().slice(-4)}`);
    const passwordHash = memberData.password ? await bcrypt.hash(memberData.password, 10) : await bcrypt.hash('123456', 10);
    const joined_date = memberData.joined_date || memberData.registeredDate || new Date().toISOString().split('T')[0];

    // 1. Insert into PostgreSQL member table according to ER Diagram
    const newMember = await MemberModel.create({
      user_id: userId,
      first_name,
      last_name,
      email: memberData.email,
      role: memberData.role || 'Student',
      password_hash: passwordHash,
      joined_date,
      status: safeStatus,
    });

    // 2. Insert into PostgreSQL users table linking member_id
    if (memberData.email) {
      try {
        const username = memberData.username || userId;

        await UserModel.create({
          member_id: newMember?.id || null,
          username: username,
          password_hash: passwordHash,
          email: memberData.email,
          status: safeStatus,
          name: fullName,
        });
      } catch (userErr) {
        console.warn('User account creation in users table:', userErr.message);
      }
    }

    return newMember;
  },

  async updateMember(id, memberData) {
    const member = await MemberModel.update(id, memberData);
    if (!member) {
      const err = new Error('Member not found');
      err.status = 404;
      throw err;
    }
    return member;
  },

  async deleteMember(id) {
    const member = await MemberModel.delete(id);
    if (!member) {
      const err = new Error('Member not found');
      err.status = 404;
      throw err;
    }
    return member;
  },
};
