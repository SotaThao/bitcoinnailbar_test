# BITCOIN NAIL BAR - MANAGER USER GUIDE
## Huong Dan Su Dung He Thong Quan Ly

> **Phien ban:** 1.0  
> **Cap nhat:** 09/03/2026  
> **Doi tuong:** Manager / Quan ly tiem

---

## MUC LUC

1. [Dang Nhap He Thong](#1-dang-nhap-he-thong)
2. [Tong Quan Giao Dien Admin](#2-tong-quan-giao-dien-admin)
3. [Dashboard - Bang Dieu Khien](#3-dashboard---bang-dieu-khien)
4. [Appointments - Quan Ly Lich Hen](#4-appointments---quan-ly-lich-hen)
5. [Services - Quan Ly Dich Vu](#5-services---quan-ly-dich-vu)
6. [Loyalty Programs - Chuong Trinh Than Thanh](#6-loyalty-programs---chuong-trinh-than-thanh)
7. [Staff - Quan Ly Nhan Vien](#7-staff---quan-ly-nhan-vien)
8. [Payroll - Bang Luong](#8-payroll---bang-luong)
9. [Reviews - Danh Gia Khach Hang](#9-reviews---danh-gia-khach-hang)
10. [Gallery - Thu Vien Hinh Anh](#10-gallery---thu-vien-hinh-anh)
11. [Check-in Kiosk - May Check-in](#11-check-in-kiosk---may-check-in)
12. [Cac Tinh Nang Danh Cho Owner](#12-cac-tinh-nang-danh-cho-owner)
13. [Cau Hoi Thuong Gap (FAQ)](#13-cau-hoi-thuong-gap-faq)

---

## 1. DANG NHAP HE THONG

### Truy cap trang dang nhap
- Mo trinh duyet va truy cap: `https://[domain]/admin/login`
- Hoac tu trang chu, cuon xuong footer va nhan vao link **Admin**

### Buoc dang nhap
1. Nhap **Email** da duoc cap boi Owner
2. Nhap **Password**
3. Nhan nut **Dang nhap**
4. He thong se chuyen huong ve trang Dashboard

### Luu y
- Neu chua co tai khoan, lien he Owner de duoc tao tai khoan
- Moi phien dang nhap se duoc luu tren trinh duyet. Neu doi may, ban can dang nhap lai
- Nut **Dang xuat** nam o goc duoi ben trai cua sidebar

---

## 2. TONG QUAN GIAO DIEN ADMIN

### Cau truc man hinh
He thong admin gom 2 phan chinh:

```
+------------------+----------------------------------------+
|                  |                                        |
|   SIDEBAR        |         NOI DUNG CHINH                 |
|   (Thanh ben)    |         (Main Content)                 |
|                  |                                        |
|  - Dashboard     |                                        |
|  - Appointments  |                                        |
|  - Services      |                                        |
|  - Loyalty       |                                        |
|  - Staff         |                                        |
|  - Payroll       |                                        |
|  - Reviews       |                                        |
|  - Gallery       |                                        |
|  - Analytics     |                                        |
|  --------------- |                                        |
|  - Check-in      |                                        |
|  --------------- |                                        |
|  OWNER ONLY:     |                                        |
|  - Customers     |                                        |
|  - Roles         |                                        |
|  - VLinkPay      |                                        |
|  - Settings      |                                        |
+------------------+----------------------------------------+
```

### Thanh tren cung (Header)
- **Tieu de trang** hien tai (vd: Dashboard, Appointments...)
- **Chuong thong bao** (Notification Bell) - hien thi so thong bao moi
- **Avatar** nguoi dung hien tai

### Sidebar (Thanh dieu huong ben trai)
- Logo **Bitcoin Nail Bar** o tren cung
- Danh sach cac trang admin (nhan de chuyen trang)
- Trang dang active se duoc to sang mau cam
- Tren mobile: sidebar an di, truy cap qua menu hamburger

---

## 3. DASHBOARD - BANG DIEU KHIEN

**Duong dan:** `/admin/dashboard`

### Mo ta
Day la trang tong quan khi ban dang nhap vao he thong. No hien thi cac so lieu quan trong cua tiem trong ngay.

### Cac the thong ke (Stat Cards)
- **Today's Revenue** - Doanh thu hom nay
- **Appointments** - So lich hen hom nay
- **Active Staff** - So nhan vien dang lam viec
- **Avg Wait Time** - Thoi gian cho trung binh

### Danh sach nhan vien
- Hien thi trang thai cua tung nhan vien (Available / Busy)
- Ho tro **tim kiem** nhan vien theo ten
- Ho tro **loc** theo trang thai (All / Available / Busy)
- Ho tro **sap xep** theo ten hoac trang thai
- Phan trang khi co nhieu nhan vien

### Thao tac
- Nhan nut **Refresh** (bieu tuong xoay tron) de cap nhat du lieu moi nhat
- Nhan nut **Export** de tai du lieu xuong

---

## 4. APPOINTMENTS - QUAN LY LICH HEN

**Duong dan:** `/admin/appointments`

### Mo ta
Quan ly tat ca lich hen cua khach hang - tu pending, confirmed, den completed.

### Cac thanh phan chinh

#### The thong ke
- Tong so lich hen trong ngay
- So lich dang cho (Pending)
- So lich da xac nhan (Confirmed)
- So lich hoan thanh (Completed)

#### Bo loc
- **Loc theo trang thai:** All / Pending / Confirmed / In Progress / Completed / Cancelled
- **Loc theo ngay:** Chon ngay cu the tren lich (Calendar picker)

#### The lich hen (Appointment Card)
Moi lich hen hien thi:
- Ten khach hang
- Dich vu da chon va gia tien
- Ngay gio hen
- Nhan vien phu trach (neu co)
- Trang thai hien tai

### Cac thao tac tren lich hen
1. **Xac nhan lich hen** - Chuyen trang thai tu Pending sang Confirmed
2. **Bat dau lam** - Chuyen sang In Progress
3. **Hoan thanh** - Chuyen sang Completed
4. **Huy lich** - Chuyen sang Cancelled

### Quy trinh xu ly lich hen tieu bieu
```
Pending --> Confirmed --> In Progress --> Completed
                    \--> Cancelled
```

---

## 5. SERVICES - QUAN LY DICH VU

**Duong dan:** `/admin/services`

### Mo ta
Quan ly toan bo menu dich vu cua tiem, bao gom them/sua/xoa dich vu va quan ly danh muc.

### 2 Tab chinh

#### Tab 1: Services List (Danh sach dich vu)
- **Sidebar danh muc** ben trai - chon danh muc de loc dich vu
- **Bang dich vu** ben phai - hien thi cac dich vu thuoc danh muc da chon
- **Thanh tim kiem** de tim dich vu nhanh

#### Tab 2: Menu Upload (Tai anh menu)
- Tai len hinh anh menu (dang in) de hien thi tren trang Menu cong khai
- Ho tro keo tha de sap xep thu tu

### Quan ly danh muc (Category)
1. Nhan nut **"+"** ben canh tieu de "Categories" de tao danh muc moi
2. Nhap **ten danh muc** (VD: Manicure, Pedicure, Waxing...)
3. Chon **icon** dai dien
4. Nhan **Save** de luu

### Them dich vu moi
1. Nhan nut **"+ Add Service"** o goc tren ben phai
2. Dien thong tin:
   - **Service Name** - Ten dich vu (bat buoc)
   - **Category** - Chon danh muc (bat buoc)
   - **Description** - Mo ta dich vu
   - **Price** - Gia (VD: 35 hoac 25-45 cho gia tu...den)
   - **Duration** - Thoi gian thuc hien (phut)
3. Nhan **Save** de luu

### Chinh sua / Xoa dich vu
- Nhan **bieu tuong Edit** (cay but) tren dong dich vu de chinh sua
- Nhan **bieu tuong Delete** (thung rac) de xoa dich vu
- Xac nhan truoc khi xoa

---

## 6. LOYALTY PROGRAMS - CHUONG TRINH THAN THANH

**Duong dan:** `/admin/membership`

### Mo ta
Quan ly chuong trinh Membership va cac khuyen mai (Promotions) cua tiem.

### Tab 1: Memberships (Hang thanh vien)

#### Chuc nang
- Xem danh sach cac hang membership (VD: Silver, Gold, Platinum, Diamond)
- **Chinh sua** thong tin tung hang: ten, gia, quyen loi (benefits)
- **Keo tha** (Drag & Drop) de thay doi thu tu hien thi
- **Bat/Tat** tung hang membership

#### Cach chinh sua 1 hang membership
1. Nhan vao hang can sua de mo rong
2. Cap nhat cac truong: ten, gia, mo ta, danh sach quyen loi
3. Nhan **Save Changes** o cuoi trang

### Tab 2: Promotions & Events (Khuyen mai & Su kien)

#### Chuc nang
- Quan ly cac chuong trinh khuyen mai hien thi tren trang chu
- He thong tu dong dich sang Tieng Viet va Tieng Anh

#### Cac loai khuyen mai co san
- **Pay With Crypto** - Giam gia khi thanh toan bang crypto
- **Golden Hour** - Gio vang giam gia theo khung gio
- **VIP Royalty** - Dac quyen cho thanh vien VIP

#### Them khuyen mai moi
1. Nhan nut **"Add New Promotion"** (mau cam, goc tren phai)
2. Dien thong tin:
   - **Badge Text** - Nhan hien thi (VD: "OPENING", "HOT DEAL")
   - **Title** - Tieu de chinh
   - **Subtitle** - Phu de (tuy chon)
   - **Discount/Offer** - Thong tin giam gia (VD: "GIAM 10%", "TANG $50")
   - **Description** - Mo ta chi tiet (ho tro soan thao WYSIWYG)
   - **Button Text** - Noi dung nut CTA (VD: "DANG KY NGAY")
   - **Button Link** - Duong dan khi nhan nut
   - **Background Image** - Hinh nen (tai len)
   - **Icon/Logo** - Logo nho (tuy chon)
3. Nhan **Save Changes** - he thong se tu dong dich sang 2 ngon ngu

#### Quan ly khuyen mai
- **Mat** (Eye icon) - Bat/Tat hien thi khuyen mai tren trang cong khai
- **Ngoi sao** (Star icon) - Danh dau la "Featured" (hien thi trong popup khi vao trang chu)
- **Keo tha** (Grip icon) - Thay doi thu tu
- **X** - Xoa khuyen mai

---

## 7. STAFF - QUAN LY NHAN VIEN

**Duong dan:** `/admin/staff`

### Mo ta
Quan ly thong tin nhan vien, ky nang, lich lam viec.

### Danh sach nhan vien
- Hien thi duoi dang **card** voi anh dai dien, ten, vai tro
- Ho tro **tim kiem** theo ten
- Ho tro **phan trang**

### Them nhan vien moi
1. Nhan nut **"+ Add Staff"**
2. Dien thong tin:
   - **Ho ten** (bat buoc)
   - **So dien thoai**
   - **Email**
   - **Vai tro** (Technician / Manager / Receptionist)
   - **Cac ky nang** (VD: Manicure, Pedicure, Acrylic...)
3. Nhan **Save**

### Chinh sua nhan vien
1. Nhan vao **menu 3 cham** (More) tren card nhan vien
2. Chon **Edit** de chinh sua thong tin
3. Chon **Delete** de xoa nhan vien (can xac nhan)

### Chi tiet nhan vien (Staff Detail)
- Nhan vao ten nhan vien de xem chi tiet
- Hien thi: thong tin ca nhan, ky nang, lich su lam viec, hieu suat

---

## 8. PAYROLL - BANG LUONG

**Duong dan:** `/admin/payroll`

### Mo ta
Tinh toan va quan ly bang luong cho nhan vien.

### Cac tinh nang
- **Chon ky luong** (Pay Period): chon tuan can tinh luong
- **Bieu do doanh thu** (Revenue Chart): hien thi doanh thu theo tuan duoi dang bieu do cot
- **Bang luong chi tiet**: hien thi tung nhan vien voi:
  - So lich hen da hoan thanh
  - Tong doanh thu tao ra
  - Hoa hong (Commission)
  - Tip
  - Tong luong

### Cach tinh luong
1. Chon **ky luong** (tuan) tu dropdown
2. He thong tu dong tinh toan dua tren cac lich hen da hoan thanh
3. Xem ket qua tren bang va bieu do

---

## 9. REVIEWS - DANH GIA KHACH HANG

**Duong dan:** `/admin/reviews`

### Mo ta
Xem va quan ly danh gia tu khach hang.

### Cac tab
- **Pending** - Danh gia dang cho duyet
- **Approved** - Danh gia da duyet (hien thi tren trang cong khai)
- **Rejected** - Danh gia bi tu choi

### Thong tin moi danh gia
- Ten khach hang
- Dich vu da su dung
- So sao (1-5)
- Noi dung binh luan
- Thoi gian gui

### Thao tac
- **Approve** - Duyet danh gia (hien thi tren website)
- **Reject** - Tu choi danh gia

---

## 10. GALLERY - THU VIEN HINH ANH

**Duong dan:** `/admin/gallery`

### Mo ta
Quan ly thu vien hinh anh hien thi tren trang Gallery cong khai cua website.

### Cac tinh nang chinh

#### Tai len hinh anh
1. Nhan nut **"Upload"** hoac keo tha file vao vung tai len
2. Chon hinh anh tu may tinh (ho tro PNG, JPG, WebP)
3. He thong tu dong tai len Cloudinary va hien thi

#### Quan ly hinh anh
- **Keo tha** de sap xep thu tu hien thi (Drag & Drop)
- **Danh muc** (Category) - gan hinh anh vao danh muc (VD: Nails, Interior, Events)
- **Logo Badge** - them logo watermark tren hinh (tuy chon)
- **Featured** (Ngoi sao) - danh dau hinh noi bat
- **Xoa** (Thung rac) - xoa hinh anh vinh vien

#### Loc hinh anh
- Loc theo **danh muc**
- Ho tro **phan trang** khi co nhieu hinh

#### Xem truoc
- Nhan vao hinh anh de xem phong to (Lightbox)

---

## 11. CHECK-IN KIOSK - MAY CHECK-IN

**Duong dan:** `/admin/check-in`

### Mo ta
Man hinh danh rieng cho may tinh/iPad dat tai quay le tan de khach hang tu check-in.

### Cach su dung
1. Mo trang `/admin/check-in` tren may tinh/iPad tai quay
2. Khach hang tu nhap thong tin hoac scan ma de check-in
3. He thong tu dong ghi nhan va gui thong bao den nhan vien

### Luu y
- Nen dat che do **full screen** tren trinh duyet (nhan F11)
- Nen dung **iPad** hoac **tablet** de trai nghiem tot nhat

---

## 12. CAC TINH NANG DANH CHO OWNER

> **Luu y:** Cac tinh nang nay chi hien thi khi dang nhap bang tai khoan Owner. Manager se khong thay cac muc nay trong sidebar.

### 12.1 Customers Data (`/admin/redeem-codes`)

#### Tab: Customer Management
- Xem danh sach tat ca khach hang da dang ky
- Tim kiem khach hang theo ten, email, so dien thoai
- Xem chi tiet: thong tin ca nhan, hang membership, lich su giao dich

#### Tab: Redeem Codes
- Tao va quan ly ma redeem (ma uu dai)
- Xem trang thai cac ma: Active / Used / Expired
- Tao ma moi voi gia tri va han su dung tuy chinh

### 12.2 Role & Permissions (`/admin/role-permissions`)

#### Tab: Roles (Vai tro)
- Quan ly danh sach nguoi dung he thong (Users)
- Tao tai khoan moi cho nhan vien
- Gan vai tro: Owner / Manager / Staff
- Vo hieu hoa / Kich hoat tai khoan

#### Tab: Permissions (Quyen han)
- Cau hinh quyen han cho tung vai tro
- Xac dinh trang nao co the truy cap

### 12.3 VLinkPay Settings (`/admin/vlinkpay-settings`)
- Cau hinh ket noi voi cong thanh toan VLinkPay
- Thiet lap Encryption Key, Auth Token
- Cau hinh URL redirect sau thanh toan

### 12.4 System Settings (`/admin/system-settings`)

#### Social Media Links
- Cap nhat lien ket Facebook, Instagram, TikTok
- Cac lien ket nay hien thi tren footer cua website

#### Homepage Menu Mode
- **Services List** - Hien thi danh sach dich vu dong (tu database)
- **Menu Images** - Hien thi hinh anh menu (tai len)

#### Chatbot Settings
- Cau hinh avatar cho chatbot ho tro

---

## 13. CAU HOI THUONG GAP (FAQ)

### Q: Lam sao de dang nhap?
**A:** Truy cap `/admin/login` va nhap email + password da duoc Owner cap.

### Q: Toi khong thay muc "Customers Data" hoac "Settings" trong sidebar?
**A:** Cac muc nay chi danh cho tai khoan **Owner**. Neu ban la Manager, ban se khong co quyen truy cap cac trang nay.

### Q: Lam sao de them nhan vien moi?
**A:** Vao **Staff** > nhan **"+ Add Staff"** > dien thong tin > nhan **Save**.

### Q: Lam sao de tao khuyen mai moi?
**A:** Vao **Loyalty Programs** > chon tab **"Promotions & Events"** > nhan **"Add New Promotion"** > dien thong tin > nhan **Save Changes**. He thong se tu dong dich sang Tieng Viet va Tieng Anh.

### Q: Tai sao khi luu khuyen mai bi loi "Request timed out"?
**A:** Do he thong can goi AI de dich noi dung sang 2 ngon ngu, qua trinh nay co the mat 30-60 giay. Neu bi timeout, hay thu:
1. Luu it khuyen mai cung luc hon
2. Viet noi dung ngan gon hon
3. Thu lai sau vai phut

### Q: Lam sao de cap nhat hinh anh Gallery?
**A:** Vao **Gallery** > nhan **Upload** > chon hinh > gan danh muc > keo tha de sap xep thu tu > hinh anh tu dong hien thi tren website.

### Q: Lam sao de xem doanh thu?
**A:** Vao **Dashboard** de xem tong quan doanh thu hom nay. Vao **Payroll** de xem chi tiet doanh thu theo tuan va theo nhan vien.

### Q: He thong ho tro nhung ngon ngu nao?
**A:** Website cong khai ho tro **Tieng Viet** va **Tieng Anh**. Khach hang co the chuyen doi ngon ngu tren trang chu. Noi dung khuyen mai se duoc tu dong dich sang ca 2 ngon ngu.

### Q: Lam sao de dang xuat?
**A:** Nhan nut **Logout** (bieu tuong mui ten) o goc duoi ben trai cua sidebar.

---

## PHU LUC - DANH SACH CAC TRANG ADMIN

| Trang | Duong dan | Quyen truy cap |
|-------|-----------|----------------|
| Dashboard | `/admin/dashboard` | All roles |
| Appointments | `/admin/appointments` | All roles |
| Services | `/admin/services` | All roles |
| Loyalty Programs | `/admin/membership` | All roles |
| Staff | `/admin/staff` | All roles |
| Payroll | `/admin/payroll` | All roles |
| Reviews | `/admin/reviews` | All roles |
| Gallery | `/admin/gallery` | All roles |
| Analytics | `/admin/analytics` | All roles (Coming Soon) |
| Check-in Kiosk | `/admin/check-in` | All roles |
| Customers Data | `/admin/redeem-codes` | Owner only |
| Role & Permissions | `/admin/role-permissions` | Owner only |
| VLinkPay Settings | `/admin/vlinkpay-settings` | Owner only |
| System Settings | `/admin/system-settings` | Owner only |

---

> **Ho tro ky thuat:** Neu gap loi hoac can ho tro, lien he Owner hoac doi ngu ky thuat.
