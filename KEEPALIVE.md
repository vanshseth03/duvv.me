# Keep Render Backend Awake

Instead of having every client browser ping the backend (which creates unnecessary traffic), use a dedicated monitoring service.

## Option 1: UptimeRobot (Recommended - FREE)
1. Go to https://uptimerobot.com/
2. Create free account
3. Add new monitor:
   - Monitor Type: HTTP(s)
   - URL: `https://duvv-me-api.onrender.com/api/health`
   - Monitoring Interval: 5 minutes
4. Done! Your backend will stay awake 24/7

## Option 2: Cron-Job.org (FREE)
1. Go to https://cron-job.org/
2. Create account
3. Add new cron job:
   - URL: `https://duvv-me-api.onrender.com/api/health`
   - Interval: Every 10 minutes
4. Enable and save

## Option 3: Better Stack (FREE)
1. Go to https://betterstack.com/uptime
2. Create account
3. Add monitor for your API endpoint
4. Set check interval to 5-10 minutes

## Option 4: GitHub Actions (FREE)
Create `.github/workflows/keepalive.yml` in your backend repo:

```yaml
name: Keep Render Awake
on:
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Backend
        run: curl -f https://duvv-me-api.onrender.com/api/health || exit 0
```

This is much better than having every client ping the backend!
