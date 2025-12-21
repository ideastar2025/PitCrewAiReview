# PitCrew AI Reviewer - Complete Setup Guide

## 📁 Project Structure

```
pitcrew-ai/
├── frontend/                 # React dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
├── backend/                  # Django REST API
│   ├── pitcrew/
│   ├── apps/
│   └── requirements.txt
├── forge/                    # Forge app
│   ├── manifest.yml
│   ├── src/
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start (7-Day Timeline)

### Day 1: Environment Setup

#### 1. Install Prerequisites

```bash
# Install Node.js 18+, Python 3.10+, PostgreSQL 14+
# Install Forge CLI
npm install -g @forge/cli

# Login to Forge
forge login
```

#### 2. Create Forge App

```bash
mkdir pitcrew-ai && cd pitcrew-ai
forge create
# Choose: Custom UI
# Name: pitcrew-ai-reviewer
```

#### 3. Setup Django Backend

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install django djangorestframework django-cors-headers psycopg2-binary requests
pip freeze > backend/requirements.txt
```

#### 4. Initialize Database

```bash
# Start PostgreSQL (using Docker)
docker run --name pitcrew-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

# Create Django project
cd backend
django-admin startproject pitcrew .
python manage.py startapp auth_app
python manage.py startapp repos
python manage.py startapp reviews
python manage.py startapp webhooks

# Run migrations
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

#### 5. Setup React Frontend

```bash
cd ../frontend
npx create-react-app .
npm install lucide-react
```

---

### Day 2: OAuth & Repository Connection

#### 1. Configure GitHub OAuth

1. Go to GitHub Settings → Developer Settings → OAuth Apps
2. Create new OAuth App:
   - Application name: PitCrew AI
   - Homepage URL: `http://localhost:3000`
   - Authorization callback: `http://localhost:8000/auth/github/callback`
3. Save Client ID and Secret

#### 2. Configure Bitbucket OAuth

1. Go to Bitbucket Settings → OAuth consumers
2. Create new consumer:
   - Name: PitCrew AI
   - Callback URL: `http://localhost:8000/auth/bitbucket/callback`
   - Permissions: repositories (read), pullrequests (read/write)
3. Save Key and Secret

#### 3. Environment Variables

Create `.env` file in backend/:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
DB_NAME=pitcrew_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
BITBUCKET_CLIENT_ID=your-bitbucket-key
BITBUCKET_CLIENT_SECRET=your-bitbucket-secret
ANTHROPIC_API_KEY=your-anthropic-api-key
```

#### 4. Implement OAuth Views

```python
# backend/apps/auth_app/views.py
from django.shortcuts import redirect
from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests

@api_view(['GET'])
def github_login(request):
    client_id = settings.GITHUB_CLIENT_ID
    redirect_uri = 'http://localhost:8000/auth/github/callback'
    return redirect(f'https://github.com/login/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&scope=repo')

@api_view(['GET'])
def github_callback(request):
    code = request.GET.get('code')
    # Exchange code for token
    response = requests.post('https://github.com/login/oauth/access_token', {
        'client_id': settings.GITHUB_CLIENT_ID,
        'client_secret': settings.GITHUB_CLIENT_SECRET,
        'code': code
    }, headers={'Accept': 'application/json'})
    
    token = response.json().get('access_token')
    # Save token to user profile
    request.user.profile.github_token = token
    request.user.profile.save()
    
    return redirect('http://localhost:3000/dashboard')
```

---

### Day 3: Bitbucket Webhook Integration

#### 1. Configure Forge Manifest

Update `forge/manifest.yml` with the webhook triggers (see artifact above)

#### 2. Deploy Forge App

```bash
cd forge
forge deploy
forge install --upgrade
```

#### 3. Setup Webhook in Bitbucket

1. Go to Repository Settings → Webhooks
2. Add webhook:
   - URL: Your Forge function URL (from `forge deploy` output)
   - Triggers: Pull request created, updated
   - Status: Active

#### 4. Test Webhook

```bash
# Create a test PR in Bitbucket
# Check Forge logs
forge logs
```

---

### Day 4: AI Analysis Integration

#### 1. Get Anthropic API Key

1. Go to console.anthropic.com
2. Create API key
3. Add to `.env` file

#### 2. Implement AI Analyzer

The AI analyzer code is already provided in the Django backend artifact above.

#### 3. Test AI Analysis

```bash
# In Django shell
python manage.py shell

from apps.reviews.models import PullRequest
from apps.webhooks.ai_analyzer import analyze_pr

