# CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 3.1. PHÂN TÍCH YÊU CẦU

### 3.1.1. Yêu cầu chức năng (Functional Requirements)

#### 3.1.1.1. Quản lý người dùng
- **FR-01**: Hệ thống cho phép đăng ký tài khoản mới thông qua số điện thoại và OTP
- **FR-02**: Hệ thống xác thực người dùng bằng JWT token sau khi đăng nhập
- **FR-03**: Hệ thống hỗ trợ đặt lại mật khẩu thông qua OTP
- **FR-04**: Hệ thống phân quyền người dùng (Admin và User)

#### 3.1.1.2. Quản lý thuốc trên Blockchain
- **FR-05**: Hệ thống cho phép thêm thuốc mới vào blockchain với thông tin: tên, batch (lô), giá, hình ảnh
- **FR-06**: Hệ thống theo dõi trạng thái thuốc qua các giai đoạn:
  - **Stage 0**: Manufactured (Sản xuất)
  - **Stage 1**: Distributed (Phân phối)
  - **Stage 2**: InPharmacy (Trong nhà thuốc)
  - **Stage 3**: Sold (Đã bán)
  - **Stage 4**: Cancelled (Đã hủy)
- **FR-07**: Hệ thống cho phép cập nhật trạng thái thuốc (chuyển giai đoạn)
- **FR-08**: Hệ thống hỗ trợ soft delete (chuyển thuốc sang trạng thái Cancelled thay vì xóa)
- **FR-09**: Hệ thống lưu trữ thông tin chủ sở hữu (owner) của từng giai đoạn

#### 3.1.1.3. Tìm kiếm và hiển thị
- **FR-10**: Hệ thống cho phép tìm kiếm thuốc theo tên
- **FR-11**: Hệ thống cho phép tìm kiếm thuốc theo batch (lô)
- **FR-12**: Hệ thống hiển thị danh sách tất cả thuốc (lọc bỏ thuốc đã hủy)
- **FR-13**: Hệ thống hiển thị chi tiết từng thuốc (ID, tên, batch, owner, stage, giá)
- **FR-14**: Hệ thống cho phép xem danh sách thuốc theo chủ sở hữu

#### 3.1.1.4. Mua bán thuốc
- **FR-15**: Hệ thống cho phép người dùng mua thuốc chỉ khi thuốc ở trạng thái "InPharmacy" (Stage 2)
- **FR-16**: Hệ thống xử lý thanh toán qua MetaMask (Ethereum wallet)
- **FR-17**: Hệ thống ghi nhận giao dịch mua bán trên blockchain
- **FR-18**: Hệ thống tự động chuyển trạng thái thuốc sang "Sold" sau khi mua thành công

#### 3.1.1.5. Thống kê và báo cáo
- **FR-19**: Hệ thống thống kê doanh thu theo tháng
- **FR-20**: Hệ thống thống kê doanh thu theo ngày trong tháng
- **FR-21**: Hệ thống hiển thị biểu đồ doanh thu (Bar chart và Line chart)
- **FR-22**: Hệ thống lưu trữ lịch sử giao dịch trong MongoDB

### 3.1.2. Yêu cầu phi chức năng (Non-functional Requirements)

#### 3.1.2.1. Hiệu năng (Performance)
- **NFR-01**: Hệ thống phải phản hồi API trong vòng 2 giây
- **NFR-02**: Hệ thống hỗ trợ tối thiểu 100 người dùng đồng thời
- **NFR-03**: Giao dịch blockchain phải được xác nhận trong vòng 30 giây (tùy thuộc vào network)

#### 3.1.2.2. Bảo mật (Security)
- **NFR-04**: Tất cả mật khẩu phải được mã hóa bằng bcrypt
- **NFR-05**: JWT token có thời gian hết hạn 24 giờ
- **NFR-06**: OTP có thời gian hết hạn 5 phút
- **NFR-07**: Chỉ người dùng đã xác thực mới có thể thực hiện giao dịch
- **NFR-08**: Dữ liệu trên blockchain không thể bị thay đổi (immutable)

#### 3.1.2.3. Khả năng mở rộng (Scalability)
- **NFR-09**: Hệ thống sử dụng kiến trúc microservices (tách Frontend và Backend)
- **NFR-10**: Database MongoDB có thể mở rộng theo chiều ngang (horizontal scaling)

#### 3.1.2.4. Khả năng sử dụng (Usability)
- **NFR-11**: Giao diện người dùng thân thiện, dễ sử dụng
- **NFR-12**: Hệ thống hỗ trợ responsive design (mobile, tablet, desktop)
- **NFR-13**: Hệ thống hiển thị thông báo lỗi rõ ràng cho người dùng

