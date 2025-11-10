import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import "../../pages/news/news.css";
import { News } from "../../types/news";

const News2 = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 4;

  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      try {
        const response = await api.get("/news", {
          params: {
            page: currentPage,
            size: pageSize,
          },
        });
        setNewsList(response.data.content);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.number);
        console.log(response.data.content);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải tin tức:", error);
        setError("Không thể tải danh sách tin tức. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  if (loading) {
    return (
      <div className="news-page-container">
        <h1 className="news-title-page">📰 Tin Tức Công Nghệ</h1>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-page-container">
        <h1 className="news-title-page">📰 Tin Tức Công Nghệ</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="news-page-container">
      <h1 className="news-title-page">📰 Tin Tức Công Nghệ</h1>
      <div className="news-list">
        {newsList.length === 0 ? (
          <p>Không có tin tức nào để hiển thị.</p>
        ) : (
          newsList.map((news) => (
            <div key={news.id} className="news-card">
              <Link to={`/news/${news.id}`} className="news-image-link">
                <img
                  src={news.imageUrl || "/images/default.jpg"}
                  alt={news.title}
                  className="news-img"
                  onError={(e) => (e.currentTarget.src = "/images/default.jpg")}
                />
              </Link>
              <div className="news-info">
                <Link to={`/news/${news.id}`} className="news-title-link">
                  <h3>{news.title}</h3>
                </Link>
                <p className="news-summary">{news.excerpt}</p>
                <p className="news-date">
                  🗓{" "}
                  {new Date(news.publishedAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        >
          Trang trước
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={currentPage === i ? "active" : ""}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
          }
          disabled={currentPage === totalPages - 1}
        >
          Trang sau
        </button>
      </div>
    </div>
  );
};

export default News2;