import React, { useMemo, useState } from "react";
import {
  Phone,
  MessageSquare,
  Bot,
  Headphones,
  Globe2,
  ShieldCheck,
  Download,
  Brain,
  Star,
  TrendingUp,
  FileText,
  MapPin,
  Zap,
  CheckCircle2
} from "lucide-react";

const providers = [
  {
    name: "Essential Cloud Voice",
    badge: "Best starter plan",
    base: 24,
    handset: 7,
    sms: 6,
    ai: 0,
    webchat: 0,
    voice: 0,
    supportsAi: false,
    supportsWebchat: false,
    supportLevel: 2,
    migrationEase: 9,
    features: ["Unlimited AU calling", "Mobile app", "Voicemail to email", "Call transfer"],
    fit: "Small teams wanting reliable business calling without complex contact centre features."
  },
  {
    name: "Growth UC Suite",
    badge: "Best overall value",
    base: 39,
    handset: 8,
    sms: 9,
    ai: 12,
    webchat: 8,
    voice: 5,
    supportsAi: true,
    supportsWebchat: true,
    supportLevel: 4,
    migrationEase: 8,
    features: ["Call recording", "Business SMS", "IVR menus", "CRM integrations", "Web chat"],
    fit: "Growing teams needing a balanced phone, messaging and customer service platform."
  },
  {
    name: "AI Contact Centre Pro",
    badge: "Best for support teams",
    base: 59,
    handset: 10,
    sms: 12,
    ai: 22,
    webchat: 14,
    voice: 8,
    supportsAi: true,
    supportsWebchat: true,
    supportLevel: 5,
    migrationEase: 7,
    features: ["AI summaries", "Live dashboards", "Advanced queues", "Web chat", "Voice analytics"],
    fit: "Customer-facing teams that need AI, reporting, call analytics and automation."
  }
];

const featureOptions = [
  { key: "sms", label: "Business SMS", icon: MessageSquare, weight: 8 },
  { key: "ai", label: "AI call summaries", icon: Bot, weight: 12 },
  { key: "voice", label: "Advanced voice features", icon: Headphones, weight: 7 },
  { key: "webchat", label: "Website live chat", icon: Globe2, weight: 9 },
  { key: "callRecording", label: "Call recording", icon: ShieldCheck, weight: 6 },
  { key: "ivr", label: "IVR / auto attendant", icon: Phone, weight: 6 },
  { key: "analytics", label: "Reporting dashboards", icon: TrendingUp, weight: 7 },
  { key: "crm", label: "CRM integration", icon: Zap, weight: 7 }
];

const urgencyOptions = ["Today", "This week", "This month", "Just comparing"];
const currentProviderOptions = ["None / new setup", "Telstra", "Optus", "3CX", "RingCentral", "Microsoft Teams Phone", "8x8", "Vonage", "Other"];
const businessTypes = ["Small business", "Sales team", "Support team", "Medical / allied health", "Real estate", "Professional services", "Retail", "Other"];

function currency(value) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0
  }).format(value);
}

function buildRecommendationReason(provider, usageData) {
  if (usageData.features.ai && provider.supportsAi && provider.name.includes("Contact Centre")) {
    return "Strong AI fit because you selected AI, analytics or support-focused features.";
  }
  if (usageData.users <= 10 && provider.name.includes("Essential")) {
    return "Cost-effective match for a smaller team with straightforward calling requirements.";
  }
  if (provider.name.includes("Growth")) {
    return "Balanced recommendation across price, SMS, IVR, CRM, web chat and growth features.";
  }
  return "Recommended based on selected users, handsets, migration complexity and feature fit.";
}

function leadQualityScore(lead, usage) {
  let score = 0;
  if (lead.name) score += 10;
  if (lead.number) score += 15;
  if (lead.suburb) score += 10;
  if (lead.email) score += 10;
  if (lead.urgency === "Today") score += 25;
  if (lead.urgency === "This week") score += 18;
  if (usage.users >= 20) score += 15;
  if (usage.features.ai || usage.features.webchat || usage.features.crm) score += 15;
  return Math.min(score, 100);
}

