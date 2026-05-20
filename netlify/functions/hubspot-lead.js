// Replace netlify/functions/hubspot-lead.js with this

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  try {
    const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
    const { lead, usage, recommendation } = JSON.parse(event.body);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Create Contact
    const contactResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          properties: {
            firstname: lead.name,
            phone: lead.number,
            email: lead.email,
            city: lead.suburb,
            current_provider: lead.currentProvider,
            urgency: lead.urgency,
            business_type: usage.businessType,
            users_required: usage.users,
            handsets_required: usage.handsets,
          },
        }),
      }
    );

    const contact = await contactResponse.json();

    // Create Deal
    const dealResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/deals",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          properties: {
            dealname: `VOIP Quote - ${lead.name}`,
            amount: recommendation.annualEstimate,
            pipeline: "default",
            dealstage: "appointmentscheduled",
            recommended_provider: recommendation.provider,
            ai_match_score: recommendation.aiScore,
            monthly_estimate: recommendation.monthlyEstimate,
            setup_estimate: recommendation.setupEstimate,
          },
        }),
      }
    );

    const deal = await dealResponse.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        contact,
        deal,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
}
