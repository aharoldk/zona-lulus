# 🎯 Zona Lulus - TNI/POLRI Tryout System

A comprehensive online tryout platform for TNI/POLRI and civil service entrance exam preparation, built with Laravel and React.

## 🚀 Features

### 📚 Complete Tryout System
- **Database-driven questions** - Real TNI preparation questions stored in database
- **Multiple categories** - Matematika, Bahasa Indonesia, Sejarah, Pengetahuan Umum
- **Timed examinations** - Real-time countdown timer with auto-submit
- **Progress tracking** - Live progress indicators and question navigation
- **Comprehensive scoring** - Accurate scoring with detailed analytics

### 📊 Advanced Analytics & Results
- **Dynamic category breakdown** - Performance analysis per subject
- **Personalized recommendations** - Study suggestions based on weak areas
- **Detailed statistics** - Correct/wrong/unanswered question counts
- **Performance levels** - Graded feedback (Luar Biasa, Sangat Baik, Baik, etc.)
- **Time tracking** - Detailed time usage analysis

### 📱 Mobile-Responsive Design
- **Responsive navigation** - Mobile hamburger menu with smooth animations
- **Touch-optimized interface** - Large touch targets for mobile devices
- **Adaptive layouts** - Grid systems that work on all screen sizes
- **Mobile-first approach** - Optimized for mobile user experience

### 🔐 Secure Authentication
- **Laravel Sanctum** - API token-based authentication
- **Protected routes** - Secure API endpoints
- **User management** - Registration, login, and profile management
- **Session handling** - Proper authentication state management

## 🛠️ Technology Stack

### Backend
- **Laravel 11** - PHP framework
- **PostgreSQL** - Primary database
- **Laravel Sanctum** - API authentication
- **Eloquent ORM** - Database interactions

### Frontend
- **React 18** - Modern UI library
- **Ant Design** - Professional UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing

## 📋 Prerequisites

- PHP 8.2 or higher
- Node.js 18 or higher
- PostgreSQL 13 or higher
- Composer
- npm or yarn

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone <repository-url>
cd zona-lulus
composer install
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
php artisan key:generate
```

Configure your `.env` file:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=zona_lulus
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 3. Database Setup
```bash
php artisan migrate
php artisan db:seed
```

### 4. Start Development Servers
```bash
# Terminal 1 - Laravel API
php artisan serve

# Terminal 2 - React Frontend
npm run dev
```

Visit `http://localhost:8000` to access the application.

## 📝 Database Schema

### Core Tables
- **users** - User authentication and profiles
- **tests** - Tryout test configurations
- **questions** - Question bank with categories
- **test_attempts** - User attempt tracking
- **personal_access_tokens** - Sanctum authentication tokens

### Sample Data
The seeder includes:
- **20 real TNI questions** across 4 categories
- **Test user accounts** for development
- **Complete test configuration** with proper timing

## 🎮 Usage Guide

### For Students
1. **Register/Login** - Create account or login
2. **Browse Tryouts** - View available TNI/POLRI tests
3. **Start Tryout** - Click "Mulai Tryout" to begin
4. **Take Exam** - Answer questions with real-time timer
5. **View Results** - Get detailed performance analysis
6. **Study Recommendations** - Follow personalized study suggestions

### For Administrators
1. **Question Management** - Add/edit questions via database
2. **Test Configuration** - Modify test settings and timing
3. **User Analytics** - Track user performance and progress
4. **Content Management** - Manage test categories and difficulty

## 🔧 API Endpoints

### Authentication
```
POST /api/register    - User registration
POST /api/login      - User login
POST /api/logout     - User logout
GET  /api/me         - Get current user
```

### Questions & Tests
```
GET /api/questions/{testId} - Fetch questions for test
```

All API endpoints require authentication except registration and login.

## 🎨 UI Components

### Responsive Components
- **Navbar** - Mobile hamburger menu with authentication state
- **Dashboard** - Comprehensive admin panel with sidebar
- **Tryout** - Full-featured exam interface with timer
- **TryoutResult** - Detailed analytics and recommendations

### Design System
- **Ant Design** - Professional component library
- **Tailwind CSS** - Responsive utility classes
- **Custom styling** - TNI/POLRI themed colors and branding

## 📊 Performance Analytics

### Category Breakdown
- Real-time calculation based on user answers
- Subject-wise performance analysis
- Accuracy rates and completion percentages
- Color-coded progress indicators

### Study Recommendations
- **Matematika** - Focus on calculations, algebra, geometry
- **Bahasa Indonesia** - Grammar, vocabulary, proper Indonesian
- **Sejarah** - Indonesian history and national heroes
- **Pengetahuan Umum** - Current affairs and general knowledge

## 🚀 Deployment

### Production Setup
1. **Server Requirements** - PHP 8.2, PostgreSQL, Nginx/Apache
2. **Environment Configuration** - Production environment variables
3. **Asset Compilation** - `npm run build` for optimized assets
4. **Database Migration** - Run migrations on production database
5. **Queue Workers** - Setup background job processing

### Security Considerations
- Enable HTTPS in production
- Configure proper CORS settings
- Set secure session configurations
- Use environment variables for sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Zona Lulus Development Team**
- Full-stack development with Laravel & React
- TNI/POLRI exam preparation expertise
- Mobile-responsive design specialists

## 📞 Support

For support and questions:
- **Email**: support@zonalulus.com
- **Documentation**: Available in `/docs` directory
- **Issues**: Use GitHub Issues for bug reports

---

**Built with ❤️ for Indonesian students preparing for TNI/POLRI and civil service examinations.**
