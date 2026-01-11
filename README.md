# Project Management System

## Proje Özeti

Bu proje, bir organizasyon içerisinde yer alan kullanıcıların projeler ve görevler üzerinden rol bazlı olarak işlem yapabilmesini sağlayan bir Proje ve Görev Yönetim Sistemidir. Sistem, kullanıcıların projelere atanmasını, projeler altında görevlerin oluşturulmasını, bu görevlerin durum ve önceliklerine göre takip edilmesini ve kullanıcı yetkilerine göre yönetilmesini sağlar.

## Teknolojiler

### Backend
- **ASP.NET Core 8.0 Web API** - RESTful API mimarisi
- **Entity Framework Core 8.0** - ORM (Object-Relational Mapping)
- **SQL Server** - Veritabanı
- **JWT (JSON Web Token)** - Token bazlı kimlik doğrulama
- **BCrypt.Net** - Şifre hash'leme
- **C#** - Programlama dili
- **Swagger/OpenAPI** - API dokümantasyonu

### Frontend
- **ASP.NET Core MVC 8.0** - Web framework
- **Bootstrap 5.3.0** - CSS framework
- **Bootstrap Icons** - İkon kütüphanesi
- **JavaScript (ES6+)** - Client-side scripting
- **HTML5/CSS3** - Markup ve styling
- **jQuery** - DOM manipülasyonu

## Proje Yapısı

```
ProjectManagementSystem/
├── ProjectManagementSystem/          # API Projesi
│   ├── Controllers/                   # API Controllers
│   │   ├── AuthController.cs         # Authentication endpoints
│   │   ├── UsersController.cs        # User management (Admin only)
│   │   ├── ProjectsController.cs     # Project management
│   │   ├── TasksController.cs        # Task management
│   │   ├── DashboardController.cs   # Dashboard statistics
│   │   └── SmtpSettingsController.cs # SMTP settings management (Admin only)
│   ├── Services/                      # Business Logic
│   │   ├── Auth/                      # Authentication service
│   │   ├── UserService.cs             # User operations
│   │   ├── ProjectService.cs          # Project operations
│   │   ├── TaskService.cs             # Task operations
│   │   ├── DashboardService.cs       # Dashboard statistics
│   │   ├── EmailService.cs            # Email sending service
│   │   └── SmtpSettingsService.cs     # SMTP settings management
│   ├── Data/                          # DbContext
│   │   └── ApplicationDbContext.cs    # Entity Framework context
│   ├── Entities/                      # Domain Models
│   │   ├── User.cs                    # User entity
│   │   ├── Role.cs                    # Role entity
│   │   ├── Project.cs                 # Project entity
│   │   ├── TaskItem.cs                # Task entity
│   │   ├── ProjectUser.cs             # Project-User junction
│   │   ├── TaskUser.cs                # Task-User junction
│   │   └── SmtpSettings.cs            # SMTP settings entity
│   ├── DTOs/                          # Data Transfer Objects
│   │   ├── CreateUserDto.cs           # User creation DTO
│   │   ├── UpdateUserDto.cs           # User update DTO
│   │   ├── CreateProjectDto.cs        # Project creation DTO
│   │   ├── UpdateProjectDto.cs        # Project update DTO
│   │   ├── CreateTaskDto.cs           # Task creation DTO
│   │   ├── UpdateTaskDto.cs           # Task update DTO
│   │   ├── ForgotPasswordDto.cs       # Forgot password DTO
│   │   ├── ResetPasswordDto.cs        # Reset password DTO
│   │   ├── SmtpSettingsDto.cs         # SMTP settings DTO
│   │   └── ...                        # Diğer DTO'lar
│   ├── Enums/                         # Enum Types
│   │   ├── TaskItemStatus.cs          # Task status enum
│   │   └── TaskItemPriority.cs        # Task priority enum
│   ├── Auth/                          # JWT Authentication
│   │   ├── JwtSettings.cs             # JWT configuration
│   │   └── JwtTokenService.cs         # Token generation
│   └── Migrations/                    # Database Migrations
│
└── ProjectManagementSystemUI/        # MVC Projesi
    ├── Controllers/                   # MVC Controllers
    │   ├── AuthController.cs          # Login/Logout/ForgotPassword/ResetPassword
    │   ├── DashboardController.cs     # Dashboard page
    │   ├── UsersController.cs         # User management pages
    │   ├── ProjectsController.cs      # Project management pages
    │   ├── TasksController.cs         # Task management pages
    │   └── SettingsController.cs      # System settings (SMTP) - Admin only
    ├── Views/                         # Razor Views
    │   ├── Auth/                      # Login view
    │   ├── Dashboard/                 # Dashboard view
    │   ├── Users/                     # User management views
    │   ├── Projects/                  # Project management views
    │   ├── Tasks/                     # Task management views
    │   └── Shared/                    # Layout and partial views
    └── wwwroot/                       # Static Files
        ├── css/                       # Stylesheets
        ├── js/                        # JavaScript files
        └── lib/                       # Third-party libraries
```

