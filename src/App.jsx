// Replace your existing src/App.jsx with this simplified update section changes.

// REMOVE this customer-facing HubSpot message block:
// {hubspotMessage && ( ... )}

// REPLACE WITH:
<p className="successMessage">
  Your comparison is ready below.
</p>

// UPDATE pricing source:
const pricing = {
  "Essential Cloud Voice": {
    base: 24,
    sms: 6,
    ai: 0,
    webchat: 0
  },
  "Growth UC Suite": {
    base: 39,
    sms: 9,
    ai: 12,
    webchat: 8
  },
  "AI Contact Centre Pro": {
    base: 59,
    sms: 12,
    ai: 22,
    webchat: 14
  }
};

// Use pricing values from this object instead of hardcoded calculations.
