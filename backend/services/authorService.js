import { AuthorModel } from '../models/authorModel.js';

export const authorService = {
  async getAllAuthors() {
    return await AuthorModel.findAll();
  },

  async getAuthorById(id) {
    return await AuthorModel.findById(id);
  },

  async createAuthor(authorData) {
    const { first_name, last_name } = authorData;
    if (!first_name || !last_name) {
      const err = new Error('First name and last name are required');
      err.status = 400;
      throw err;
    }
    return await AuthorModel.create({ first_name, last_name });
  },

  async updateAuthor(id, authorData) {
    const { first_name, last_name } = authorData;
    const author = await AuthorModel.update(id, { first_name, last_name });
    if (!author) {
      const err = new Error('Author not found');
      err.status = 404;
      throw err;
    }
    return author;
  },

  async deleteAuthor(id) {
    const author = await AuthorModel.delete(id);
    if (!author) {
      const err = new Error('Author not found');
      err.status = 404;
      throw err;
    }
    return author;
  },

  async assignBookToAuthor(book_id, author_id) {
    return await AuthorModel.assignBook(book_id, author_id);
  }
};