## Kurulum ve Çalıştırma

### Gereksinimler
- .NET 8.0 SDK veya üzeri
- SQL Server (LocalDB, SQL Server Express veya SQL Server)
- Visual Studio 2022 veya Visual Studio Code
- Git (opsiyonel)

### Adımlar

1. **Repository'yi klonlayın:**
   ```bash
   git clone <repository-url>
   cd ProjectManagementSystem
   ```

2. **Veritabanı bağlantı string'ini güncelleyin:**
   - `ProjectManagementSystem/appsettings.json` dosyasındaki `ConnectionStrings:DefaultConnection` değerini kendi SQL Server bağlantınıza göre güncelleyin.
   - Örnek:
     ```json
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ProjectManagementDB;Trusted_Connection=True;TrustServerCertificate=True"
     }
     ```

3. **Veritabanı migration'larını çalıştırın:**
   ```bash
   cd ProjectManagementSystem
   dotnet ef database update
   ```
   
   **Not:** Eğer `dotnet ef` komutu bulunamazsa, önce Entity Framework Core tools'u yükleyin:
   ```bash
   dotnet tool install --global dotnet-ef
   ```

4. **İlk rolleri oluşturun (Opsiyonel):**
   - Veritabanı migration'ları çalıştırıldığında `Roles` tablosu oluşturulur
   - İlk kullanıcı kaydı sırasında "User" rolü otomatik atanır
   - Admin rolü için manuel olarak veritabanında rol oluşturmanız gerekebilir:
     ```sql
     INSERT INTO Roles (Name) VALUES ('Admin');
     INSERT INTO Roles (Name) VALUES ('User');
     ```

5. **Projeyi çalıştırın:**
   
   **Visual Studio ile:**
   - `ProjectManagementSystem.sln` dosyasını açın
   - Solution Properties'den "Multiple startup projects" seçin
   - Her iki projeyi (API ve MVC) başlatın
   - API genellikle `https://localhost:7241` portunda çalışır
   - MVC genellikle `https://localhost:7236` portunda çalışır
   
   **Komut satırı ile:**
   ```bash
   # Terminal 1 - API
   cd ProjectManagementSystem
   dotnet run
   
   # Terminal 2 - MVC
   cd ProjectManagementSystemUI
   dotnet run
   ```

6. **İlk kullanıcı oluşturma:**
   - Tarayıcıda `https://localhost:7236` adresine gidin
   - Login sayfasında "Kayıt Ol" linkine tıklayın (eğer varsa)
   - Veya API'de register endpoint'i ile ilk admin kullanıcısını oluşturun:
     ```bash
     POST https://localhost:7241/api/auth/register
     {
       "username": "admin",
       "email": "admin@example.com",
       "password": "admin123",
       "roleId": 1
     }
     ```

## Kullanıcı ve Rol Sistemi

### Roller

#### Admin
Sistem genelinde yönetim yetkilerine sahiptir:
- ✅ Tüm kullanıcıları görüntüleyebilir, oluşturabilir, güncelleyebilir ve silebilir
- ✅ Kullanıcılara rol atayabilir
- ✅ Tüm projeleri görüntüleyebilir, oluşturabilir, güncelleyebilir ve silebilir
- ✅ Tüm görevleri görüntüleyebilir, oluşturabilir, güncelleyebilir ve silebilir
- ✅ Proje detaylarını görüntüleyebilir
- ✅ Dashboard'da sistem geneli istatistikleri görebilir

#### User
Sınırlı yetkilere sahiptir:
- ✅ Sadece kendisine atanmış projeleri görüntüleyebilir
- ✅ Kendisine atanmış projelerde görev oluşturabilir (sadece kendisini atayabilir)
- ✅ Kendisine atanmış görevleri görüntüleyebilir
- ✅ Kendisine atanmış görevlerin durumlarını güncelleyebilir
- ✅ Proje detaylarını görüntüleyebilir (sadece atandığı projeler)
- ✅ Dashboard'da kendi istatistiklerini görebilir

