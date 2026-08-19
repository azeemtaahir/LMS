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
    const name = memberData.fullName || memberData.name || `${memberData.first_name || ''} ${memberData.last_name || ''}`.trim() || 'New User';
    const parts = name.split(' ');
    const first_name = memberData.first_name || parts[0] || 'User';
    const last_name = memberData.last_name || parts.slice(1).join(' ') || 'User';
    const safeStatus = memberData.status || 'active';

    // 1. Insert into PostgreSQL member table
    const newMember = await MemberModel.create({
      first_name,
      last_name,
      joined_date: memberData.joined_date || new Date().toISOString().split('T')[0],
      status: safeStatus,
    });

    // 2. Insert into PostgreSQL users table so user can authenticate
    if (memberData.email) {
      try {
        const passwordHash = memberData.password ? await bcrypt.hash(memberData.password, 10) : await bcrypt.hash('123456', 10);
        await UserModel.create({
          member_id: newMember?.id || null,
          username: memberData.email.split('@')[0],
          password_hash: passwordHash,
          email: memberData.email,
          status: safeStatus,
          name: name,
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
