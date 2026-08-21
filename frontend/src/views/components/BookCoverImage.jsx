import { useState } from "react";
import { BookOpen } from "lucide-react";

export default function BookCoverImage({ book, className = "w-full h-40 object-cover rounded-xl" }) {
  const [imgError, setImgError] = useState(false);

  const cleanIsbn = book?.isbn ? String(book.isbn).replace(/[^0-9X]/gi, "") : "";
  
  const initialSrc =
    book?.cover_image ||
    book?.coverImage ||
    book?.cover ||
    (cleanIsbn ? `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg` : null);

  if (!initialSrc || imgError) {
    return (
      <div className={`bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 flex flex-col items-center justify-center text-indigo-300 p-2 text-center select-none ${className}`}>
        <BookOpen className="w-8 h-8 opacity-70 mb-1" />
        <span className="text-[10px] font-bold line-clamp-2 px-1 text-slate-300">
          {book?.title || "No Cover"}
        </span>
      </div>
    );
  }

  return (
    <img
      src={initialSrc}
      alt={book?.title || "Book Cover"}
      onError={() => setImgError(true)}
      className={className}
    />
  );
}
