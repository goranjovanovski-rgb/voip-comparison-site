export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Method not allowed" })
    };
  }

  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Missing HUBSPOT_PRIVATE_APP_TOKEN in Netlify environment variables" })
    };
  }

  try {
    const { lead, usage, recommendation } = JSON.parse(event.body || "{}");

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    const contactProperties = {
      firstname: lead.name || "",
      phone: lead.number || "",
      email: lead.email || "",
      city: lead.suburb || "",
      hs_lead_status: "NEW"
    };

    const contactRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers,
      body: JSON.stringify({ properties: contactProperties })
    });

    const contact = await contactRes.json();
    if (!contactRes.ok) {
      return {
        statusCode: contactRes.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "HubSpot contact creation failed", details: contact })
      };
    }

    const dealProperties = {
      dealname: `VOIP Quote - ${lead.name || "New Lead"}`,
      amount: String(recommendation?.annualEstimate || 0),
      pipeline: "default",
      dealstage: "appointmentscheduled",
      description: [
        `Current provider: ${lead.currentProvider || ""}`,
        `Urgency: ${lead.urgency || ""}`,
        `Users: ${usage?.users || ""}`,
        `Handsets: ${usage?.handsets || ""}`,
        `AI recommendation: ${recommendation?.provider || ""}`,
        `AI match score: ${recommendation?.aiScore || ""}%`,
        `Notes: ${lead.notes || ""}`
      ].join("\\n")
    };

    const dealRes = await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
      method: "POST",
      headers,
      body: JSON.stringify({ properties: dealProperties })
    });

    const deal = await dealRes.json();
    if (!dealRes.ok) {
      return {
        statusCode: dealRes.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "HubSpot deal creation failed", details: deal })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, deal })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: error.message })
    };
  }
}
