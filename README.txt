NETLIFY UPDATE FILES

1. Replace:
src/App.jsx

2. Replace:
netlify/functions/hubspot-lead.js

3. Push updates:

git add .
git commit -m "Production HubSpot + pricing updates"
git push

4. Netlify auto deploys.

5. Add HubSpot custom properties:
- current_provider
- urgency
- business_type
- users_required
- handsets_required
- recommended_provider
- ai_match_score
- monthly_estimate
- setup_estimate
