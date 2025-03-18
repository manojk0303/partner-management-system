# Partner Management System

A comprehensive platform for managing brand partnerships, offers, and discounts. This system provides both admin-facing controls for partnership management and a public-facing interface for users to browse available partner offers.

## 🚀 Features

### Public Features
- Browse all partner brands with their active offers
- View detailed information about each partner
- Search and filter functionality for offers
- Responsive design for all devices

### Admin Features
- Secure authentication with NextAuth
- Complete CRUD operations for partner management
- Image upload capabilities using Firebase Storage
- Partner offer creation and management
- Admin registration with secure registration key

## 📸 Screenshots & Demo

```markdown
![Public Offers Page](./screenshots/Screenshot-2.png)
![Public Individual Offer Page](./screenshots/Screenshot-3.png)
![Register Page](./screenshots/Screenshot-4.png)
![Login Page](./screenshots/Screenshot-5.png)
![Admin Dashboard](./screenshots/Screenshot-6.png)
![Partner Brands Page](./screenshots/Screenshot-7.png)
![Partner Offers Page](./screenshots/Screenshot-8.png)
![Brand Creation Page](./screenshots/Screenshot-9.png)
![Offer Creation Page](./screenshots/Screenshot-10.png)
```


   ```markdown
   ![Demo Video](https://drive.google.com/file/d/1QzUPSUObLvOPwpfScm98R5PyFooaO4tS/view?usp=sharing )
   ```
   <a href="https://drive.google.com/file/d/1QzUPSUObLvOPwpfScm98R5PyFooaO4tS/view">

</a>

## 💻 Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js with Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Storage**: Firebase Buckets for image storage
- **Deployment**: Vercel

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/manojk0303/partner-management-system.git
   cd partner-management-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:
   ```python
    DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"

    # NextAuth configuration
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your-secure-secret-key

    # Admin registration
    ADMIN_REGISTRATION_KEY=your-secure-admin-key

    # Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-firebase-measurement-id
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## 📊 Database Schema

The application uses Prisma ORM with PostgreSQL. Here's the schema:

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Brand {
  id           String   @id @default(uuid())
  name         String
  logo         String   // URL to logo image
  description  String @db.Text
  location     String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Relationships
  images       Image[]
  offers       Offer[]
}

model Image {
  id        String   @id @default(uuid())
  url       String
  altText   String?
  brandId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  brand     Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)
}

model Offer {
  id          String   @id @default(uuid())
  title       String
  description String @db.Text
  startDate   DateTime
  endDate     DateTime?
  couponCode  String?
  discountPercent Int?
  active      Boolean  @default(true)
  brandId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  brand       Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)
}

enum Role {
  USER
  ADMIN
}
```

## 🚪 Application Routes

### Public Routes
- `/` - Home page with featured partners
- `/partners` - List of all partner brands
- `/partners/[id]` - Detailed view of a specific partner

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/partners` - Partner management
- `/admin/partners/new` - Create new partner
- `/admin/partners/[id]` - Edit partner details
- `/admin/offers` - Offer management

## 🛠️ API Endpoints

### Public Endpoints
- `GET /api/brands` - List all brands
- `GET /api/brands/:id` - Get a specific brand with its offers
- `GET /api/offers` - List all active offers (can be filtered by brand)

### Admin Endpoints (Protected)
- `POST /api/admin/brands` - Create a new brand
- `PUT /api/admin/brands/:id` - Update a brand
- `DELETE /api/admin/brands/:id` - Delete a brand
- `POST /api/admin/brands/:id/images` - Add images to a brand
- `DELETE /api/admin/images/:id` - Delete an image
- `POST /api/admin/brands/:id/offers` - Create a new offer for a brand
- `PUT /api/admin/offers/:id` - Update an offer
- `DELETE /api/admin/offers/:id` - Delete an offer

### Auth Endpoints
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Admin registration (restricted with admin registration key)

## 🔐 Authentication

The application uses NextAuth.js for authentication:
- Email/Password authentication for admins
- Role-based access control for admin features
- Secure admin registration using a registration key

## 📁 Firebase Storage

The application uses Firebase Storage for handling image uploads:
- Brand logos are stored in Firebase buckets
- Additional brand images are stored and managed through Firebase
- Secure upload process with proper authentication

## 🚀 Deployment

The application is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel's dashboard
3. Set up PostgreSQL database (Vercel Postgres or external provider)
4. Deploy the application

## 📝 Future Improvements

- Add analytics dashboard for offer performance
- Implement user favorites and personalized recommendations
- Add notification system for new offers
- Enhance search capabilities with filters
- Implement multi-language support

## 👨‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.