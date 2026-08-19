import { BookModel } from '../models/bookModel.js';

export const bookService = {
  async getAllBooks() {
    return await BookModel.findAll();
  },

  async getBookById(id) {
    return await BookModel.findById(id);
  },

  async createBook(bookData) {
    const validation = BookModel.validateBookInput(bookData);
    if (!validation.isValid) {
      const err = new Error(Object.values(validation.errors).join(', '));
      err.status = 400;
      throw err;
    }
    return await BookModel.create(bookData);
  },

  async updateBook(id, bookData) {
    const existing = await BookModel.findById(id);
    if (!existing) {
      const err = new Error('Book not found');
      err.status = 404;
      throw err;
    }
    return await BookModel.update(id, bookData);
  },

  async deleteBook(id) {
    const book = await BookModel.delete(id);
    if (!book) {
      const err = new Error('Book not found');
      err.status = 404;
      throw err;
    }
    return book;
  },
};