export default function App() {
  const [usage, setUsage] = useState({
    users: 10,
    handsets: 5,
    businessType: "Small business",
    features: {
      sms: true,
      ai: true,
      voice: true,
      webchat: false,
      callRecording: true,
      ivr: true,
      analytics: false,
      crm: false
    }
  });

  const [lead, setLead] = useState({
    name: "",
    number: "",
    email: "",
    suburb: "",
    urgency: "",
    currentProvider: "",
    notes: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [hubspotStatus, setHubspotStatus] = useState("idle");
  const [hubspotMessage, setHubspotMessage] = useState("");

  const selectedFeatureCount = Object.values(usage.features).filter(Boolean).length;

  const estimates = useMemo(() => {
    const desiredWeights = featureOptions.reduce(
      (total, item) => total + (usage.features[item.key] ? item.weight : 0),
      0
    );

    return providers
      .map((provider) => {
        const featureCosts =
          (usage.features.sms ? provider.sms : 0) +
          (usage.features.ai ? provider.ai : 0) +
          (usage.features.voice ? provider.voice : 0) +
          (usage.features.webchat ? provider.webchat : 0) +
          (usage.features.callRecording ? 4 : 0) +
          (usage.features.ivr ? 5 : 0) +
          (usage.features.analytics ? 7 : 0) +
          (usage.features.crm ? 8 : 0);

        const monthly = usage.users * (provider.base + featureCosts) + usage.handsets * provider.handset;
        const setup = 149 + usage.handsets * 35 + (lead.currentProvider && lead.currentProvider !== "None / new setup" ? 250 : 0);

        let aiScore = 50;
        if (usage.features.ai && provider.supportsAi) aiScore += 20;
        if (usage.features.ai && !provider.supportsAi) aiScore -= 25;
        if (usage.features.webchat && provider.supportsWebchat) aiScore += 12;
        if (usage.features.webchat && !provider.supportsWebchat) aiScore -= 12;
        if (usage.users <= 10 && provider.name.includes("Essential")) aiScore += 12;
        if (usage.users >= 15 && provider.name.includes("Growth")) aiScore += 15;
        if ((usage.businessType.includes("Support") || usage.features.analytics) && provider.name.includes("Contact Centre")) aiScore += 20;
        aiScore += provider.supportLevel * 4 + provider.migrationEase * 2;
        aiScore += Math.round(desiredWeights / 3);
        aiScore = Math.max(1, Math.min(99, aiScore));

        return {
          ...provider,
          monthly,
          setup,
          aiScore,
          annual: monthly * 12,
          reason: buildRecommendationReason(provider, usage)
        };
      })
      .sort((a, b) => b.aiScore - a.aiScore || a.monthly - b.monthly);
  }, [usage, lead.currentProvider]);

  const recommended = estimates[0];
  const formComplete = lead.name.trim() && lead.number.trim() && lead.suburb.trim() && lead.urgency && lead.currentProvider;
  const leadScore = leadQualityScore(lead, usage);

  function updateFeature(key) {
    setUsage((prev) => ({ ...prev, features: { ...prev.features, [key]: !prev.features[key] } }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formComplete) return;

    setSubmitted(true);
    setHubspotStatus("loading");
    setHubspotMessage("Sending lead to HubSpot...");

    const payload = {
      lead,
      usage,
      recommendation: {
        provider: recommended.name,
        aiScore: recommended.aiScore,
        monthlyEstimate: recommended.monthly,
        setupEstimate: recommended.setup,
        annualEstimate: recommended.annual,
        reason: recommended.reason
      },
      comparison: estimates.map((plan) => ({
        provider: plan.name,
        aiScore: plan.aiScore,
        monthlyEstimate: plan.monthly,
        setupEstimate: plan.setup,
        annualEstimate: plan.annual
      })),
      source: "VOIP comparison website"
    };

    try {
      const response = await fetch("/.netlify/functions/hubspot-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "HubSpot submission failed");

      setHubspotStatus("success");
      setHubspotMessage("Lead sent to HubSpot successfully.");
    } catch (error) {
      console.error(error);
      setHubspotStatus("error");
      setHubspotMessage("Lead captured on-screen, but HubSpot did not receive it. Check your Netlify function and token.");
    }
  }

  function generatePdfQuote() {
    if (!submitted) return;

    const selectedFeatures = featureOptions.filter((f) => usage.features[f.key]).map((f) => f.label).join(", ");
    const quoteNumber = `VOIP-${Date.now().toString().slice(-6)}`;

    const html = `
      <html>
        <head>
          <title>${quoteNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; padding: 40px; }
            .header { background: #020617; color: white; padding: 28px; border-radius: 18px; }
            .muted { color: #64748b; }
            .card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; margin-top: 18px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
            h1, h2, h3 { margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border-bottom: 1px solid #e2e8f0; text-align: left; padding: 12px; }
            .price { font-size: 32px; font-weight: 800; }
            .badge { display: inline-block; background: #cffafe; color: #155e75; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="header">
            <p>VOIP Compare Quote</p>
            <h1>${quoteNumber}</h1>
            <p>Prepared for ${lead.name} · ${lead.suburb}</p>
          </div>
          <div class="card grid">
            <div><strong>Phone:</strong><br/>${lead.number}</div>
            <div><strong>Email:</strong><br/>${lead.email || "Not supplied"}</div>
            <div><strong>Current provider:</strong><br/>${lead.currentProvider}</div>
            <div><strong>Urgency:</strong><br/>${lead.urgency}</div>
          </div>
          <div class="card">
            <h2>Requirements</h2>
            <p><strong>Users:</strong> ${usage.users}</p>
            <p><strong>Handsets:</strong> ${usage.handsets}</p>
            <p><strong>Business type:</strong> ${usage.businessType}</p>
            <p><strong>Selected features:</strong> ${selectedFeatures}</p>
          </div>
          <div class="card">
            <span class="badge">AI Recommended</span>
            <h2>${recommended.name}</h2>
            <p>${recommended.fit}</p>
            <p class="price">${currency(recommended.monthly)} / month</p>
            <p class="muted">Estimated setup from ${currency(recommended.setup)} · AI match score ${recommended.aiScore}%</p>
            <p><strong>Why:</strong> ${recommended.reason}</p>
          </div>
          <div class="card">
            <h2>Comparison</h2>
            <table>
              <thead><tr><th>Provider</th><th>AI Match</th><th>Monthly</th><th>Setup</th></tr></thead>
              <tbody>
                ${estimates.map((plan) => `<tr><td>${plan.name}</td><td>${plan.aiScore}%</td><td>${currency(plan.monthly)}</td><td>${currency(plan.setup)}</td></tr>`).join("")}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div className="app">
      <section className="hero">
        <div className="nav">
          <div className="brand">
            <div className="logo"><Phone size={24} /></div>
            <div>
              <strong>VOIP Compare</strong>
              <span>AI-powered business phone quotes</span>
            </div>
          </div>
          <a href="#quote" className="navButton">Get matched</a>
        </div>

        <div className="heroGrid">
          <div>
            <div className="pill">✨ Full production quote flow with AI recommendations</div>
            <h1>Compare VOIP, capture leads and generate instant PDF quotes.</h1>
            <p className="heroText">
              Customers enter users, handsets, current provider and required features. The AI recommendation engine ranks plans by feature fit, migration complexity, support needs and estimated monthly cost.
            </p>
            <div className="heroCards">
              {["Lead capture", "AI scoring", "PDF quotes", "Provider match"].map((item) => (
                <div className="miniCard" key={item}><CheckCircle2 size={18} />{item}</div>
              ))}
            </div>
          </div>

          <div className="panel">
            <p className="eyebrow">Quote builder</p>
            <h2>Build your comparison</h2>
            <div className="two">
              <label>Total users
                <input type="number" min="1" value={usage.users} onChange={(e) => setUsage({ ...usage, users: Number(e.target.value) })} />
              </label>
              <label>Handsets required
                <input type="number" min="0" value={usage.handsets} onChange={(e) => setUsage({ ...usage, handsets: Number(e.target.value) })} />
              </label>
            </div>
            <label>Business type
              <select value={usage.businessType} onChange={(e) => setUsage({ ...usage, businessType: e.target.value })}>
                {businessTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <p className="label">Required features</p>
            <div className="featureGrid">
              {featureOptions.map(({ key, label, icon: Icon }) => (
                <button key={key} type="button" onClick={() => updateFeature(key)} className={usage.features[key] ? "feature active" : "feature"}>
                  <Icon size={18} /> {label}
                </button>
              ))}
            </div>
            <div className="summary">
              <strong>{usage.users} users · {usage.handsets} handsets</strong>
              <span>{selectedFeatureCount} features selected</span>
            </div>
          </div>
        </div>
      </section>

      <section className="quote" id="quote">
        <div className="quoteGrid">
          <div className="panel light">
            <p className="eyebrow">Unlock results</p>
            <h2>Customer details</h2>
            <form onSubmit={handleSubmit}>
              <label>Name
                <input value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} placeholder="Full name" />
              </label>
              <div className="two">
                <label>Phone number
                  <input value={lead.number} onChange={(e) => setLead({ ...lead, number: e.target.value })} placeholder="04xx xxx xxx" />
                </label>
                <label>Email optional
                  <input value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} placeholder="name@business.com.au" />
                </label>
              </div>
              <label>Suburb
                <div className="inputIcon"><MapPin size={18} /><input value={lead.suburb} onChange={(e) => setLead({ ...lead, suburb: e.target.value })} placeholder="e.g. Parramatta" /></div>
              </label>
              <label>Current provider
                <select value={lead.currentProvider} onChange={(e) => setLead({ ...lead, currentProvider: e.target.value })}>
                  <option value="">Select current provider</option>
                  {currentProviderOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label>Urgency
                <select value={lead.urgency} onChange={(e) => setLead({ ...lead, urgency: e.target.value })}>
                  <option value="">Select urgency</option>
                  {urgencyOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label>Notes optional
                <textarea value={lead.notes} onChange={(e) => setLead({ ...lead, notes: e.target.value })} placeholder="Any contract end date, pain points, CRM, number porting or handset needs?" />
              </label>
              <button className="primary" disabled={!formComplete}>Show AI recommendation</button>
            </form>

            <div className="quality">
              <div><strong>Lead quality</strong><strong>{leadScore}%</strong></div>
              <div className="bar"><span style={{ width: `${leadScore}%` }} /></div>
            </div>
          </div>

          <div className="results">
            {!submitted && (
              <div className="empty">
                <Brain size={44} />
                <h2>AI comparison is ready</h2>
                <p>Complete the customer details form to reveal AI-ranked providers, indicative pricing and the PDF quote generator.</p>
              </div>
            )}

            {submitted && (
              <>
                <div className="recommend">
                  <div>
                    <p><Brain size={16} /> AI recommendation generated</p>
                    <h2>{recommended.name}</h2>
                    <span>Prepared for {lead.name} in {lead.suburb}. Current provider: {lead.currentProvider}.</span>
                    {hubspotMessage && <div className={`status ${hubspotStatus}`}>{hubspotMessage}</div>}
                  </div>
                  <button onClick={generatePdfQuote} className="secondary"><Download size={18} /> Generate PDF Quote</button>
                </div>

                <div className="scoreGrid">
                  <div><span>AI match</span><strong>{recommended.aiScore}%</strong></div>
                  <div><span>Monthly estimate</span><strong>{currency(recommended.monthly)}</strong></div>
                  <div><span>Setup estimate</span><strong>{currency(recommended.setup)}</strong></div>
                </div>

                <div className="card white">
                  <h3><Zap size={20} /> AI recommendation engine</h3>
                  <p>{recommended.reason} The score also considers selected features, team size, provider capability, support level and migration ease.</p>
                </div>

                {estimates.map((plan, index) => (
                  <div className={index === 0 ? "plan recommendedPlan" : "plan"} key={plan.name}>
                    <div>
                      <div className="badges">
                        <span>{plan.badge}</span>
                        {index === 0 && <span><Star size={12} /> Recommended</span>}
                      </div>
                      <h3>{plan.name}</h3>
                      <p>{plan.fit}</p>
                      <strong>{plan.reason}</strong>
                      <div className="tags">{plan.features.map((f) => <em key={f}>{f}</em>)}</div>
                    </div>
                    <div className="price">
                      <span>AI match score</span>
                      <strong>{plan.aiScore}%</strong>
                      <span>Estimated monthly</span>
                      <b>{currency(plan.monthly)}</b>
                      <small>Setup from {currency(plan.setup)}</small>
                    </div>
                  </div>
                ))}

                <div className="card white">
                  <h3><FileText size={20} /> Production backend notes</h3>
                  <p>Lead data is submitted to your Netlify Function, which forwards it securely to HubSpot using your private app token.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
