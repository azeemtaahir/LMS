import { bookService } from '../services/bookService.js';

export const getBooks = async (req, res) => {
  try {
    const books = await bookService.getAllBooks();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching book', error: error.message });
  }
};

export const createBook = async (req, res) => {
  try {
    const book = await bookService.createBook(req.body);
    res.status(201).json({ message: 'Book added successfully', book });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error adding book' });
  }
};

export const updateBook = async (req, res) => {
  try {
    const book = await bookService.updateBook(req.params.id, req.body);
    res.status(200).json({ message: 'Book updated successfully', book });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error updating book' });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const book = await bookService.deleteBook(req.params.id);
    res.status(200).json({ message: 'Book deleted successfully', book });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error deleting book' });
  }
};
