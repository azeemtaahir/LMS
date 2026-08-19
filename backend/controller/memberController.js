import { memberService } from '../services/memberService.js';

export const getMembers = async (req, res) => {
  try {
    const members = await memberService.getAllMembers();
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members', error: error.message });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const member = await memberService.getMemberById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching member', error: error.message });
  }
};

export const createMember = async (req, res) => {
  try {
    const member = await memberService.createMember(req.body);
    res.status(201).json({ message: 'Member created successfully', member });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating member' });
  }
};

export const updateMember = async (req, res) => {
  try {
    const member = await memberService.updateMember(req.params.id, req.body);
    res.status(200).json({ message: 'Member updated', member });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error updating member' });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const member = await memberService.deleteMember(req.params.id);
    res.status(200).json({ message: 'Member deleted', member });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error deleting member' });
  }
};
