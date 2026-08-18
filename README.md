# Echo Hub Marketplace

**Complete Anonymity. Secure Blind-Broker Trading.**

A production-grade, zero-cost marketplace platform built on Supabase PostgreSQL and GitHub Pages.

## Features

- ✅ **PII Protection**: Automatic blocking of personal information (emails, phone numbers, URLs)
- ✅ **Blind-Broker Architecture**: Complete anonymity for buyers and sellers
- ✅ **Real-Time Listings**: Live marketplace powered by Supabase
- ✅ **Discord Integration**: Automatic webhook notifications for new listings
- ✅ **100% Free Hosting**: GitHub Pages (free) + Supabase free tier (500MB)
- ✅ **Production Ready**: Zero dependencies, fully client-side rendering

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: Supabase (PostgreSQL)
- **Hosting**: GitHub Pages
- **Notifications**: Discord Webhooks

## Deployment

Deployed to: `https://echohub-creator.github.io/echo-hub-marketplace`

## Architecture

1. **Buyer Intake**: Anonymous form submission via web portal
2. **Central Board Routing**: Automated webhook routing to Discord
3. **Blind-Broker Logic**: Complete identity separation
4. **Payment Handoff**: Manual PayPal coordination (Phase 4)

## Security

- Client-side PII detection and blocking
- No personal data stored in database
- Row-Level Security (RLS) policies on Supabase
- HTTPS-only hosting via GitHub Pages

## Files

- `index.html` - Production frontend (HTML + embedded CSS)
- `app.js` - Supabase integration + PII engine
- `README.md` - Documentation

## Status

Phase 1: ✅ Database setup complete  
Phase 2: ✅ Frontend production files ready  
Phase 3: 🔄 GitHub Pages deployment  
Phase 4: ⏳ Discord webhook integration  
Phase 5: ⏳ Payment workflow  
Phase 6: ⏳ Validation & go live  

---

**Built with Zero Compromise on Privacy.**
