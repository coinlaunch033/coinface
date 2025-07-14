# MemeMarketer 🚀

A multi-chain meme coin promotion platform that helps creators instantly generate promotional websites for their tokens with social sharing and DEX integration.

## 🌟 Features

- **Multi-Chain Support**: Solana, Ethereum, Base, BNB Chain, Polygon
- **Instant Website Generation**: Create promotional pages in seconds
- **Social Media Integration**: Share on Twitter, Reddit, Telegram
- **DEX Terminal Links**: Direct links to DexScreener, BirdEye, GeckoTerminal, GMGN
- **Custom Themes**: Dark, Light, and Rainbow themes
- **Original Brand Logos**: Professional logos for all platforms
- **MemeDrop Integration**: Weekly token promotion contests

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + Framer Motion
- **UI Components**: Radix UI + shadcn/ui
- **Form Handling**: React Hook Form + Zod validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/coinlaunch033/memesite.git
   cd memesite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_supabase_connection_string
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
MemeMarketer/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── assets/logos/   # Original brand logos
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities and configurations
├── server/                # Backend Express server
├── shared/                # Shared TypeScript schemas
└── uploads/               # User uploaded images
```

## 🎨 Customization

### Adding New Blockchains
1. Add logo to `client/src/assets/logos/blockchains/`
2. Update `client/src/assets/logos/index.ts`
3. Add to chain selector component

### Adding New DEX Terminals
1. Add logo to `client/src/assets/logos/dex/`
2. Update DEX links in token card component
3. Add to home page showcase

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Connect repository and set build command
- **Railway**: Deploy with database integration
- **Heroku**: Use Procfile for deployment

## 📊 Database Schema

### Tables
- `tokens`: Token information and metadata
- `meme_drops`: Weekly promotion contests
- `views`: Token page view tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/coinlaunch033/memesite/issues)
- **Discussions**: [GitHub Discussions](https://github.com/coinlaunch033/memesite/discussions)

## 🚀 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] AI-powered token recommendations
- [ ] Multi-language support
- [ ] Advanced theme customization
- [ ] Integration with more DEX platforms

---

**Built with ❤️ for the meme coin community** 