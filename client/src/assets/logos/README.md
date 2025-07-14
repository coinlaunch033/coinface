# Logo Assets

This directory contains original SVG logos for all blockchains, social media platforms, and DEX terminals used in the MemeMarketer application.

## Directory Structure

```
logos/
├── blockchains/     # Blockchain logos
├── socials/         # Social media platform logos
├── dex/            # DEX terminal logos
└── index.ts        # Export file for all logos
```

## Blockchain Logos

- **solana.svg** - Solana blockchain logo with purple gradient
- **ethereum.svg** - Ethereum blockchain logo with blue color
- **base.svg** - Base blockchain logo with blue color
- **bnb.svg** - BNB Chain logo with yellow color
- **polygon.svg** - Polygon blockchain logo with purple color

## Social Media Logos

- **twitter.svg** - Twitter/X platform logo (black background)
- **reddit.svg** - Reddit platform logo (orange color)
- **telegram.svg** - Telegram platform logo (blue color)

## DEX Terminal Logos

- **dexscreener.svg** - DexScreener terminal logo (blue theme)
- **birdeye.svg** - BirdEye terminal logo (green theme)
- **geckoterminal.svg** - GeckoTerminal logo (purple theme)
- **gmgn.svg** - GMGN terminal logo (orange theme)

## Usage

Import logos using the index file:

```typescript
import { blockchainLogos, socialLogos, dexLogos } from '@/assets/logos';

// Use specific logos
const solanaLogo = blockchainLogos.solana;
const twitterLogo = socialLogos.twitter;
const dexscreenerLogo = dexLogos.dexscreener;
```

## Design Notes

- All logos are 32x32 SVG files with rounded corners
- Colors match the official brand guidelines
- Optimized for web use with clean vector graphics
- Consistent styling across all platforms 