pr = PullRequest.objects.first()
result = analyze_pr(pr)
print(result)
```

---

### Day 5: Jira Panel Integration

#### 1. Add Jira Panel to Forge

Update `forge/manifest.yml` with Jira panel configuration

#### 2. Create Panel UI

```jsx
// forge/src/ui/JiraPanel.jsx
import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';

export default function JiraPanel() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    invoke('getPRData').then(setData);
  }, []);
  
  if (!data) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>PR Review: {data.prData.title}</h2>
      <p>Risk Score: {data.analysis.riskScore}</p>
      {/* Rest of the UI */}
    </div>
  );
}
```

#### 3. Deploy and Test

```bash
forge deploy
# Open a Jira issue
# Check if panel appears
```

---

### Day 6: React Dashboard Polish

#### 1. Connect Frontend to Backend

```javascript
// frontend/src/utils/api.js
const API_BASE = 'http://localhost:8000/api';

export const getDashboard = async () => {
  const response = await fetch(`${API_BASE}/pull-requests/dashboard/`, {
    headers: {
      'Authorization': `Token ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};

export const getRepos = async () => {
  const response = await fetch(`${API_BASE}/repositories/`, {
    headers: {
      'Authorization': `Token ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};
```

#### 2. Implement Real Data Fetching

Update the Dashboard component to fetch real data instead of mock data.

#### 3. Add Loading States & Error Handling

```jsx
const [error, setError] = useState(null);

useEffect(() => {
  getDashboard()
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);

if (error) return <ErrorMessage error={error} />;
```

---

### Day 7: Testing & Deployment

#### 1. End-to-End Test

1. Create a test PR in Bitbucket
2. Verify webhook triggers
3. Check AI analysis runs
4. Confirm Jira panel updates
5. Check dashboard displays data

#### 2. Deploy Backend

```bash
# Using Railway
railway login
railway init
railway up

# Or using Render
# Create account, connect GitHub repo
# Auto-deploy on push
```

#### 3. Deploy Frontend

```bash
cd frontend
npm run build

# Using Vercel
vercel login
vercel --prod
```

#### 4. Deploy Forge App

```bash
cd forge
forge deploy --env production
forge install --upgrade --site your-site
```

---

## 🎥 Demo Video Script

### 1. Introduction (30s)
"Hi, I'm presenting PitCrew AI - an intelligent code review assistant that integrates seamlessly with Atlassian's ecosystem."

### 2. Problem Statement (30s)
"Dev teams waste hours in manual code reviews, missing critical issues. Managers lack visibility into PR risk and team velocity."

### 3. Solution Demo (2m)
- Show dashboard with PR list
- Open a Jira issue, show AI review panel
- Open Bitbucket PR, show inline AI comments
- Highlight risk scores and recommendations

### 4. Technical Highlights (30s)
- React + Django + Forge architecture
- Real-time AI analysis using Claude
- Seamless Jira + Bitbucket integration

### 5. Call to Action (30s)
"PitCrew AI saves hours, catches bugs early, and gives teams confidence to ship faster. Try it today!"

---

## 📊 Submission Checklist

- [ ] Working Forge app deployed
- [ ] Demo video (3-4 minutes)
- [ ] GitHub repo with code
- [ ] README with installation instructions
- [ ] Screenshots of key features
- [ ] Pitch deck (8 slides)
- [ ] Live demo environment
- [ ] Documentation

---

## 🐛 Common Issues & Solutions

### Issue: Forge deployment fails
**Solution:** Check `manifest.yml` syntax, ensure all scopes are correct

### Issue: Webhook not triggering
**Solution:** Verify webhook URL, check Bitbucket webhook status, review Forge logs

### Issue: AI analysis returns errors
**Solution:** Check Anthropic API key, verify quota, test with simpler prompts

### Issue: Jira panel not showing
**Solution:** Ensure PR has Jira issue key in title/description, check storage keys

### Issue: CORS errors in frontend
**Solution:** Add CORS middleware in Django, update ALLOWED_HOSTS

---

## 📚 Additional Resources

- [Forge Documentation](https://developer.atlassian.com/platform/forge/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Anthropic API](https://docs.anthropic.com/)
- [React Documentation](https://react.dev/)

---

## 🏆 Winning Tips

1. **Focus on UX**: Make the UI beautiful and intuitive
2. **Show Impact**: Demonstrate clear time savings and value
3. **Polish Everything**: No bugs, smooth animations, professional design
4. **Tell a Story**: Connect features to real developer pain points
5. **Be Enterprise-Ready**: Show scalability, security, team features

---

## 📞 Support

For questions or issues during development:
- Check Forge community forums
- Review Django documentation
- Test incrementally at each step
- Use console logs extensively
- Keep API keys secure

Good luck building PitCrew AI! 🚀