#### 3.1.2.5. Tính khả dụng (Availability)
- **NFR-14**: Hệ thống hoạt động 24/7
- **NFR-15**: Hệ thống có khả năng phục hồi khi lỗi xảy ra

## 3.2. SƠ ĐỒ HỆ THỐNG

### 3.2.1. Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                        HỆ THỐNG PHARMA SUPPLY CHAIN             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Admin FE   │         │   User FE    │         │   Mobile     │
│  (React.js)  │         │  (React.js)  │         │  (Optional)  │
│  Port: 5173  │         │  Port: 5174  │         │              │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │  HTTP/REST API          │  HTTP/REST API         │
       │                        │                        │
       └────────────────────────┼────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Backend API         │
                    │   (FastAPI)           │
                    │   Port: 8000         │
                    └───────────┬───────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
│   MongoDB      │    │  Ethereum       │    │   File Storage  │
│   Database     │    │  Blockchain     │    │   (Uploads)     │
│                │    │  (Sepolia)      │    │                 │
│ - users        │    │  - Smart        │    │ - Drug images   │
│ - transactions │    │    Contract    │    │                 │
│ - temp_sessions│    │  - Transactions │    │                 │
└────────────────┘    └─────────────────┘    └─────────────────┘
```

### 3.2.2. Các thành phần chính

#### 3.2.2.1. Frontend Admin (pharma-supply-chain/web)
- **Công nghệ**: React.js, Tailwind CSS, Ethers.js
- **Chức năng**:
  - Quản lý thuốc (thêm, sửa, xóa, cập nhật trạng thái)
  - Xem thống kê doanh thu
  - Tìm kiếm thuốc
  - Quản lý tài khoản

#### 3.2.2.2. Frontend User (user_fe)
- **Công nghệ**: React.js, Tailwind CSS, Ethers.js, MetaMask
- **Chức năng**:
  - Xem danh sách thuốc
  - Tìm kiếm thuốc
  - Mua thuốc qua MetaMask
  - Xem lịch sử mua hàng

#### 3.2.2.3. Backend API (pharma-supply-chain/backend)
- **Công nghệ**: FastAPI, Python, Web3.py
- **Chức năng**:
  - Xác thực người dùng (JWT, OTP)
  - Quản lý thuốc (tương tác với Smart Contract)
  - Lưu trữ giao dịch (MongoDB)
  - Thống kê doanh thu
  - Upload hình ảnh

#### 3.2.2.4. Smart Contract (PharmaSupply.sol)
- **Công nghệ**: Solidity, Ethereum
- **Chức năng**:
  - Lưu trữ thông tin thuốc trên blockchain
  - Quản lý trạng thái thuốc (stages)
  - Xử lý giao dịch mua bán
  - Truy vấn thông tin thuốc

#### 3.2.2.5. Database MongoDB
- **Collections**:
  - `users`: Thông tin người dùng
  - `transactions`: Lịch sử giao dịch
  - `temp_sessions`: Phiên OTP tạm thời

### 3.2.3. Luồng xử lý chính

#### 3.2.3.1. Luồng đăng ký/đăng nhập
```
User → Frontend → Backend API
                    │
                    ├─→ Gửi OTP qua SMS/Email
                    │
                    ├─→ Xác thực OTP
                    │
                    ├─→ Tạo JWT Token
                    │
                    └─→ Trả về Token cho Frontend
```

#### 3.2.3.2. Luồng thêm thuốc
```
Admin → Frontend → Backend API
                    │
                    ├─→ Xác thực JWT Token
                    │
                    ├─→ Upload hình ảnh
                    │
                    ├─→ Gọi Smart Contract: addDrug()
                    │
                    ├─→ Lưu transaction vào MongoDB
                    │
                    └─→ Trả về kết quả
```

#### 3.2.3.3. Luồng mua thuốc
```
User → Frontend (MetaMask)
        │
        ├─→ Kết nối MetaMask
        │
        ├─→ Gọi Smart Contract: buyDrug()
        │
        ├─→ Xác nhận giao dịch trên Blockchain
        │
        ├─→ Backend API lưu transaction vào MongoDB
        │
        └─→ Cập nhật trạng thái thuốc → "Sold"
```

#### 3.2.3.4. Luồng tìm kiếm thuốc
```
User → Frontend → Backend API
                    │
                    ├─→ Gọi Smart Contract: getAllDrugs()
                    │
                    ├─→ Lọc dữ liệu (theo tên/batch)
                    │
                    └─→ Trả về danh sách thuốc
