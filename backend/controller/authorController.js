import { authorService } from '../services/authorService.js';

export const getAuthors = async (req, res) => {
  try {
    const authors = await authorService.getAllAuthors();
    res.status(200).json(authors);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error fetching authors' });
  }
};

export const getAuthorById = async (req, res) => {
  try {
    const author = await authorService.getAuthorById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    res.status(200).json(author);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error fetching author' });
  }
};

export const createAuthor = async (req, res) => {
  try {
    const author = await authorService.createAuthor(req.body);
    res.status(201).json({ message: 'Author created', author });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating author' });
  }
};

export const updateAuthor = async (req, res) => {
  try {
    const author = await authorService.updateAuthor(req.params.id, req.body);
    res.status(200).json({ message: 'Author updated', author });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error updating author' });
  }
};

export const deleteAuthor = async (req, res) => {
  try {
    const author = await authorService.deleteAuthor(req.params.id);
    res.status(200).json({ message: 'Author deleted', author });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error deleting author' });
  }
};

export const assignBookToAuthor = async (req, res) => {
  try {
    const { book_id, author_id } = req.body;
    await authorService.assignBookToAuthor(book_id, author_id);
    res.status(201).json({ message: 'Author assigned to book successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error linking book and author' });
  }
};
