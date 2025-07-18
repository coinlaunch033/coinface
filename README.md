# Coinface 🚀

A multi-chain meme coin promotion platform that helps creators instantly generate promotional websites for their tokens with social sharing and DEX integration.

**🌐 Website**: https://coinface.fun

## 🌟 Features

- **Solana Support**: Full Solana blockchain integration
- **Instant Website Generation**: Create promotional pages in seconds
- **Social Media Integration**: Share on Twitter, Reddit, Telegram
- **DEX Terminal Links**: Direct links to DexScreener, BirdEye, GeckoTerminal, GMGN
- **Custom Themes**: Dark, Light, and Rainbow themes
- **Original Brand Logos**: Professional logos for all platforms
- **MemeDrop Integration**: Weekly token promotion contests

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: Neon (PostgreSQL)
- **Styling**: Tailwind CSS + Framer Motion
- **UI Components**: Radix UI + shadcn/ui
- **Form Handling**: React Hook Form + Zod validation
- **Wallet Integration**: MetaMask + Web3
- **Payment Flow**: Crypto payments with multi-chain support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Neon Database account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/coinlaunch033/coinface.git
   cd coinface
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_neon_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   VITE_REOWN_PROJECT_ID=your_reown_project_id
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
2. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `VITE_REOWN_PROJECT_ID`
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

- **Issues**: [GitHub Issues](https://github.com/coinlaunch033/coinface/issues)
- **Discussions**: [GitHub Discussions](https://github.com/coinlaunch033/coinface/discussions)

## 🚀 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] AI-powered token recommendations
- [ ] Multi-language support
- [ ] Advanced theme customization
- [ ] Integration with more DEX platforms

---

**Built with ❤️ for the meme coin community** 