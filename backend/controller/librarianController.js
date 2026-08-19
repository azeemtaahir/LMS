import { librarianService } from '../services/librarianService.js';

export const getLibrarians = async (req, res) => {
  try {
    const librarians = await librarianService.getAllLibrarians();
    res.status(200).json(librarians);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching librarians', error: error.message });
  }
};

export const createLibrarian = async (req, res) => {
  try {
    const librarian = await librarianService.createLibrarian(req.body);
    res.status(201).json({ message: 'Librarian registered successfully in database', librarian });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error registering librarian' });
  }
};

export const deleteLibrarian = async (req, res) => {
  try {
    const deleted = await librarianService.deleteLibrarian(req.params.id);
    res.status(200).json({ message: 'Librarian deleted successfully', deleted });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error deleting librarian' });
  }
};
