# Nanjangud Farm Website

## Project Overview
Marketing website for 7-acre income farm in Nanjangud, Karnataka.

**Live Site:** https://verdant-mooncake-02848b.netlify.app/
**CMS Admin:** https://verdant-mooncake-02848b.netlify.app/admin/
**Repo:** https://github.com/Raghava-Kashyapa-Personal/nanjangud-farm-website

---

## Decap CMS Setup

### How It Works
1. Edit content in admin panel
2. Decap commits to GitHub
3. Netlify auto-rebuilds (~30 sec)

### CMS Collections
- **Photo Gallery** - Upload farm photos with titles/descriptions
- **Property Documents** - RTC, EC, Survey Sketch uploads
- **Site Settings** - Video URL, contact info, property details

### Data Storage
```
_data/
├── gallery/        ← Gallery items (JSON)
├── documents/      ← Document entries
└── settings.json   ← Site settings
images/             ← Uploaded images
```

---

## Pending Work

### When Images Are Ready:
1. **Connect frontend to CMS data** - Update index.html/script.js to dynamically load gallery photos from `_data/gallery/`
2. **Video section** - Load YouTube/video embed URL from `_data/settings.json`
3. **Documents section** - Show actual download links from `_data/documents/`

### Contact Details (Private)
- Phone: +91 78924 99706
- Email: rkashyapa@gmail.com
- (Gated behind contact form - not displayed publicly)

---

## Key Sections
- Hero with stats
- Tax-free income comparison (~19% total return)
- ROI Calculator
- Legal clarity ("The Agri Land Problem")
- Property details
- Photo gallery (placeholders)
- Drone video (placeholder)
- Documents (RTC, EC, Survey Sketch)
- FAQ (4 categories, 12 questions)
- About Sellers (Raghava Kashyapa, Venkatesh H)
- Contact form (gated)

## Map Coordinates
12.082472, 76.457250 (12°04'56.9"N 76°27'26.1"E)
