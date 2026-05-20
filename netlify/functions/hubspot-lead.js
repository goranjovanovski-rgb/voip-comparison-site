export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ message: "Method not allowed" }) };
  }

  try {
    const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
    if (!token) throw new Error("Missing HUBSPOT_PRIVATE_APP_TOKEN");

    const { lead, usage, recommendation } = JSON.parse(event.body);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    const contactResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers,
      body: JSON.stringify({
        properties: {
          firstname: lead.name || "",
          phone: lead.number || "",
          email: lead.email || "",
          city: lead.suburb || "",
          current_provider: lead.currentProvider || "",
          urgency: lead.urgency || "",
          business_type: usage.businessType || "",
          users_required: String(usage.users || ""),
          handsets_required: String(usage.handsets || "")
        }
      })
    });

    const contact = await contactResponse.json();

    const dealResponse = await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
      method: "POST",
      headers,
      body: JSON.stringify({
        properties: {
          dealname: `VOIP Quote - ${lead.name || "New Lead"}`,
          amount: String(recommendation.annualEstimate || 0),
          pipeline: "default",
          dealstage: "appointmentscheduled",
          recommended_provider: recommendation.provider || "",
          ai_match_score: String(recommendation.aiScore || ""),
          monthly_estimate: String(recommendation.monthlyEstimate || ""),
          setup_estimate: String(recommendation.setupEstimate || "")
        }
      })
    });

    const deal = await dealResponse.json();

    return { statusCode: 200, body: JSON.stringify({ success: true, contact, deal }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: error.message }) };
  }
}