```

## 3.3. THIẾT KẾ DỮ LIỆU VÀ LUỒNG XỬ LÝ

### 3.3.1. Cấu trúc dữ liệu trên Blockchain

#### 3.3.1.1. Struct Drug (trong Smart Contract)
```solidity
struct Drug {
    uint256 id;           // ID duy nhất của thuốc
    string name;          // Tên thuốc
    string batch;         // Số lô sản xuất
    uint256 price;        // Giá (Wei)
    address owner;        // Địa chỉ chủ sở hữu hiện tại
    uint8 stage;          // Trạng thái (0-4)
    bool exists;          // Thuốc có tồn tại không
}
```

#### 3.3.1.2. Mapping trong Smart Contract
```solidity
mapping(uint256 => Drug) public drugs;        // drugs[id] → Drug
mapping(address => uint256[]) public ownerDrugs; // ownerDrugs[address] → [id1, id2, ...]
uint256 public drugCount;                      // Tổng số thuốc
```

#### 3.3.1.3. Events trong Smart Contract
```solidity
event DrugAdded(uint256 indexed id, string name, string batch);
event StageUpdated(uint256 indexed id, uint8 newStage, address newOwner);
event DrugPurchased(uint256 indexed id, address buyer, uint256 price);
event DrugCancelled(uint256 indexed id);
```

### 3.3.2. Cấu trúc dữ liệu trong MongoDB

#### 3.3.2.1. Collection: users
```javascript
{
  _id: ObjectId,
  phone: String,           // Số điện thoại
  password: String,        // Mật khẩu đã hash (bcrypt)
  role: String,            // "admin" hoặc "user"
  wallet_address: String,  // Địa chỉ ví Ethereum (optional)
  created_at: Date,
  updated_at: Date
}
```

#### 3.3.2.2. Collection: transactions
```javascript
{
  _id: ObjectId,
  drug_id: Number,         // ID thuốc trên blockchain
  drug_name: String,       // Tên thuốc
  customer: String,        // Địa chỉ ví người mua
  price_eth: Number,       // Giá (ETH)
  price_wei: String,       // Giá (Wei)
  tx_hash: String,         // Hash giao dịch blockchain
  date: String,            // Ngày giao dịch (YYYY-MM-DD)
  timestamp: Date,          // Thời gian chính xác
  month: Number,           // Tháng (1-12)
  year: Number             // Năm
}
```

#### 3.3.2.3. Collection: temp_sessions
```javascript
{
  _id: ObjectId,
  phone: String,           // Số điện thoại
  otp_code: String,        // Mã OTP
  expires_at: Date,        // Thời gian hết hạn
  purpose: String          // "register", "login", "reset_password"
}
```

### 3.3.3. Luồng xử lý chi tiết

#### 3.3.3.1. Luồng Mining Block (Blockchain)
```
1. User thực hiện giao dịch (addDrug, buyDrug, updateStage)
   ↓
2. Giao dịch được gửi đến Ethereum Network
   ↓
3. Miners xác thực giao dịch
   ↓
4. Giao dịch được đóng gói vào Block
   ↓
5. Block được thêm vào Blockchain
   ↓
6. Smart Contract state được cập nhật
   ↓
7. Event được emit
   ↓
8. Frontend nhận thông báo qua WebSocket hoặc polling
```

#### 3.3.3.2. Luồng Verification (Xác thực)
```
1. User gửi request với JWT Token
   ↓
2. Backend kiểm tra Token signature
   ↓
3. Backend kiểm tra Token expiration
   ↓
4. Backend lấy thông tin user từ Token
   ↓
5. Backend kiểm tra quyền truy cập
   ↓
6. Nếu hợp lệ → Xử lý request
   Nếu không hợp lệ → Trả về 401 Unauthorized
