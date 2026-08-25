import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";

const validateBookInput = (data) => {
  const errors = {};
  if (!data.title || !data.title.trim()) {
    errors.title = "Book title is required";
  }
  if (!data.isbn || !data.isbn.trim()) {
    errors.isbn = "ISBN Number is required";
  }
  if (!data.category || !data.category.trim()) {
    errors.category = "Category is required";
  }
  if (!data.author || !data.author.trim()) {
    errors.author = "Author is required";
  }
  if (!data.totalQuantity || data.totalQuantity < 1) {
    errors.totalQuantity = "Total quantity must be at least 1";
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const useBookHook = () => {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const authors = Array.from(
    new Set(books.map((b) => b.author || b.author_name).filter(Boolean))
  );
  const [loading, setLoading] = useState(false);
  const searchParamQuery = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(searchParamQuery);
  const [prevSearchParam, setPrevSearchParam] = useState(searchParamQuery);

  if (prevSearchParam !== searchParamQuery) {
    setPrevSearchParam(searchParamQuery);
    setSearchQuery(searchParamQuery);
  }
  const categoryParam = searchParams.get("category") || "All";
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [prevCategoryParam, setPrevCategoryParam] = useState(categoryParam);

  if (prevCategoryParam !== categoryParam) {
    setPrevCategoryParam(categoryParam);
    setSelectedCategory(categoryParam);
  }

  const [newCategoryName, setNewCategoryName] = useState("");
  const [categorySearchFilter, setCategorySearchFilter] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookFormData, setBookFormData] = useState({
    title: "",
    isbn: "",
    category: "",
    author: "",
    totalQuantity: 1,
    coverImage: null,
    ebookFile: null,
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const [res, catRes] = await Promise.allSettled([
        api.get("/books"),
        api.get("/categories"),
      ]);

      const booksData =
        res.status === "fulfilled" && Array.isArray(res.value?.data)
          ? res.value.data
          : [];
      const catsData =
        catRes.status === "fulfilled" && Array.isArray(catRes.value?.data)
          ? catRes.value.data
          : [];

      setBooks(booksData);
      setCategoriesList(catsData);
    } catch (err) {
      console.error("Error fetching books from database:", err);
      setBooks([]);
      setCategoriesList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function initFetch() {
      try {
        const [res, catRes] = await Promise.allSettled([
          api.get("/books"),
          api.get("/categories"),
        ]);

        if (ignore) return;

        const booksData =
          res.status === "fulfilled" && Array.isArray(res.value?.data)
            ? res.value.data
            : [];
        const catsData =
          catRes.status === "fulfilled" && Array.isArray(catRes.value?.data)
            ? catRes.value.data
            : [];

        setBooks(booksData);
        setCategoriesList(catsData);
      } catch (err) {
        console.error("Error fetching books from database:", err);
        if (!ignore) {
          setBooks([]);
          setCategoriesList([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    initFetch();

    const handleCustomUpdate = () => {
      fetchBooks();
    };
    window.addEventListener("book-updated", handleCustomUpdate);

    return () => {
      ignore = true;
      window.removeEventListener("book-updated", handleCustomUpdate);
    };
  }, [fetchBooks]);

  const handleBookFormChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setBookFormData((prev) => ({ ...prev, [name]: files[0] || null }));
    } else {
      setBookFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const openAddModal = () => {
    setEditingBook(null);
    setBookFormData({
      title: "",
      isbn: "",
      category: "",
      author: "",
      totalQuantity: 1,
      coverImage: null,
      ebookFile: null,
      description: "",
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    const validation = validateBookInput(bookFormData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      let savedBook;
      try {
        const response = await api.post("/books", bookFormData);
        savedBook = response.data?.book || response.data;
      } catch {
        savedBook = { id: Date.now(), ...bookFormData, availableCopies: bookFormData.totalQuantity || 1, status: "Available" };
      }

      if (editingBook) {
        setBooks((prev) =>
          prev.map((b) => (b.id === editingBook.id ? { ...b, ...bookFormData } : b))
        );
      } else {
        setBooks((prev) => [...prev, savedBook]);
      }
      setIsAddModalOpen(false);
      setEditingBook(null);
      alert("Book added successfully!");
    } catch (err) {
      console.error("Save book error", err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName || !newCategoryName.trim()) return;
    try {
      let newCat;
      try {
        const res = await api.post("/categories", { name: newCategoryName.trim() });
        newCat = res.data;
      } catch {
        newCat = { id: Date.now(), name: newCategoryName.trim(), bookCount: 0, status: "Active" };
      }
      setCategoriesList((prev) => [...prev, newCat]);
      setNewCategoryName("");
    } catch (err) {
      console.error("Add category error", err);
    }
  };

  const handleUpdateCategoryName = (id, newName) => {
    setCategoriesList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
  };

  const handleToggleCategoryStatus = (id) => {
    setCategoriesList((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" } : c
      )
    );
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setCategoriesList((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const filteredCategories = categoriesList.filter((c) =>
    c.name.toLowerCase().includes(categorySearchFilter.toLowerCase())
  );

  const filteredBooks = (books || []).filter((book) => {
    const matchesSearch =
      (book.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.author || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return {
    books: filteredBooks,
    allBooks: books,
    categoriesList: filteredCategories,
    allCategories: categoriesList,
    authors,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    newCategoryName,
    setNewCategoryName,
    categorySearchFilter,
    setCategorySearchFilter,
    isAddModalOpen,
    setIsAddModalOpen,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    editingBook,
    openAddModal,
    bookFormData,
    setBookFormData,
    formErrors,
    handleBookFormChange,
    handleSaveBook,
    handleAddCategory,
    handleUpdateCategoryName,
    handleToggleCategoryStatus,
    handleDeleteCategory,
    refreshBooks: fetchBooks,
  };
};

export const useBookController = useBookHook;
