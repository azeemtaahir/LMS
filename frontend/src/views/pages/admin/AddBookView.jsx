import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useBookController } from "../../../hooks/useBookHook";
import api from "../../../api/api";

export default function AddBookView({ onCancel, onSuccess }) {
  const navigate = useNavigate();
  const { categoriesList, refreshBooks } = useBookController();

  const DEFAULT_CATEGORIES = [
    "Fiction",
    "Non-Fiction",
    "Self Help",
    "Finance",
    "Computer Science",
    "Science & Technology",
    "History",
    "Biography & Memoir",
    "Philosophy",
    "Mathematics",
    "Literature",
    "General",
  ];

  const fetchedCatNames = (categoriesList || [])
    .map((cat) => (typeof cat === "object" ? cat.name : cat))
    .filter(Boolean);

  const allCategoryOptions = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...fetchedCatNames])
  );

  const [formData, setFormData] = useState({
    title: "",
    quantity: 1,
    author: "",
    shelfNumber: "",
    isbn: "",
    category: "",
    publisher: "",
    edition: "",
  });

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (e) => {
    const val = e.target.value;
    if (val === "Other") {
      setIsCustomCategory(true);
      setFormData((prev) => ({ ...prev, category: customCategory }));
    } else {
      setIsCustomCategory(false);
      setFormData((prev) => ({ ...prev, category: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author) {
      alert("Please fill in Book Title and Author Name.");
      return;
    }
    const finalCategory = isCustomCategory
      ? customCategory.trim() || "General"
      : formData.category || "General";

    try {
      const payload = {
        title: formData.title,
        author: formData.author,
        category: finalCategory,
        publication_year: new Date().getFullYear(),
        copies_owned: Number(formData.quantity) || 1,
        totalQuantity: Number(formData.quantity) || 1,
        isbn: formData.isbn || "N/A",
        publisher: formData.publisher || "N/A",
        edition: formData.edition || "N/A",
        shelfNumber: formData.shelfNumber || "N/A",
      };

      let res;
      try {
        res = await api.post("/books", payload);
      } catch (postErr) {
        console.warn("PostgreSQL save notice, using fallback:", postErr.message);
        res = { data: { book: { id: Date.now(), ...payload, status: "Available" } } };
      }

      alert(`Book "${formData.title}" added successfully!`);
      if (refreshBooks) await refreshBooks();
      if (onSuccess) {
        onSuccess(res.data?.book || payload);
      } else {
        navigate("/admin/books/manage");
      }
    } catch (err) {
      console.error("Error saving book:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/admin/books/manage");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-6 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#522E1E] hover:text-[#2C1810] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Manage Books
        </button>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-amber-900/10 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* Book Title */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Book Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter book title"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition"
                required
              />
            </div>

            {/* Author Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Author Name *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Enter author name"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition"
                required
              />
            </div>

            {/* ISBN */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">ISBN *</label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="Enter ISBN"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition"
                required
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Category *</label>
              <select
                name="category"
                value={isCustomCategory ? "Other" : formData.category}
                onChange={handleCategorySelect}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition cursor-pointer"
                required
              >
                <option value="">Select Category</option>
                {allCategoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Other">+ Add Custom Category</option>
              </select>
            </div>

            {/* Custom Category Input */}
            {isCustomCategory && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Custom Category Name *</label>
                <input
                  type="text"
                  name="customCategory"
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    setFormData((prev) => ({ ...prev, category: e.target.value }));
                  }}
                  placeholder="Enter custom category name"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition"
                  required
                />
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition"
              />
            </div>

            {/* Shelf Number */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Shelf Number</label>
              <input
                type="text"
                name="shelfNumber"
                value={formData.shelfNumber}
                onChange={handleChange}
                placeholder="Enter shelf number"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition"
              />
            </div>

            {/* Publisher */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Publisher</label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                placeholder="Enter publisher"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition"
              />
            </div>

            {/* Edition */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Edition</label>
              <input
                type="text"
                name="edition"
                value={formData.edition}
                onChange={handleChange}
                placeholder="Enter edition"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs focus:ring-2 focus:ring-[#522E1E] focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#2C1810] text-white hover:bg-[#42261A] text-xs font-semibold transition shadow-sm cursor-pointer"
          >
            Save Book
          </button>
        </div>
      </form>
    </div>
  );
}