### Rol Bazlı Yetkilendirme
- Backend'de `[Authorize(Roles = "Admin")]` attribute'u ile korunmuştur
- Service katmanında ek güvenlik kontrolleri yapılmaktadır
- Frontend'de rol bazlı UI elementleri gösterilir/gizlenir

## API Endpoints

### Authentication
- `POST /api/auth/login` - Kullanıcı girişi
  - Request: `{ "email": "string", "password": "string" }`
  - Response: `{ "token": "string", "role": "string", "userId": int, "username": "string" }`

- `POST /api/auth/register` - Kullanıcı kaydı
  - Request: `{ "username": "string", "email": "string", "password": "string", "roleId": int? }`
  - Response: `{ "token": "string", "role": "string", "userId": int, "username": "string" }`

- `POST /api/auth/logout` - Kullanıcı çıkışı (Authorize gerekli)
  - Response: `{ "message": "Logout successful." }`

- `POST /api/auth/forgot-password` - Şifre sıfırlama talebi
  - Request: `{ "email": "string" }`
  - Response: `{ "message": "string" }`
  - Email gönderir (kullanıcı yoksa bile güvenlik için başarı mesajı döner)

- `POST /api/auth/reset-password` - Şifre sıfırlama
  - Request: `{ "token": "string", "email": "string", "newPassword": "string" }`
  - Response: `{ "message": "string" }`
  - Token 24 saat geçerlidir, tek kullanımlıktır

### Users (Admin only)
- `GET /api/users` - Tüm kullanıcıları listele
- `GET /api/users/{id}` - Kullanıcı detayı
- `POST /api/users` - Yeni kullanıcı oluştur
  - Request: `{ "username": "string", "email": "string", "password": "string", "roleId": int }`
- `PUT /api/users/{id}` - Kullanıcı güncelle
  - Request: `{ "username": "string", "email": "string", "roleId": int }`
- `DELETE /api/users/{id}` - Kullanıcı sil
- `GET /api/users/roles` - Rolleri listele
- `POST /api/users/change-password` - Şifre değiştir (kendi şifresi)

### Projects
- `GET /api/projects` - Projeleri listele
  - Admin: Tüm projeler
  - User: Sadece atandığı projeler
- `GET /api/projects/{id}` - Proje detayı
- `POST /api/projects` - Yeni proje oluştur (Admin only)
  - Request: `{ "name": "string", "description": "string", "userIds": [int]? }`
- `PUT /api/projects/{id}` - Proje güncelle (Admin only)
  - Request: `{ "name": "string", "description": "string", "userIds": [int]? }`
- `DELETE /api/projects/{id}` - Proje sil (Admin only)

### Tasks
- `GET /api/tasks?projectId={id}` - Görevleri listele
  - Admin: Tüm görevler
  - User: Sadece atandığı görevler veya projesindeki görevler
- `GET /api/tasks/{id}` - Görev detayı
- `POST /api/tasks` - Yeni görev oluştur
  - Admin: Herhangi bir projede görev oluşturabilir
  - User: Sadece kendi projelerinde görev oluşturabilir (sadece kendisini atayabilir)
  - Request: `{ "title": "string", "description": "string", "status": int, "priority": int, "projectId": int, "assignedUserIds": [int]? }`
- `PUT /api/tasks/{id}` - Görev güncelle
  - Admin: Tüm görevleri güncelleyebilir
  - User: Sadece kendi görevlerini güncelleyebilir
  - Request: `{ "title": "string", "description": "string", "status": int, "priority": int, "projectId": int, "assignedUserIds": [int]? }`
- `DELETE /api/tasks/{id}` - Görev sil
  - Admin: Tüm görevleri silebilir
  - User: Sadece kendi görevlerini silebilir

### Dashboard
- `GET /api/dashboard/stats` - Dashboard istatistikleri
  - Admin: Sistem geneli istatistikler
  - User: Kendi verilerine ait istatistikler
  - Response: `{ "totalProjects": int, "totalTasks": int, "completedTasks": int, "inProgressTasks": int, "todoTasks": int }`

### SMTP Settings (Admin only)
- `GET /api/smtpsettings` - SMTP ayarlarını getir
- `POST /api/smtpsettings` - SMTP ayarlarını kaydet/güncelle
  - Request: `{ "host": "string", "port": int, "username": "string", "password": "string", "enableSsl": bool, "fromEmail": "string", "fromName": "string", "isActive": bool }`
