// src/components/Banner.jsx - Carousel Banner với auto-play
import React, { useState, useEffect } from "react";

// ============================================
// 📸 CHỖ NÀY ĐỂ BẠN TỰ THAY ẢNH VÀO
// ============================================
// Thay đổi các đường dẫn ảnh trong mảng `banners` bên dưới
// Bạn có thể:
// 1. Thêm ảnh vào thư mục `public/images/banners/`
// 2. Hoặc dùng URL ảnh online
// 3. Hoặc dùng ảnh từ thư mục assets
// ============================================
const banners = [
  {
    id: 1,
    image: "/images/banners/momo.png", // 👈 THAY ẢNH Ở ĐÂY - File đang ở public/momo.png
    title: "Deal Chồng Deal",
    subtitle: "Giảm thêm đến 30K khi thanh toán bằng MoMo",
    buttonText: "Mua ngay",
    buttonLink: "#",
    bgColor: "from-pink-500 to-pink-600", // Màu nền nếu không có ảnh
  },
  {
    id: 2,
    image: "/images/banners/thuoc.webp", // 👈 THAY ẢNH Ở ĐÂY
    title: "Giao nhanh 2h",
    subtitle: "Miễn phí vận chuyển cho đơn hàng từ 200K",
    buttonText: "Đổi quà ngay",
    buttonLink: "#",
    bgColor: "from-blue-500 to-blue-600",
  },
  {
    id: 3,
    image: "/images/banners/ebe.avif", // 👈 THAY ẢNH Ở ĐÂY
    title: "Hướng dẫn tra cứu thông tin thuốc",
    subtitle: "Tìm hiểu cách tra cứu thông tin thuốc đúng cách",
    buttonText: "Xem ngay",
    buttonLink: "#",
    bgColor: "from-indigo-500 to-indigo-600",
  },
  // 👇 BẠN CÓ THỂ THÊM NHIỀU BANNER NỮA Ở ĐÂY
  // {
  //   id: 4,
  //   image: '/images/banners/banner4.jpg',
  //   title: 'Banner mới',
  //   subtitle: 'Mô tả banner mới',
  //   buttonText: 'Khám phá',
  //   buttonLink: '#',
  //   bgColor: 'from-green-500 to-green-600',
  // },
];

const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play: Tự động chuyển slide mỗi 5 giây
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // 5 giây

    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);

  // Chuyển slide trước
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false); // Tạm dừng auto-play khi user click
    setTimeout(() => setIsAutoPlaying(true), 10000); // Bật lại sau 10s
  };

  // Chuyển slide sau
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Chuyển đến slide cụ thể
  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Dừng auto-play khi hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <section
      className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Container cho tất cả banners */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Background Image hoặc Gradient */}
            {banner.image ? (
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${banner.image})`,
                }}
              >
                {/* Overlay để text dễ đọc hơn */}
                <div className="absolute inset-0 bg-black/20"></div>
                {/* Fallback nếu ảnh không load được */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${banner.bgColor} opacity-0 hover:opacity-100 transition-opacity`}
                ></div>
              </div>
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-r ${banner.bgColor}`}
              ></div>
            )}

            {/* Content của banner */}
            <div className="relative z-20 h-full flex items-center justify-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                  {banner.title}
                </h2>
                <p className="text-lg md:text-xl lg:text-2xl mb-8 text-white/90 drop-shadow-md max-w-3xl mx-auto">
                  {banner.subtitle}
                </p>
                {banner.buttonText && (
                  <a
                    href={banner.buttonLink}
                    className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {banner.buttonText}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Mũi tên trái/phải */}
      {banners.length > 1 && (
        <>
          {/* Arrow Left */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Previous slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Arrow Right */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Next slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicators - Chấm tròn để chọn slide */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "w-8 h-3 bg-white"
                  : "w-3 h-3 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Banner;
