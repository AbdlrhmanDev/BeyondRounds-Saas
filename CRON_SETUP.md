# BeyondRounds Cron Job Setup Guide

## 🕐 Automated Weekly Matching

### **Option 1: Vercel Cron Jobs (Recommended)**

1. **Add to your `vercel.json`:**
```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-matching",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

2. **Schedule:** Every Monday at 9:00 AM UTC
3. **Environment Variables:** Set `CRON_SECRET` in Vercel dashboard

### **Option 2: External Cron Service**

Use services like:
- **Cron-job.org** (Free)
- **EasyCron** (Paid)
- **GitHub Actions** (Free)

**Setup:**
1. Create a scheduled job
2. URL: `https://yourdomain.com/api/cron/weekly-matching`
3. Method: `POST`
4. Headers: `Authorization: Bearer YOUR_CRON_SECRET`
5. Schedule: `0 9 * * 1` (Every Monday at 9 AM)

### **Option 3: GitHub Actions**

Create `.github/workflows/weekly-matching.yml`:

```yaml
name: Weekly Matching
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  matching:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Weekly Matching
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://yourdomain.com/api/cron/weekly-matching
```

## 🔧 Manual Testing

### **Development Testing:**
```bash
# Test the matching algorithm
curl http://localhost:3000/api/matching/test

# Test cron endpoint (development only)
curl http://localhost:3000/api/cron/weekly-matching
```

### **Production Testing:**
```bash
# Test with proper authorization
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://yourdomain.com/api/cron/weekly-matching
```

## 📊 Monitoring

### **Check Matching Logs:**
```sql
-- View recent matching results
SELECT * FROM matching_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- Get matching statistics
SELECT * FROM get_matching_stats();
```

### **Admin Dashboard:**
The admin panel shows:
- Recent matching results
- User statistics
- Match group details

## ⚙️ Configuration

### **Environment Variables:**
```bash
# Required for cron jobs
CRON_SECRET=your_random_secret_key

# Optional: Customize matching schedule
MATCHING_DAY=monday  # monday, tuesday, etc.
MATCHING_TIME=09:00  # 24-hour format
```

### **Matching Algorithm Settings:**
Edit `lib/matching-algorithm.ts` to adjust:
- Scoring weights
- Minimum group scores
- Cooldown periods
- Group size preferences

## 🚨 Troubleshooting

### **Common Issues:**

1. **"Unauthorized" Error:**
   - Check `CRON_SECRET` environment variable
   - Verify Authorization header format

2. **"No eligible users":**
   - Check user verification status
   - Ensure users have completed profiles
   - Verify payment status

3. **"Database error":**
   - Check Supabase connection
   - Verify RLS policies
   - Check table permissions

### **Debug Mode:**
Set `NODE_ENV=development` for detailed logging

## 📈 Analytics

### **Track Matching Success:**
- Weekly group creation rates
- User engagement metrics
- Match quality scores
- Geographic distribution

### **Optimization:**
- Adjust scoring weights based on user feedback
- Monitor group activity levels
- Track successful meetups