- `POST /api/smtpsettings/test` - SMTP bağlantısını test et

## Veritabanı Yapısı

### Entity İlişkileri
- **User** - **Role**: Many-to-One (Bir kullanıcının bir rolü vardır)
- **Project** - **User**: Many-to-Many (Bir projede birden fazla kullanıcı, bir kullanıcı birden fazla projede)
  - Junction Table: `ProjectUsers`
- **TaskItem** - **Project**: Many-to-One (Bir görev bir projeye aittir)
- **TaskItem** - **User**: Many-to-Many (Bir göreve birden fazla kullanıcı atanabilir)
  - Junction Table: `TaskUsers`

### Tablolar

#### Roles
- `Id` (int, PK)
- `Name` (string) - "Admin", "User"

#### Users
- `Id` (int, PK)
- `Username` (string)
- `Email` (string)
- `PasswordHash` (string) - BCrypt hash
- `RoleId` (int, FK -> Roles)
- `CreatedAt` (DateTime)
- `PasswordResetToken` (string, nullable) - Şifre sıfırlama token'ı
- `PasswordResetTokenExpiry` (DateTime, nullable) - Token geçerlilik süresi

#### Projects
- `Id` (int, PK)
- `Name` (string)
- `Description` (string)
- `CreatedDate` (DateTime)

#### ProjectUsers (Junction Table)
- `ProjectId` (int, FK -> Projects)
- `UserId` (int, FK -> Users)
- Composite Primary Key: (ProjectId, UserId)

#### TaskItems
- `Id` (int, PK)
- `Title` (string)
- `Description` (string)
- `Status` (int) - 0: Todo, 1: InProgress, 2: Done
- `Priority` (int) - 0: Low, 1: Medium, 2: High
- `ProjectId` (int, FK -> Projects)
- `CreatedDate` (DateTime)

#### TaskUsers (Junction Table)
- `TaskId` (int, FK -> TaskItems)
- `UserId` (int, FK -> Users)
- Composite Primary Key: (TaskId, UserId)

#### SmtpSettings
- `Id` (int, PK)
- `Host` (string) - SMTP sunucu adresi
- `Port` (int) - SMTP port numarası
- `Username` (string) - SMTP kullanıcı adı
- `Password` (string) - SMTP şifresi (veritabanında saklanır)
- `EnableSsl` (bool) - SSL/TLS kullanımı
- `FromEmail` (string) - Gönderen e-posta adresi
- `FromName` (string) - Gönderen adı
- `IsActive` (bool) - Aktif/pasif durumu
- `CreatedAt` (DateTime)
- `UpdatedAt` (DateTime, nullable)

## Güvenlik

