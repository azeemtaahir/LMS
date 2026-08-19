import { bookAuthorService } from '../services/bookAuthorService.js';

export const getBookAuthors = async (req, res) => {
  try {
    const data = await bookAuthorService.getAllBookAuthors();
    res.status(200).json(data);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error fetching book_author links' });
  }
};

export const createBookAuthorLink = async (req, res) => {
  try {
    const { book_id, author_id } = req.body;
    const data = await bookAuthorService.createBookAuthorLink(book_id, author_id);
    res.status(201).json({
      message: 'Book linked with author successfully',
      data
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error linking book and author' });
  }
};

export const deleteBookAuthorLink = async (req, res) => {
  try {
    const { book_id, author_id } = req.body;
    const data = await bookAuthorService.deleteBookAuthorLink(book_id, author_id);
    res.status(200).json({
      message: 'Link removed successfully',
      data
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error deleting book_author link' });
  }
};
