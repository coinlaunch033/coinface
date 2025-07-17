# Coinface Deployment Guide 🚀

## Prerequisites

- Node.js 18+ 
- Neon Database account
- Cloudinary account (for image storage)
- Reown AppKit project ID

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=your_neon_connection_string

# Cloudinary (for image storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Reown AppKit (for wallet integration)
VITE_REOWN_PROJECT_ID=your_reown_project_id
```

## Deployment Options

### 1. Vercel (Recommended)

1. **Connect Repository**
   - Fork/clone this repository to your GitHub account
   - Connect to Vercel dashboard

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from the `.env` file above

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - Your site will be available at: `https://your-project.vercel.app`

### 2. Railway

1. **Connect Repository**
   - Connect your GitHub repository to Railway

2. **Set Environment Variables**
   - Add all environment variables in Railway dashboard

3. **Deploy**
   - Railway will automatically build and deploy your app

### 3. Netlify

1. **Connect Repository**
   - Connect your GitHub repository to Netlify

2. **Build Settings**
   - Build Command: `npm run build`
   - Publish Directory: `dist/public`

3. **Environment Variables**
   - Add all environment variables in Netlify dashboard

4. **Deploy**
   - Netlify will automatically deploy on push to main branch

## Post-Deployment

### 1. Database Setup
- Ensure your Neon database is properly configured
- Run database migrations if needed: `npm run db:push`

### 2. Domain Configuration
- Point your domain (coinface.fun) to your deployment
- Configure SSL certificates

### 3. SEO Setup
- Sitemap is available at: `https://coinface.fun/sitemap.xml`
- Robots.txt is available at: `https://coinface.fun/robots.txt`

### 4. Monitoring
- Set up monitoring for your deployment
- Monitor database connections and API performance

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check environment variables are set correctly

2. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check Neon database is active
   - Ensure IP allowlist includes deployment IP

3. **Image Upload Issues**
   - Verify Cloudinary credentials
   - Check CLOUDINARY_* environment variables

4. **Wallet Connection Issues**
   - Verify VITE_REOWN_PROJECT_ID is set
   - Check Reown AppKit configuration

## Support

For deployment issues, check:
- Vercel/Railway/Netlify logs
- Application logs in deployment platform
- Database connection status
- Environment variable configuration

## Production Checklist

- [ ] Environment variables configured
- [ ] Database connected and tested
- [ ] Image upload working
- [ ] Wallet connection working
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Sitemap accessible
- [ ] Robots.txt accessible
- [ ] Performance monitoring set up
- [ ] Error tracking configured 