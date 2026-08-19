import { BookAuthorModel } from '../models/bookAuthorModel.js';

export const bookAuthorService = {
  async getAllBookAuthors() {
    return await BookAuthorModel.findAll();
  },

  async createBookAuthorLink(book_id, author_id) {
    if (!book_id || !author_id) {
      const err = new Error('Both book_id and author_id are required');
      err.status = 400;
      throw err;
    }
    return await BookAuthorModel.create(book_id, author_id);
  },

  async deleteBookAuthorLink(book_id, author_id) {
    if (!book_id || !author_id) {
      const err = new Error('Both book_id and author_id are required');
      err.status = 400;
      throw err;
    }
    const result = await BookAuthorModel.delete(book_id, author_id);
    if (!result) {
      const err = new Error('Link not found between this book and author');
      err.status = 404;
      throw err;
    }
    return result;
  }
};
