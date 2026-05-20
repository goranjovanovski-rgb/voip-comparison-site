export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { lead, usage, recommendation } = req.body;

  const headers = {
    Authorization: `Bearer ${process.env.HUBSPOT_PRIVATE_APP_TOKEN}`,
    "Content-Type": "application/json",
  };

  try {
    const contactRes = await fetch(
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
            hs_lead_status: "NEW",
            current_provider: lead.currentProvider,
          },
        }),
      }
    );

    const contact = await contactRes.json();

    const dealRes = await fetch(
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
          },
        }),
      }
    );

    const deal = await dealRes.json();

    return res.status(200).json({ contact, deal });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
