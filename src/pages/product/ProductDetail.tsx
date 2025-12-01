import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCartStore } from "../../store/cartStore";
import styles from "./styles/ProductsDetails.module.css";
import api from "../../api/api";
import { Product } from "../../components/product-card/product-card";
import { Review } from "../../types/review";
import { Button, Card, CardContent, TextField } from "@mui/material";
import StarRatings from 'react-star-ratings';
import Swal from "sweetalert2";
import sellerStyles from "./styles/SellerProfile.module.css";

const mockPromotions = [
  "🎁 Giảm ngay 500.000đ khi thanh toán qua Momo.",
  "🚀 Miễn phí giao hàng toàn quốc.",
  "💳 Trả góp 0% qua thẻ tín dụng.",
  "📦 Đổi trả miễn phí trong 7 ngày.",
  "🎧 Tặng tai nghe khi mua trong hôm nay.",
];

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [reviewContent, setReviewContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/product/product-detail/${slug}`);
        setProduct(res.data);
        setLoading(true);
      } catch (err) {
        setLoading(false);
        console.log("Lỗi khi lấy sản phẩm:", err);
        navigate("/not-found");
      }
    };

    const fetchProductImages = async () => {
      try {
        const res = await api.get(`/product/images/${slug}`);
        setProductImages(res.data);
      } catch (err) {
        console.log("Lỗi khi lấy hình ảnh sản phẩm:", err);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await api.get('/review', { params: { productSlug: slug } });
        setReviews(res.data);
      } catch (err) {
        console.log("Lỗi khi lấy đánh giá:", err);
      }
    };
    fetchProduct();
    fetchProductImages();
    fetchReviews();
  }, [slug]);

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await api.post("/cart/add", {
        productSlug: product?.slug,
        quantity: 1
      });
      toast.success(`Đã thêm ${product?.name} vào giỏ hàng!`, {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      console.error("Lỗi thêm vào giỏ hàng:", err);
      toast.error("Không thể thêm sản phẩm vào giỏ.");
    }
  };

  const handleBuyNow = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    handleAddToCart();
    navigate("/cart");
  };

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleSubmitReview = async () => {
    try {
      const response = await api.post("/review", {
        productSlug: product?.slug,
        rating: rating,
        content: reviewContent
      });
      Swal.fire({
        title: "Cảm ơn bạn đã đánh giá sản phẩm! Chúng tôi xin ghi nhận đánh giá của bạn.",
        icon: "success",
        confirmButtonText: "OK"
      }).then(() => {
        window.location.reload();
      });
    } catch (err) {
      console.error("Lỗi khi gửi đánh giá:", err);
      toast.error("Không thể gửi đánh giá.");
    }
  };

  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div className={styles.productPage}>
        <ToastContainer />
        <section className={styles.productOverview}>
          <div className={styles.productImages}>
            <div className={styles.mainImage}>
              <img
                src={productImages[currentImageIndex] || product?.imageUrl}
                alt={product?.name}
              />
            </div>
            <div className={styles.thumbnailImages}>
              {productImages.slice(0, 3).map((image, index) => (
                <button
                  key={image}
                  className={`${styles.thumbnailButton} ${
                    currentImageIndex === index ? styles.thumbnailActive : ""
                  }`}
                  onClick={() => handleImageChange(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleImageChange(index);
                    }
                  }}
                  aria-label={`Select thumbnail ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={styles.thumbnail}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className={styles.productInfo}>
            <h1>{product?.name}</h1>
            {product?.isDiscounted ? (
              <>
                <p className={styles.price}>{product?.discountPrice?.toLocaleString("vi-VN")}₫</p>
                <div className={styles.priceInfo}>
                  <span className={styles.originalPrice}>
                    {product?.price?.toLocaleString("vi-VN")}₫
                  </span>
                  <span className={styles.discount}>-{product?.discountPercent}%</span>
                </div>
              </>
            ) : (
              <p className={styles.price}>{product?.price?.toLocaleString("vi-VN")}₫</p>
            )}
            <p className={styles.rating}>
              {reviews.length > 0 ? `${(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)} • ` : 'Chưa có đánh giá • '}
              Đã bán {product?.sold && product?.sold >= 1000 ? `${(product?.sold / 1000).toFixed(1)}K` : product?.sold}
            </p>
            <div className={styles.actions}>
              <button className={styles.buyNow} onClick={handleBuyNow}>
                Mua ngay
              </button>
              <button className={styles.addToCart} onClick={handleAddToCart}>
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
          <div className={styles.promotions}>
            <h3>🎉 Khuyến mãi khi mua hàng</h3>
            <ul>
              {mockPromotions.map((promo) => (
                <li key={promo}>{promo}</li>
              ))}
            </ul>
          </div>
        </section>
        <section className={styles.productDetails}>
          <div className={sellerStyles.sellerInfoCard}>
            {/* 1. Phần Avatar */}
            <img 
                src={product?.seller.identityCard} // <-- Dùng avatar, KHÔNG dùng CCCD
                alt={product?.seller.shopName}
                className={sellerStyles.avatar}
            />
            
            {/* 2. Phần thông tin text */}
            <div className={sellerStyles.info}>
                <h3 className={sellerStyles.shopName}>{product?.seller.shopName}</h3>
                
                <p className={sellerStyles.description}>{product?.seller.description}</p>
                
                <p className={sellerStyles.phone}>Liên hệ: {product?.seller.phone}</p>
                
                {/* Chúng ta sẽ biến status thành một cái "badge" (nhãn) */}
                <div className={sellerStyles.statusWrapper}>
                    Trạng thái: 
                    <span 
                        className={`${sellerStyles.statusBadge} ${
                            product?.seller.status === 'VERIFIED_SELLER' 
                            ? sellerStyles.active 
                            : sellerStyles.inactive
                        }`}
                    >
                        {product?.seller.status}
                    </span>
                </div>
            </div>
        </div>
        </section>
        <section className={styles.productDetails}>
          <div className={styles.description}>
            <h2>Thông tin sản phẩm</h2>
            <p>{product?.description}</p>
          </div>
          <div className={styles.specifications}>
            <h2>Thông số kỹ thuật</h2>
            <ul>
              {product?.specs?.map((spec, index) => (
                <li key={index}>
                  <strong>{spec.name}:</strong> <span>{spec.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <div className={styles.specifications}>
          <h2>Đánh giá và phản hồi</h2>
          <TextField
            id="outlined-multiline-flexible"
            label="Nhập đánh giá và phản hồi"
            multiline
            maxRows={4}
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <StarRatings
            rating={rating}
            starRatedColor="orange"
            starEmptyColor="gray"
            starHoverColor="orange"
            numberOfStars={5}
            name="rating"
            starDimension="25px"
            starSpacing="2px"
            changeRating={setRating}
          />
          <div style={{ marginTop: "1rem" }}>
            <Button variant="contained" color="primary" onClick={handleSubmitReview}>
              Gửi đánh giá
            </Button>
          </div>
          <Card sx={{ border: "1px solid #ccc", borderRadius: "5px", padding: "8px", marginTop: "1rem" }}>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  <CardContent>
                    <img src={"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} width={40} height={40} style={{ borderRadius: "50%", verticalAlign: "middle", marginRight: "1rem" }} alt={review.username} />
                    <strong>{review.username}</strong>
                    {Array(review.rating).fill("⭐").join("")}
                    <p>{review.content}</p>
                  </CardContent>
                </div>
              ))
            ) : (
              <p>Chưa có đánh giá nào</p>
            )}
          </Card>
        </div>
      </div>
    );
  }
  return null;
};

export default ProductDetailPage;