### Authentication
- JWT token bazlı kimlik doğrulama
- Token süresi: 24 saat (appsettings.json'da yapılandırılabilir)
- Şifreler BCrypt ile hash'lenir

### Authorization
- Rol bazlı yetkilendirme (Role-based Authorization)
- API endpoint'leri `[Authorize]` attribute ile korunmuştur
- Admin-only endpoint'ler `[Authorize(Roles = "Admin")]` ile korunmuştur
- Service katmanında ek güvenlik kontrolleri yapılmaktadır

### CORS
- Development ortamında localhost portları için CORS policy yapılandırılmıştır
- Production için özel origin'ler belirtilmelidir

### Validation
- DTO'larda Data Annotations ile input validation
- Controller seviyesinde `ModelState.IsValid` kontrolü
- Service katmanında business logic validasyonları
- Frontend'de client-side validasyonlar

## Frontend Özellikleri

### Sayfalar
- **Login Sayfası** (`/Auth/Login`): Email ve şifre ile giriş, "Şifremi Unuttum" linki
- **Şifremi Unuttum** (`/Auth/ForgotPassword`): Email ile şifre sıfırlama talebi
- **Şifre Sıfırla** (`/Auth/ResetPassword`): Token ile yeni şifre belirleme
- **Dashboard** (`/Dashboard`): Kullanıcı rolüne göre istatistikler
- **Projeler Sayfası** (`/Projects`): Proje listesi, ekleme, düzenleme, silme, detay görüntüleme
- **Görevler Sayfası** (`/Tasks`): Kullanıcının görevleri, durum güncelleme
- **Kullanıcılar Sayfası** (`/Users`): Admin için kullanıcı yönetimi
- **Sistem Ayarları** (`/Settings/Smtp`): Admin için SMTP ayarları yönetimi

### Özellikler
- Responsive tasarım (mobil uyumlu)
- Loading states ve error handling
- Form validasyonları
- Modal'lar (silme onayı, görev düzenleme)
- Rol bazlı UI elementleri (Admin/User)
- Token yönetimi (localStorage)
- Otomatik yönlendirme (yetkisiz erişimlerde)
- **Email Bildirimleri**: Görev atamalarında otomatik email gönderimi
- **Şifre Sıfırlama**: Email ile şifre sıfırlama özelliği
- **SMTP Yönetimi**: Admin panelinden SMTP ayarları yönetimi (veritabanında saklanır)

## Varsayımlar

1. Kullanıcılar email adresi ile giriş yapar
2. Şifre minimum 6 karakter olmalıdır
3. JWT token süresi varsayılan olarak 24 saattir (appsettings.json'da yapılandırılabilir)
4. User rolündeki kullanıcılar sadece kendilerine atanmış projelerde görev oluşturabilir
5. User rolündeki kullanıcılar görev oluştururken sadece kendisini atayabilir
6. User rolündeki kullanıcılar sadece kendilerine atanmış görevleri güncelleyebilir/silebilir
7. Proje silindiğinde, projeye ait görevler de silinir (Cascade Delete)
8. Görev silindiğinde, göreve atanan kullanıcı ilişkileri de silinir (Cascade Delete)

## Email Sistemi

### SMTP Yapılandırması
- SMTP ayarları veritabanında saklanır (güvenlik için)
- Admin kullanıcılar "Sistem Ayarları" sayfasından SMTP ayarlarını yönetebilir
- Görev atamalarında otomatik email gönderilir
- Şifre sıfırlama taleplerinde email gönderilir

### Email Şablonları
- **Görev Atama Emaili**: HTML formatında, görev detayları ile
- **Şifre Sıfırlama Emaili**: HTML formatında, güvenli reset linki ile

### Güvenlik
- SMTP şifreleri veritabanında saklanır (production'da şifreleme önerilir)
- Şifre sıfırlama token'ları 24 saat geçerlidir
- Token'lar tek kullanımlıktır (kullanıldıktan sonra silinir)
- Email enumeration koruması (kullanıcı yoksa bile başarı mesajı)

## Eksik Kalan veya Geliştirilebilecek Noktalar

Eksik özellik bulunmamaktadır ancak ileride eklenebilecek bazı geliştirmeler şunlardır:
1. **Dosya Yükleme**: Görevlere dosya ekleme özelliği
2. **Yorum Sistemi**: Görevlere yorum ekleme özelliği
3. **Zaman Takibi**: Görevler için zaman takibi 
4. **Bulk İşlemler**: Toplu işlemler (toplu silme, güncelleme)


## API Dokümantasyonu

API dokümantasyonu Swagger UI üzerinden erişilebilir:
- API projesi çalıştığında: `https://localhost:7241/swagger`

## Hata Ayıklama

### Yaygın Sorunlar

1. **Veritabanı bağlantı hatası:**
   - `appsettings.json` dosyasındaki connection string'i kontrol edin
   - SQL Server'ın çalıştığından emin olun

2. **Migration hatası:**
   - `dotnet ef database update` komutunu çalıştırdığınızdan emin olun
   - Veritabanının mevcut olmadığından emin olun (ilk kurulum için)

3. **CORS hatası:**
   - API ve MVC projelerinin farklı portlarda çalıştığından emin olun
   - `Program.cs` dosyasındaki CORS ayarlarını kontrol edin

4. **JWT token hatası:**
   - `appsettings.json` dosyasındaki JWT ayarlarını kontrol edin
   - Token'ın süresinin dolmadığından emin olun

5. **Email gönderme hatası:**
   - SMTP ayarlarının "Sistem Ayarları" sayfasından yapılandırıldığından emin olun
   - Gmail kullanıyorsanız "Uygulama Şifresi" kullanın
   - SMTP port ve SSL ayarlarını kontrol edin
   - `appsettings.json` dosyasındaki `MvcSettings:BaseUrl` ayarını kontrol edin

6. **Şifre sıfırlama hatası:**
   - Migration'ların çalıştırıldığından emin olun (`PasswordResetToken` alanları)
   - Email'in spam klasörüne düşmüş olabileceğini kontrol edin
   - Token'ın süresinin dolmadığından emin olun (24 saat)

## İletişim

Sorularınız için omerfarukgunduz034@gmail.com adresinden ulaşabilirsiniz.


