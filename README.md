# GetMeACoffee

A **Work Showcase & Fundraiser App** where users can post their projects, including GitHub repositories, images, videos, and YouTube links, while also receiving support from others through a secure fundraising system.

## 🚀 Live Demo
- Check out live app at: **[Visit Here](https://getmeacoffee.online/)**
- Check out a demo profile: **[Visit Here](https://getmeacoffee.online/ishaan)**

## ✨ Features
- **Showcase Your Work**: Share projects with GitHub repos, images, videos, and YouTube links.
- **OAuth Authentication**: Secure sign-in via GitHub, Google, and Facebook (NextAuth).
- **Fundraising Support**: Integrated Stripe payment processing to receive support from others.

## 🛠 Tech Stack
- **Frontend**: Next.js, Tailwind CSS
- **Backend**: MongoDB, NextAuth.js, Cloudinary, Stripe
- **Authentication**: OAuth (GitHub, Google, Facebook)

---

## 🛠 Setup Instructions
### 1️⃣ Clone the Repository
```sh
git clone https://github.com/YOUR_GITHUB_USERNAME/GetMeACoffee.git
cd GetMeACoffee
```

### 2️⃣ Install Dependencies
```sh
npm install  # or yarn install
```

### 3️⃣ Configure Environment Variables
Create a `.env.local` file in the root directory and add the following variables:

```env
GITHUB_ID="YOUR_GITHUB_ID"
GITHUB_SECRET="YOUR_GITHUB_SECRET"
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
FACEBOOK_CLIENT_ID="YOUR_FACEBOOK_CLIENT_ID"
FACEBOOK_CLIENT_SECRET="YOUR_FACEBOOK_CLIENT_SECRET"
MONGO_URI="YOUR_MONGO_URI"
MONGODB_URI="YOUR_MONGODB_URI"
NEXT_PUBLIC_KEY_ID="YOUR_RAZORPAY_KEY_ID"
KEY_SECRET="YOUR_RAZORPAY_SECRET"
NEXT_PUBLIC_PORT="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET"
NEXT_PUBLIC_WEBHOOK_SECRET="YOUR_STRIPE_WEBHOOK_SECRET"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="YOUR_CLOUDINARY_CLOUD_NAME"
NEXT_PUBLIC_CLOUDINARY_PRESET="YOUR_CLOUDINARY_PRESET"
CLOUDINARY_API_KEY="YOUR_CLOUDINARY_API_KEY"
CLOUDINARY_API_SECRET="YOUR_CLOUDINARY_API_SECRET"
STRIPE_SECRET_KEY="YOUR_STRIPE_SECRET_KEY"
STRIPE_PUBLISHABLE_KEY="YOUR_STRIPE_PUBLISHABLE_KEY"
```

### 🔑 How to Obtain Stripe API Keys
1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/).
2. Navigate to **Developers > API Keys**.
3. Copy your **Publishable Key** and **Secret Key** and add them to `.env.local`.

---

### 4️⃣ Run the Development Server
```sh
npm run dev  # or yarn dev
```
Your app will be available at `http://localhost:3000`
