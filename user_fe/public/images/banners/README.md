# 📸 Hướng dẫn thêm ảnh banner

## Cách thêm ảnh banner:

1. **Đặt ảnh vào thư mục này** (`public/images/banners/`)
   - Tên file: `banner1.jpg`, `banner2.jpg`, `banner3.jpg`, ...
   - Hoặc bạn có thể đặt tên tùy ý

2. **Mở file** `src/components/Banner.jsx`

3. **Tìm mảng `banners`** (dòng 15-50)

4. **Thay đổi đường dẫn ảnh:**
   ```javascript
   {
     id: 1,
     image: '/images/banners/banner1.jpg', // 👈 Thay tên file ở đây
     title: 'Tiêu đề banner',
     subtitle: 'Mô tả banner',
     buttonText: 'Nút bấm',
     buttonLink: '#',
     bgColor: 'from-pink-500 to-pink-600', // Màu nền nếu không có ảnh
   }
   ```

## Lưu ý:
- Kích thước ảnh khuyến nghị: **1920x600px** hoặc tỷ lệ tương tự
- Định dạng: JPG, PNG, WebP
- Nếu không có ảnh, banner sẽ hiển thị màu gradient từ `bgColor`

## Thêm banner mới:
Chỉ cần thêm object mới vào mảng `banners` trong `Banner.jsx`:
```javascript
{
  id: 4,
  image: '/images/banners/banner4.jpg',
  title: 'Banner mới',
  subtitle: 'Mô tả',
  buttonText: 'Khám phá',
  buttonLink: '#',
  bgColor: 'from-green-500 to-green-600',
}
```