```

#### 3.3.3.3. Luồng Consensus (Đồng thuận)
```
Ethereum sử dụng Proof-of-Stake (PoS) consensus:
1. Validators stake ETH để tham gia
2. Validators được chọn ngẫu nhiên để tạo block
3. Các validators khác xác thực block
4. Nếu 2/3 validators đồng ý → Block được thêm vào chain
5. Validators nhận phần thưởng
```

### 3.3.4. Các hàm chính trong Smart Contract

#### 3.3.4.1. addDrug()
```solidity
function addDrug(
    string memory _name,
    string memory _batch,
    uint256 _price
) public returns (uint256)
```
- **Input**: Tên, batch, giá
- **Output**: ID thuốc mới
- **Xử lý**: Tạo Drug mới với stage = 0 (Manufactured), owner = msg.sender

#### 3.3.4.2. updateStage()
```solidity
function updateStage(
    uint256 _id,
    uint8 _newStage,
    address _newOwner
) public
```
- **Input**: ID thuốc, stage mới, owner mới
- **Xử lý**: Cập nhật stage và owner của thuốc
- **Validation**: Chỉ owner hiện tại mới được cập nhật

#### 3.3.4.3. buyDrug()
```solidity
function buyDrug(uint256 _id) public payable
```
- **Input**: ID thuốc
- **Xử lý**: 
  - Kiểm tra thuốc ở stage 2 (InPharmacy)
  - Kiểm tra số tiền gửi đủ
  - Chuyển tiền cho owner
  - Cập nhật stage = 3 (Sold), owner = msg.sender

#### 3.3.4.4. cancelDrug()
```solidity
function cancelDrug(uint256 _id) public
```
- **Input**: ID thuốc
- **Xử lý**: Chuyển stage = 4 (Cancelled) - Soft delete

#### 3.3.4.5. getAllDrugs()
```solidity
function getAllDrugs() public view returns (
    uint256[] memory,
    string[] memory,
    string[] memory,
    uint256[] memory,
    address[] memory,
    uint8[] memory
)
```
- **Output**: Mảng các thông tin thuốc (id, name, batch, price, owner, stage)

### 3.3.5. API Endpoints chính

#### 3.3.5.1. Authentication
- `POST /api/auth/request-otp` - Yêu cầu OTP
- `POST /api/auth/verify-otp` - Xác thực OTP
- `POST /api/auth/set-password` - Đặt mật khẩu
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Quên mật khẩu

#### 3.3.5.2. Drugs Management
- `GET /api/drugs` - Lấy tất cả thuốc
- `GET /api/drugs/{drug_id}` - Lấy chi tiết thuốc
- `POST /api/drugs` - Thêm thuốc mới
- `PUT /api/drugs/{drug_id}` - Cập nhật thuốc
- `DELETE /api/drugs/{drug_id}` - Xóa thuốc (soft delete)
- `GET /api/drugs/search?q={query}` - Tìm kiếm thuốc
- `GET /api/drugs/owner/{owner_address}` - Lấy thuốc theo owner

#### 3.3.5.3. Transactions
- `POST /api/purchase` - Lưu giao dịch mua bán
- `GET /api/revenue?month={month}&year={year}` - Thống kê doanh thu

### 3.3.6. Sơ đồ luồng dữ liệu (Data Flow)

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Request (HTTP)
       ▼
┌─────────────┐
│  Frontend   │
│  (React)     │
└──────┬──────┘
       │
       │ 2. API Call
       ▼
┌─────────────┐
│   Backend   │
│  (FastAPI)  │
└──────┬──────┘
       │
       ├─→ 3a. Query MongoDB
       │   └─→ Return data
       │
       └─→ 3b. Call Smart Contract
           │
           ├─→ Web3 Provider (Infura)
           │
           └─→ Ethereum Network
               │
               └─→ Smart Contract
                   │
                   └─→ Update State
```

### 3.3.7. Xử lý lỗi và ngoại lệ

#### 3.3.7.1. Lỗi Blockchain
- **Network Error**: Retry với exponential backoff
- **Transaction Failed**: Hiển thị thông báo lỗi cụ thể
- **Insufficient Gas**: Hướng dẫn user tăng gas limit

#### 3.3.7.2. Lỗi Backend
- **401 Unauthorized**: Token hết hạn hoặc không hợp lệ
- **404 Not Found**: Resource không tồn tại
- **500 Internal Server Error**: Lỗi server, log và thông báo user

#### 3.3.7.3. Lỗi Frontend
- **Network Error**: Hiển thị "Không thể kết nối server"
- **Validation Error**: Hiển thị lỗi cụ thể cho từng field

---

## TÓM TẮT CHƯƠNG 3

Chương 3 đã trình bày:
1. **Phân tích yêu cầu**: Xác định các yêu cầu chức năng và phi chức năng của hệ thống
2. **Sơ đồ hệ thống**: Mô tả kiến trúc tổng quan, các thành phần chính và luồng xử lý
3. **Thiết kế dữ liệu**: Cấu trúc dữ liệu trên Blockchain và MongoDB, các hàm chính, API endpoints và luồng xử lý chi tiết

Hệ thống được thiết kế với kiến trúc 3 tầng: Frontend (React), Backend (FastAPI), và Blockchain (Ethereum Smart Contract), đảm bảo tính minh bạch, bảo mật và không thể thay đổi dữ liệu.




