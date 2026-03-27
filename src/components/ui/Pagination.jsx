import React from "react";
import "../../assets/css/ui/pagination.css";

const Pagination = ({ currentPage, totalPages, onChange }) => {
  const pages = [];

  const createRange = (start, end) => {
    for (let i = start; i <= end; i++) pages.push(i);
  };

  if (totalPages <= 4) {
    createRange(0, totalPages - 1);
  } else {
    if (currentPage <= 2) {
      createRange(0, 2); // 1 2 3
      pages.push("...");
      pages.push(totalPages - 1);
    } else if (currentPage >= totalPages - 2) {
      pages.push(0);
      pages.push("...");
      createRange(totalPages - 3, totalPages - 1);
    } else {
      pages.push(0);
      pages.push("...");
      createRange(currentPage - 1, currentPage + 1);
      pages.push("...");
      pages.push(totalPages - 1);
    }
  }

  return (
    <div className="pagination">
      <button
        onClick={() => onChange(Math.max(currentPage - 1, 0))}
        disabled={currentPage === 0}
      >
        Trang trước
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={i} className="dots">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={currentPage === p ? "active" : ""}
          >
            {p + 1}
          </button>
        )
      )}

      <button
        onClick={() =>
          onChange(Math.min(currentPage + 1, totalPages - 1))
        }
        disabled={currentPage === totalPages - 1}
      >
        Trang sau
      </button>
    </div>
  );
};

export default Pagination;
