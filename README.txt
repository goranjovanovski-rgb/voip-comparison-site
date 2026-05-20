Fix for Netlify build error:
"default is not exported by src/App.jsx"

Copy these files into your project and replace existing:
- src/App.jsx
- src/styles.css
- netlify/functions/hubspot-lead.js

Then run:
git add .
git commit -m "Fix App export and production updates"
git push
