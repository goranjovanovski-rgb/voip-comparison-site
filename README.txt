HUBSPOT PRODUCT SETUP

Create products inside HubSpot:

Settings
→ Objects
→ Products

Create products like:

1.
Name:
Essential Cloud Voice
Price:
24

2.
Name:
Growth UC Suite
Price:
39

3.
Name:
AI Contact Centre Pro
Price:
59

Optional descriptions:
- Small business VOIP
- AI call centre
- SMS enabled UC

-----------------------------------

FILES INCLUDED

1.
netlify/functions/get-pricing.js

Loads pricing from HubSpot products.

2.
src/pricingService.js

Frontend pricing loader.

3.
App.jsx update instructions

-----------------------------------

DEPLOY

Copy files into your project.

Then push:

git add .
git commit -m "Add HubSpot product pricing"
git push

Netlify auto redeploys.

-----------------------------------

IMPORTANT

You still calculate:
- handsets
- AI add-ons
- SMS
- webchat

inside the app/backend.

HubSpot products become:
BASE MONTHLY USER PRICE
