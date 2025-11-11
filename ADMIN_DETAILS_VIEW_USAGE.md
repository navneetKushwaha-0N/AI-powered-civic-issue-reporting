# Admin Issue Details View - Usage Guide

## Quick Start

### Accessing the Feature

1. **Login as Admin**
   - Navigate to the application
   - Login with admin credentials

2. **Go to Manage Issues**
   - From Admin Dashboard, click "Manage Issues"
   - Or directly navigate to `/admin/issues`

3. **View Issue Details**
   - Find any issue in the table
   - Click the **📄 (FileText)** icon in the Actions column
   - The detailed view modal will open

## What You'll See

### Modal Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Issue Details                                           ✕  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📋 ISSUE INFORMATION                                       │
│  ├─ Title, Category, Status, Date                          │
│  ├─ Description                                            │
│  └─ Location Address, Admin Notes, ML Confidence           │
│                                                             │
│  🖼️ IMAGE & LOCATION                                        │
│  ├─ Zoomable Photo (click to enlarge)                      │
│  └─ Interactive Map with marker                            │
│                                                             │
│  👥 SUPPORT DETAILS                                         │
│  ├─ "Supported by X users"                                 │
│  └─ Scrollable list of supporters with dates               │
│                                                             │
│  👤 REPORTER DETAILS                                        │
│  ├─ Profile photo                                          │
│  └─ Name, Email, Phone                                     │
│                                                             │
│  📍 NEARBY ISSUES (Within 100m)                             │
│  └─ Grid of related issues                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Features & Interactions

### 1. Image Viewing
- **Click image** → Opens full-screen zoom view
- **Click anywhere** or **✕** → Close zoom view
- High-resolution viewing for better inspection

### 2. Map Interaction
- **Pan:** Click and drag to move around
- **Zoom:** Use zoom controls (scroll disabled for UX)
- **Marker:** Click for popup with issue details
- **Coordinates:** Displayed below map

### 3. Supporter List
- **Scrollable:** If many supporters, list scrolls
- **Hover:** Row highlights on hover
- **Details:** Name, email, date, and time of support

### 4. Nearby Issues
- **Grid Layout:** Shows related issues in area
- **Click Card:** View that issue (navigate)
- **Visual Info:** Image, category, status, support count

### 5. Closing Modal
- Click **✕** button (top right)
- Click outside modal (backdrop)
- Press **ESC** key (standard UX)

## Button Actions in Issue Table

| Icon | Action | Description |
|------|--------|-------------|
| 📄 (FileText) | **View Details** | Opens comprehensive admin modal (Primary) |
| 👁️ (Eye) | **Public View** | Opens public-facing issue page |
| ⏰/✓ | **Update Status** | Quick status update actions |

## Common Use Cases

### 1. Investigating Complex Issues
- View all related information in one place
- Check nearby issues for patterns
- Review supporter engagement
- Verify reporter details

### 2. Verifying Issue Authenticity
- Check ML confidence score
- View high-resolution photo
- Compare with nearby issues
- Review reporter history

### 3. Understanding Support Patterns
- See who supports the issue
- Check when support was added
- Identify active community members
- Track issue popularity

### 4. Location Analysis
- View exact coordinates
- See issue on map
- Check nearby issues in 100m radius
- Identify problem areas

### 5. Reporter Communication
- Access reporter contact details
- View reporter profile
- Check reporting patterns
- Contact for follow-up

## Tips & Best Practices

### For Admins

1. **Quick Triage**
   - Use filters first to narrow down issues
   - Click View Details for suspicious cases
   - Check nearby issues for duplicates

2. **Pattern Recognition**
   - Look for multiple issues in same area
   - Check supporter overlap
   - Identify recurring problems

3. **Data Verification**
   - Cross-reference map location with address
   - Check ML confidence for accuracy
   - Review image for authenticity

4. **Community Engagement**
   - Note highly supported issues
   - Prioritize based on support count
   - Track active reporters

### Keyboard Shortcuts

- **ESC** - Close modal
- **Tab** - Navigate through modal content
- **Enter** - Click focused button

## Troubleshooting

### Modal Won't Open
- Check browser console for errors
- Verify user has admin permissions
- Refresh page and try again

### Map Not Displaying
- Check internet connection
- Verify Leaflet CSS is loaded
- Clear browser cache

### Images Not Loading
- Check Cloudinary configuration
- Verify image URL is valid
- Check network tab for errors

### No Nearby Issues
- This is normal if issue is isolated
- Check if other issues exist in database
- Verify location coordinates are correct

## Performance Notes

- **Lazy Loading:** Details only fetched when modal opens
- **Optimized:** Map loads on modal open, not page load
- **Efficient:** Supporter list virtualized for large datasets
- **Fast:** No unnecessary re-renders

## Mobile Experience

- **Responsive Design:** Works on tablets and phones
- **Touch Friendly:** All buttons are tap-accessible
- **Scrollable:** Content scrolls smoothly
- **Optimized Layout:** Stacks sections vertically on mobile

## Need Help?

- Check `ADMIN_DETAILS_VIEW.md` for technical details
- Review console for error messages
- Check network tab for API issues
- Contact development team for support

---

**Version:** 1.0  
**Last Updated:** November 2024  
**Feature Status:** ✅ Production Ready
