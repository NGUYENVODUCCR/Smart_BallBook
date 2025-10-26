# Smart_Ballbook Project

## Cấu trúc dự án
Smart_Ballbook/
├── backend/        # API Node.js
├── frontend-web/   # Web app ReactJS
├── frontend-app/   # Mobile app React Native
└── notes/          # Tài liệu, hướng dẫn, API

-------------------------------------------------------------

## Thành viên nhóm
- Nguyễn Võ Đức – Backend
- Huỳnh Đức Hiếu – Frontend Web
- Đỗ Kỳ Hà – Frontend App
- ALL – Documentation

-------------------------------------------------------------

## Cách chạy nhanh
### Backend
```bash
cd backend
npm install
npm start

### Frontend Web
```bash
cd frontend-web
npm install
npm start

### Frontend App
```bash
cd frontend-app
npm install
npm start



-------------------------------------------------------------

## TÀI LIỆU GITHUB: Cách push code đúng chuẩn

# Thiết lập
git init

# Mỗi người clone repo:
git clone https://github.com/NGUYENVODUCCR/Smart_BallBook.git # Nếu chưa có gì cả (tải xuống cả repo)
 
git remote add origin https://github.com/NGUYENVODUCCR/Smart_BallBook.git # Nếu có rồi nhưng cần bổ sung thêm (chỉ kết nối repo)

# → Sau đó làm việc trong đúng thư mục - nhánh của mình, ví dụ:
### BACKEND
cd Smart_Ballbook/backend (1)

# Tạo branch riêng:
git checkout -b backend (2 đức)

git checkout backend (2 hiếu)
git pull origin backend
git checkout -b add-more-hieu (3 hiếu)

git checkout backend (2 hà)
git pull origin backend
git checkout -b add-more-ha (3 hà)

# Commit & push:
#-- chú ý 
git reset # xóa hết file đã add vào commit
git add <tên file> # Chỉ chọn những file chỉ định
#--
git add .  # Chọn tất cả file có thay đổi trong code
git commit -m "Thêm chức năng đăng nhập"
git commit -m "Thêm chức năng đăng ký"
git commit -m "Thêm chức năng upload avatar"
git push origin backend (3 đức)
git push origin add-more-hieu (4 hiếu)
git push origin add-more-ha (4 hà)





-------------------------------------------------------------
### Nếu tương tác với project Smart-BallBook chính

# Nếu chỉ commit file tùy chọn 
git reset
git add README.md
git commit -m "Thêm README.md"
git push origin <tên_nhánh>

# Tương tác trên project chính
git branch -M main
git push -u origin main






------------------------------------------------------------

# FRONTEND
cd Smart_Ballbook/frontend-web (Hiếu)
cd Smart_Ballbook/frontend-app (Hà) ....