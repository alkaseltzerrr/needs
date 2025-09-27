# 🤗 Needs - Share Your Needs with People Who Care

A cute, light-hearted application that allows you to group up with people to publicly post your "needs" for them to notice. Whether it's a simple task like groceries, a genuine talk, or a food craving together. Needs helps you connect with your caring community!

## ✨ Features

- **Group Management**: Create and join groups with friends, family, or communities
- **Needs Board**: Post your needs with categories, priorities, and descriptions
- **Neediness Tracking**: Fun emoji-based system to track how "needy" you are (0-100 scale)
- **Real-time Updates**: See when someone responds to or fulfills your needs
- **Cute Animations**: Delightful pixelated fonts and pulsing animations throughout
- **Responsive Design**: Works beautifully on desktop and mobile devices

## 🎨 Neediness Levels

- 😌 **Chill** (0-20): You're doing great!
- 🙂 **Okay** (21-40): Could use a little help
- 😕 **Needy** (41-60): Definitely need some support
- 😰 **Very Needy** (61-80): Really could use help right now
- 🆘 **Emergency!** (81-100): Maximum neediness alert!

## 🚀 Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Press Start 2P, Comfortaa, Fredoka)

## 📋 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/needs.git
cd needs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL script from `supabase/schema.sql` to create all tables and policies
4. Go to Settings > API to find your project URL and anon key

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗂️ Project Structure

```
needs/
├── app/
│   ├── auth/
│   │   ├── login/         # Login page
│   │   └── signup/        # Signup page
│   ├── dashboard/         # Main dashboard
│   ├── groups/
│   │   └── [id]/         # Group detail & needs board
│   └── globals.css       # Global styles
├── components/
│   ├── DashboardContent.tsx    # Dashboard UI
│   ├── GroupCard.tsx           # Group display card
│   ├── GroupNeedsBoard.tsx     # Needs board for groups
│   ├── NeedinessIndicator.tsx  # Neediness level display
│   ├── CreateGroupModal.tsx    # Modal for creating groups
│   └── ...                     # Other components
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Supabase client config
│   │   ├── server.ts          # Supabase server config
│   │   └── database.types.ts  # TypeScript types
│   └── utils.ts               # Utility functions
├── supabase/
│   └── schema.sql            # Database schema
└── middleware.ts             # Auth middleware
```

## 🎮 How to Use

1. **Sign Up**: Create an account with username and email
2. **Create/Join Groups**: Start a new group or join existing ones
3. **Post Needs**: Share what you need with your group
4. **Help Others**: Respond to and fulfill needs from group members
5. **Track Neediness**: Watch your neediness level change based on activity

## 🤝 Need Categories

- 🛒 **Groceries**: Shopping help needed
- 🧹 **Chores**: Household tasks
- 💭 **Emotional**: Need someone to talk to
- 👥 **Social**: Looking for company
- 🍕 **Food Craving**: Want to eat together
- 🤝 **Help**: General assistance
- 🫂 **Company**: Just need someone around
- 📌 **Other**: Everything else

---

Made with 💖 by your favorite CS x IT couple
