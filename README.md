# SampleSecure

**Find, clear, and manage your music samples in minutes, not months.**

SampleSecure is a comprehensive web application that helps remix artists quickly identify, legally clear, and track music samples using a streamlined platform powered by AI and modern web technologies.

## 🚀 Features

### Core Features
- **Sample Identification & Discovery**: Upload audio snippets or provide song titles to identify potential samples and their original sources using AI
- **Rights Holder Contact Database**: Searchable database of verified contact information for music publishers, labels, and administrators
- **Standardized Clearance Request Forms**: Pre-filled, customizable forms for faster outreach to rights holders
- **Deal Tracking & Management**: Centralized dashboard to manage all ongoing sample clearance requests, contracts, and payments

### Subscription Tiers
- **Free**: 3 clearances/month, 10 searches/month, basic support
- **Creator ($15/mo)**: 10 clearances/month, 100 searches/month, priority support, advanced analytics
- **Pro ($49/mo)**: Unlimited clearances and searches, direct agent outreach, premium support, API access

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **AI Services**: OpenAI GPT-4 for sample identification and clearance letter generation
- **Payments**: Stripe for subscription management
- **UI Components**: Custom design system with shadcn/ui patterns
- **State Management**: React Context API
- **Routing**: React Router v6

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Git

You'll also need accounts and API keys for:
- [Supabase](https://supabase.com) - Backend services
- [OpenAI](https://platform.openai.com) - AI services
- [Stripe](https://stripe.com) - Payment processing

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vistara-apps/this-is-a-9227.git
cd this-is-a-9227
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your actual API keys:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key

# App Configuration
VITE_APP_URL=http://localhost:5173
```

### 4. Database Setup

#### Supabase Schema

Create the following tables in your Supabase database:

```sql
-- Users table
CREATE TABLE users (
  "userId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  "subscriptionTier" TEXT DEFAULT 'free',
  "stripeCustomerId" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  "projectId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES users("userId") ON DELETE CASCADE,
  "projectName" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rights Holders table
CREATE TABLE "rightsHolders" (
  "rightsHolderId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  address TEXT,
  website TEXT
);

-- Samples table
CREATE TABLE samples (
  "sampleId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" UUID REFERENCES projects("projectId") ON DELETE CASCADE,
  "audioFileUrl" TEXT,
  "identifiedSongTitle" TEXT,
  "originalArtist" TEXT,
  "rightsHolderName" TEXT,
  "rightsHolderContact" TEXT,
  "clearanceStatus" TEXT DEFAULT 'pending',
  "clearanceRequestId" UUID,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clearance Requests table
CREATE TABLE "clearanceRequests" (
  "clearanceRequestId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sampleId" UUID REFERENCES samples("sampleId") ON DELETE CASCADE,
  "requestDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "submissionStatus" TEXT DEFAULT 'draft',
  "responseStatus" TEXT DEFAULT 'pending',
  "termsOffered" TEXT,
  "agreementUrl" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clearanceRequests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rightsHolders" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users FOR ALL USING (auth.uid()::text = "userId"::text);
CREATE POLICY "Users can view own projects" ON projects FOR ALL USING (auth.uid()::text = "userId"::text);
CREATE POLICY "Users can view own samples" ON samples FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE projects."projectId" = samples."projectId" AND projects."userId"::text = auth.uid()::text)
);
CREATE POLICY "Users can view own clearance requests" ON "clearanceRequests" FOR ALL USING (
  EXISTS (
    SELECT 1 FROM samples 
    JOIN projects ON projects."projectId" = samples."projectId" 
    WHERE samples."sampleId" = "clearanceRequests"."sampleId" 
    AND projects."userId"::text = auth.uid()::text
  )
);
CREATE POLICY "Rights holders are publicly readable" ON "rightsHolders" FOR SELECT USING (true);
```

### 5. Stripe Setup

1. Create products and prices in your Stripe dashboard:
   - Creator Plan: $15/month
   - Pro Plan: $49/month

2. Update the price IDs in `src/services/stripe.js`:
   ```javascript
   creator: {
     // ...
     priceId: 'price_your_creator_price_id', // Replace with actual Stripe price ID
   },
   pro: {
     // ...
     priceId: 'price_your_pro_price_id', // Replace with actual Stripe price ID
   }
   ```

3. Set up webhooks for subscription events (optional for MVP)

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ActionForm.jsx   # Sample search and clearance forms
│   ├── DataTable.jsx    # Data display component
│   ├── Header.jsx       # App header
│   ├── SampleCard.jsx   # Sample display card
│   ├── SidebarNav.jsx   # Navigation sidebar
│   └── StatusBadge.jsx  # Status indicator
├── contexts/            # React contexts for state management
│   ├── AuthContext.jsx  # Authentication state
│   └── SubscriptionContext.jsx # Subscription state
├── pages/               # Page components
│   ├── Dashboard.jsx    # Main dashboard
│   ├── FindSamples.jsx  # Sample identification
│   ├── Landing.jsx      # Landing page
│   ├── MyClearances.jsx # Clearance management
│   ├── RightsHolders.jsx # Rights holder database
│   └── Settings.jsx     # User settings
├── services/            # API and external service integrations
│   ├── api.js          # Database operations
│   ├── openai.js       # AI service integration
│   ├── stripe.js       # Payment processing
│   └── supabase.js     # Database client
├── utils/               # Utility functions
│   ├── errors.js       # Error handling
│   └── helpers.js      # Common utilities
├── App.jsx             # Main app component
├── index.css           # Global styles
└── main.jsx            # App entry point
```

## 🎨 Design System

The application uses a custom design system built with Tailwind CSS:

### Colors
- **Primary**: `hsl(210, 90%, 50%)` - Blue for primary actions
- **Accent**: `hsl(30, 90%, 60%)` - Orange for highlights
- **Background**: `hsl(200, 10%, 95%)` - Light background
- **Surface**: `hsl(0, 0%, 100%)` - White surfaces
- **Dark Theme**: Custom dark color palette for better UX

### Typography
- **Display**: Large headings (3rem, bold)
- **Heading**: Section headings (1.5rem, semibold)
- **Body**: Regular text (1rem, normal)
- **Caption**: Small text (0.875rem, medium)

### Components
All components follow consistent patterns with variants for different use cases.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key | Yes |
| `VITE_OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `VITE_APP_URL` | Your app URL (for redirects) | Yes |

### API Rate Limits

- **OpenAI**: Be mindful of rate limits and costs
- **Supabase**: Free tier has usage limits
- **Stripe**: Test mode for development

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint
```

## 📝 API Documentation

### Sample Identification

The app uses OpenAI's GPT-4 to identify music samples based on audio descriptions or metadata.

### Database Schema

Refer to the database setup section for the complete schema with relationships.

### Subscription Management

Stripe handles all subscription logic with webhooks for real-time updates.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@samplesecure.com or create an issue in this repository.

## 🗺 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced audio fingerprinting
- [ ] Integration with major music platforms
- [ ] Automated contract generation
- [ ] Blockchain-based rights management
- [ ] API for third-party integrations

---

**Built with ❤️ for the music community**
