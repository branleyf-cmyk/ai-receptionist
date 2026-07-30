// ===== WhatsApp AI Sales Assistant with Google Gemini =====
// Uses Gemini AI for intelligent analysis, message generation & conversation
// Falls back to built-in templates if no API key is set

// ===== CONFIG =====
const STORAGE_KEY = 'wa_sales_contacts';
const API_KEY_KEY = 'gemini_api_key';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// ===== DATA LAYER =====
const getContacts = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};
const saveContacts = (c) => localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
const getApiKey = () => localStorage.getItem(API_KEY_KEY) || '';
const setApiKey = (k) => localStorage.setItem(API_KEY_KEY, k.trim());

// ===== GEMINI API CALL =====
async function askGemini(prompt, maxTokens = 1024) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const res = await fetch(GEMINI_URL + '?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens }
      })
    });
    if (!res.ok) { console.warn('Gemini error:', res.status); return null; }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (e) {
    console.warn('Gemini call failed:', e.message);
    return null;
  }
}

// ===== INDUSTRY KNOWLEDGE (used when no API key or as context) =====
const INDUSTRIES = {
  dental: {
    name: 'Dental Practice',
    whatTheyDo: 'Provide dental care services including routine check-ups, cleanings, fillings, cosmetic dentistry, and emergency dental work.',
    services: ['General dentistry & examinations', 'Teeth whitening & cosmetic procedures', 'Root canals & extractions', 'Dental implants & orthodontics', 'Emergency dental care'],
    challenges: ['Scheduling conflicts and no-shows eat up valuable chair time', 'New patient enquiries often come after hours when desks are closed', 'Competition from other local practices means leads must be captured fast', 'Staff spend time on phones instead of with patients'],
    benefits: 'An AI receptionist answers every call instantly, books appointments directly into your system, and follows up with patients who missed calls.'
  },
  medical: {
    name: 'Medical / Clinic',
    whatTheyDo: 'Deliver healthcare services to patients, managing appointments, follow-ups, and patient enquiries.',
    services: ['General consultations', 'Specialist referrals', 'Chronic disease management', 'Lab work & diagnostics', 'Patient follow-ups'],
    challenges: ['High patient volumes mean many calls go unanswered during clinic hours', 'After-hours enquiries pile up overnight', 'Staff are stretched between patient care and admin', 'Missed follow-ups lead to poor patient outcomes'],
    benefits: 'Your AI receptionist handles every patient call 24/7, books appointments, sends reminders, and ensures no enquiry falls through the cracks.'
  },
  beauty: {
    name: 'Beauty Salon / Spa',
    whatTheyDo: 'Offer beauty and wellness services including hair, nails, skincare, massages, and spa treatments.',
    services: ['Hair styling & colouring', 'Manicures & pedicures', 'Facials & skincare', 'Massage therapy', 'Bridal & event packages'],
    challenges: ['Peak booking times overwhelm the front desk', 'Clients calling after hours can not book appointments', 'Competition is fierce - clients move to the salon that answers first', 'Staff are hands-on with clients and cannot answer phones'],
    benefits: 'Your AI receptionist books every client instantly, even at midnight, sends appointment reminders to reduce no-shows, and upsells packages.'
  },
  restaurant: {
    name: 'Restaurant',
    whatTheyDo: 'Serve food and drinks to diners, handling reservations, takeout orders, and catering enquiries.',
    services: ['Dine-in service', 'Takeaway & delivery', 'Private event catering', 'Group bookings', 'Special menu requests'],
    challenges: ['Lunch and dinner rushes make it impossible to answer every call', 'Lost reservation enquiries mean lost revenue', 'Staff cannot juggle the floor, kitchen, and phones', 'Catering enquiries need quick responses to win the booking'],
    benefits: 'An AI receptionist takes every reservation call, handles catering enquiries instantly, and captures orders even during the busiest service.'
  },
  fitness: {
    name: 'Fitness / Gym',
    whatTheyDo: 'Provide fitness services including gym access, personal training, group classes, and wellness programmes.',
    services: ['Gym memberships', 'Personal training', 'Group fitness classes', 'Nutrition coaching', 'Corporate wellness'],
    challenges: ['Prospects enquiring about memberships need instant answers or they walk away', 'High staff turnover means inconsistent phone handling', 'Trial sign-ups need prompt follow-up to convert', 'Evening peak hours make phones ring off the hook'],
    benefits: 'Your AI receptionist answers every membership enquiry, books trial sessions, and follows up with prospects around the clock.'
  },
  'home-services': {
    name: 'Home Services',
    whatTheyDo: 'Provide home service solutions like plumbing, electrical work, cleaning, or repairs.',
    services: ['Emergency repairs', 'Routine maintenance', 'Installations & upgrades', 'Inspections & quotes', 'Service contracts'],
    challenges: ['Emergency calls come in at all hours and missing them means losing to competitors', 'Quotes need fast turnaround or customers hire someone else', 'Owners are often on-site and cannot answer phones', 'Seasonal demand spikes overwhelm small teams'],
    benefits: 'Your AI receptionist captures every emergency call, books assessments instantly, and follows up on quote requests.'
  },
  'real-estate': {
    name: 'Real Estate / Rental',
    whatTheyDo: 'Handle property sales, rentals, and management services for landlords and tenants.',
    services: ['Property sales', 'Rental management', 'Tenant screening', 'Property valuations', 'Lease renewals'],
    challenges: ['Property enquiries come in 24/7 especially after work hours', 'Missing a serious buyer call can mean losing a multi-million sale', 'Agents are in showings and cannot be on the phone', 'Rental applications need fast processing'],
    benefits: 'Your AI receptionist qualifies every lead, books viewings, and captures buyer details instantly.'
  },
  legal: {
    name: 'Law Firm',
    whatTheyDo: 'Provide legal services across various practice areas to individuals and businesses.',
    services: ['Consultations & case reviews', 'Contract drafting', 'Litigation & dispute resolution', 'Conveyancing & property law', 'Estate planning'],
    challenges: ['Potential clients call multiple firms - the first to respond wins', 'Consultation bookings during business hours are chaotic', 'Billing inquiries take up reception time', 'After-hours calls from distressed clients need acknowledgment'],
    benefits: 'An AI receptionist captures every potential client instantly, qualifies their matter, and books consultations.'
  },
  retail: {
    name: 'Retail Store',
    whatTheyDo: 'Sell products directly to consumers in a physical or online storefront.',
    services: ['Product sales', 'Special orders', 'Lay-bys & financing', 'Gift registry', 'Loyalty programmes'],
    challenges: ['Floor staff cannot answer phones during rushes', 'Product availability queries waste time', 'Online competition means in-store service must be excellent', 'After-hours enquiries disappear if not answered'],
    benefits: 'Your AI receptionist answers product queries, checks stock, books consultations, and captures sales 24/7.'
  },
  auto: {
    name: 'Auto Mechanic / Dealer',
    whatTheyDo: 'Provide vehicle repairs, servicing, maintenance, and vehicle sales.',
    services: ['Vehicle servicing & repairs', 'Diagnostics & inspections', 'Tyre replacement', 'Vehicle sales', 'Service plans & maintenance contracts'],
    challenges: ['Mechanics are under vehicles and cannot answer phones', 'Customers compare quotes and the fastest response wins', 'Emergency breakdown calls come in anytime', 'Booking systems get overwhelmed during peak season'],
    benefits: 'Your AI receptionist takes every booking call, provides quotes for common services, and follows up with pending enquiries.'
  },
  education: {
    name: 'Education / Tutoring',
    whatTheyDo: 'Provide educational services including tutoring, courses, and skills training.',
    services: ['One-on-one tutoring', 'Group classes', 'Online courses', 'Exam preparation', 'Skills workshops'],
    challenges: ['Parents and students enquire outside office hours', 'Trial lessons need prompt booking and confirmation', 'Class schedules change frequently and need real-time updates', 'Instructors are teaching and cannot answer phones'],
    benefits: 'Your AI receptionist handles every enrolment enquiry, books trial sessions, and sends class reminders automatically.'
  },
  tech: {
    name: 'Tech / IT Services',
    whatTheyDo: 'Provide technology solutions including IT support, software development, and managed services.',
    services: ['IT support & helpdesk', 'Software development', 'Cloud solutions', 'Cybersecurity services', 'Managed IT services'],
    challenges: ['Clients need immediate responses for IT emergencies', 'Project scoping calls take up senior staff time', 'Prospects expect fast quotes in a competitive market', 'Support tickets pile up outside business hours'],
    benefits: 'Your AI receptionist captures every lead, qualifies technical needs, and books discovery calls.'
  },
  consulting: {
    name: 'Consulting',
    whatTheyDo: 'Offer professional consulting services across business, financial, or management domains.',
    services: ['Strategy consulting', 'Financial advisory', 'Business coaching', 'Process optimisation', 'Market research'],
    challenges: ['High-value prospects evaluate multiple consultants and responsiveness wins', 'Discovery calls are hard to schedule across busy calendars', 'Follow-ups on proposals often slip through the cracks', 'Small teams juggle client delivery and business development'],
    benefits: 'An AI receptionist captures every enquiry instantly, qualifies the lead, and books discovery calls.'
  },
  other: {
    name: 'Business',
    whatTheyDo: 'Operate a business that serves customers and needs to manage enquiries, bookings, and sales.',
    services: ['Customer service & enquiries', 'Booking & scheduling', 'Sales & follow-ups', 'Lead capture', 'General support'],
    challenges: ['Missed calls mean missed revenue', 'After-hours enquiries are lost', 'Staff cannot balance core work and phones', 'Leads go cold when follow-ups are delayed'],
    benefits: 'Your AI receptionist answers every call, captures leads, books appointments, and follows up automatically.'
  }
};

const getIndustry = (type) => INDUSTRIES[type] || INDUSTRIES.other;

// ===== BUSINESS ANALYSIS =====
async function analyzeBusiness(data) {
  const industry = getIndustry(data.businessType);

  // If no notes or website, use template
  if (!data.notes && !data.websiteUrl) {
    return generateTemplateAnalysis(data, industry);
  }

  // Try Gemini if API key exists
  const apiKey = getApiKey();
  if (apiKey) {
    const geminiAnalysis = await getGeminiAnalysis(data);
    if (geminiAnalysis) return geminiAnalysis;
  }

  // Fallback to template
  return generateTemplateAnalysis(data, industry);
}

async function getGeminiAnalysis(data) {
  const industry = getIndustry(data.businessType);
  const siteContext = data.websiteUrl ? `\n\nWebsite: ${data.websiteUrl}` : '';
  const notesContext = data.notes ? `\n\nAdditional notes: ${data.notes}` : '';

  const prompt = `Analyze this business for an AI receptionist sales pitch:

Business: ${data.businessName}
Industry: ${industry.name}${siteContext}${notesContext}

Respond with JSON:
{
  "whatTheyDo": "1-2 sentence description of what they do",
  "services": ["service 1", "service 2", "service 3", "service 4"],
  "challenges": ["challenge 1", "challenge 2", "challenge 3", "challenge 4"],
  "benefits": "How AI receptionist specifically helps this business (2-3 sentences)"
}

Focus on practical, specific insights. Be concise.`;

  const response = await askGemini(prompt, 400);
  if (!response) return null;

  try {
    // Try to parse JSON, handling markdown code blocks
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.warn('Failed to parse Gemini analysis:', e);
    return null;
  }
}

function generateTemplateAnalysis(data, industry) {
  return {
    whatTheyDo: data.website ? `${data.businessName} operates in the ${industry.name.toLowerCase()} sector.` : industry.whatTheyDo,
    services: industry.services,
    challenges: industry.challenges,
    benefits: industry.benefits
  };
}

// ===== SALES STRATEGY GENERATION =====
async function generateSalesStrategy(data, analysis) {
  const apiKey = getApiKey();
  if (apiKey) {
    const geminiStrategy = await getGeminiStrategy(data, analysis);
    if (geminiStrategy) return geminiStrategy;
  }

  // Template fallback
  return generateTemplateStrategy(data, analysis);
}

async function getGeminiStrategy(data, analysis) {
  const prompt = `Create a WhatsApp sales strategy for this business:

Business: ${data.businessName}
Analysis: ${JSON.stringify(analysis)}

Respond with JSON array of 5 strategy points:
[
  "Strategy point 1",
  "Strategy point 2",
  "Strategy point 3",
  "Strategy point 4",
  "Strategy point 5"
]

Each point should be 1 sentence, actionable, and specific to this business. Focus on:
- Opening line
- Pain point to highlight
- Key benefit to emphasize
- Objection handling
- Call to action`;

  const response = await askGemini(prompt, 300);
  if (!response) return null;

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;
    const strategies = JSON.parse(jsonMatch[0]);
    if (Array.isArray(strategies) && strategies.length >= 3) {
      return strategies.slice(0, 5);
    }
  } catch (e) {
    console.warn('Failed to parse Gemini strategy:', e);
  }
  return null;
}

function generateTemplateStrategy(data, analysis) {
  return [
    `Lead with empathy: ${data.businessName} likely struggles with ${analysis.challenges[0].toLowerCase()}`,
    `Highlight the ${analysis.services[0]} angle - connect AI receptionist value directly to their core service offering`,
    `Address the biggest pain: staff time wasted on phones instead of ${data.businessType === 'home-services' ? 'on-site work' : 'customer-facing tasks'}`,
    `Use social proof: mention similar businesses in their industry who saw 30-40% increase in bookings after switching to AI`,
    `Offer a low-risk demo: "Can I show you how it works in a 5-minute WhatsApp call?"`
  ];
}

// ===== WHATSAPP MESSAGE GENERATION =====
async function generateWhatsAppMessage(data, analysis, strategy) {
  const apiKey = getApiKey();
  if (apiKey) {
    const geminiMessage = await getGeminiMessage(data, analysis, strategy);
    if (geminiMessage) return geminiMessage;
  }

  // Template fallback
  return generateTemplateMessage(data, analysis, strategy);
}

async function getGeminiMessage(data, analysis, strategy) {
  const contactName = data.contactPerson || 'there';
  const industry = getIndustry(data.businessType);

  const prompt = `Write a WhatsApp sales message. Be friendly, professional, conversational. Use emojis naturally (2-4 total).

To: ${data.contactPerson || 'Business Owner'}
Business: ${data.businessName} (${industry.name})
Opening: ${strategy[0]}
Pain point: ${strategy[1]}
Key benefit: ${strategy[2]}

Requirements:
- Start with a warm greeting using their name if provided
- 120-160 words total
- Natural, conversational tone (not salesy)
- Ask 1-2 questions to understand their current process
- Include 1-2 relevant benefits
- End with soft CTA: ask if they're open to a 5-minute demo
- NO mention of being an AI (this is a real sales message)
- NO pricing

Write just the message, no explanation.`;

  const response = await askGemini(prompt, 250);
  if (response && response.length > 50) {
    return response.trim();
  }
  return null;
}

function generateTemplateMessage(data, analysis, strategy) {
  const greeting = data.contactPerson ? `Hi ${data.contactPerson}! 👋\n\n` : 'Hi there! 👋\n\n';
  const industry = getIndustry(data.businessType);

  const opening = strategy[0];
  const painPoint = strategy[1];
  const benefit = strategy[2];

  const body = `I run a company that helps ${industry.name.toLowerCase()} businesses like ${data.businessName} never miss a customer call again.

Quick question - when customers call outside business hours or when you're busy, how do you currently handle those enquiries?

I ask because ${data.businessName} might be losing leads to voicemail right now. Our AI receptionist answers every call instantly, 24/7, books appointments directly into your calendar, and sends reminders to reduce no-shows.

${industry.name} businesses using it typically see a 30% increase in bookings within the first month.

Would you be open to a quick 5-minute demo to see how it works?`;

  return greeting + body;
}

// ===== FOLLOW-UP SUGGESTIONS =====
async function generateFollowUps(data, analysis) {
  const apiKey = getApiKey();
  if (apiKey) {
    const geminiFollowUps = await getGeminiFollowUps(data, analysis);
    if (geminiFollowUps) return geminiFollowUps;
  }

  return generateTemplateFollowUps(data, analysis);
}

async function getGeminiFollowUps(data, analysis) {
  const prompt = `Generate 4 WhatsApp follow-up messages for this business:

Business: ${data.businessName}
Industry: ${getIndustry(data.businessType).name}
Last message: ${analysis.benefits}

Respond with JSON array:
[
  {"timing": "2 days", "message": "follow-up text"},
  {"timing": "5 days", "message": "follow-up text"},
  {"timing": "1 week", "message": "follow-up text"},
  {"timing": "2 weeks", "message": "follow-up text"}
]

Each message should be 20-30 words, friendly, and offer new value (case study, quick demo, free audit, etc.).`;

  const response = await askGemini(prompt, 300);
  if (!response) return null;

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.warn('Failed to parse Gemini follow-ups:', e);
    return null;
  }
}

function generateTemplateFollowUps(data, analysis) {
  return [
    { timing: '2 days', message: `Hi! Just checking if you had a chance to think about the AI receptionist demo. Happy to answer any questions! 😉` },
    { timing: '5 days', message: `Quick thought - I've been working with similar businesses and they're seeing 30% more bookings. Want me to share a quick case study?` },
    { timing: '1 week', message: `Running a quick analysis of missed calls in your industry. Happy to share what I find for ${data.businessName} if you're interested!` },
    { timing: '2 weeks', message: `Last follow-up from me! If timing isn't right, no worries. But if you want to see how it works, I can show you in 5 minutes. Just say the word 😊` }
  ];
}

// ===== FORM HANDLER =====
function handleFormSubmit(e) {
  e.preventDefault();

  const data = {
    businessName: document.getElementById('businessName').value.trim(),
    contactPerson: document.getElementById('contactPerson').value.trim(),
    phoneNumber: document.getElementById('phoneNumber').value.trim(),
    websiteUrl: document.getElementById('websiteUrl').value.trim(),
    businessType: document.getElementById('businessType').value,
    notes: document.getElementById('notes').value.trim()
  };

  if (!data.businessName || !data.phoneNumber || !data.businessType) {
    alert('Please fill in Business Name, Phone Number, and Business Type');
    return;
  }

  // Show loading state
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = getApiKey() ? 'Analysing with AI...' : 'Generating...';
  btn.disabled = true;

  // Hide previous results
  document.getElementById('analysisSection').style.display = 'none';

  // Run async analysis
  (async () => {
    // Step 1: Analyze business
    const analysis = await analyzeBusiness(data);
    window.currentAnalysis = analysis;

    // Step 2: Generate strategy
    const strategy = await generateSalesStrategy(data, analysis);
    window.currentStrategy = strategy;

    // Render analysis
    renderAnalysis(data, analysis);
    renderStrategy(strategy);

    // Step 3: Generate message (can run in parallel)
    const message = await generateWhatsAppMessage(data, analysis, strategy);
    window.currentMessage = message;
    document.getElementById('messageTextarea').value = message;

    // Step 4: Generate follow-ups
    const followUps = await generateFollowUps(data, analysis);
    window.currentFollowUps = followUps;
    renderFollowUps(followUps);

    // Show results
    document.getElementById('analysisSection').style.display = 'block';

    // Reset button
    btn.textContent = originalText;
    btn.disabled = false;
  })();
}

// ===== DISPLAY FUNCTIONS =====
function renderAnalysis(data, analysis) {
  const industry = getIndustry(data.businessType);

  let html = `<h3>${data.businessName}</h3>`;
  if (data.contactPerson) html += `<p style="opacity:0.7">Contact: ${data.contactPerson}</p>`;
  html += `<p><strong>Industry:</strong> ${industry.name}</p>`;

  html += `<div style="margin:1.5rem 0"><h4 style="margin-bottom:0.75rem">📋 What They Do</h4><p>${analysis.whatTheyDo}</p></div>`;

  html += `<div style="margin:1.5rem 0"><h4 style="margin-bottom:0.75rem">🛠️ Services</h4><ul style="margin:0;padding-left:1.25rem">`;
  analysis.services.forEach(s => html += `<li style="margin-bottom:0.4rem">${s}</li>`);
  html += `</ul></div>`;

  html += `<div style="margin:1.5rem 0"><h4 style="margin-bottom:0.75rem">⚠️ Challenges</h4><ul style="margin:0;padding-left:1.25rem">`;
  analysis.challenges.forEach(c => html += `<li style="margin-bottom:0.4rem">${c}</li>`);
  html += `</ul></div>`;

  html += `<div style="margin:1.5rem 0; padding:1rem; background:rgba(0,255,136,0.05); border-left:3px solid #00ff88; border-radius:6px"><h4 style="margin-bottom:0.75rem; margin-top:0">💡 How AI Receptionist Helps</h4><p style="margin:0">${analysis.benefits}</p></div>`;

  document.getElementById('analysisContent').innerHTML = html;
}

function renderStrategy(strategy) {
  const html = strategy.map((s, i) => `<div style="display:flex;gap:0.75rem;margin-bottom:0.75rem"><span style="color:#00ff88;font-weight:bold">${i + 1}.</span><span>${s}</span></div>`).join('');
  document.getElementById('strategyContent').innerHTML = html;
}

function renderFollowUps(followUps) {
  const html = followUps.map(f => `
    <div style="margin-bottom:1rem;padding:0.75rem;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.08)">
      <div style="font-size:0.85rem;color:#00ff88;margin-bottom:0.4rem;font-weight:600">⏰ ${f.timing}</div>
      <div style="font-size:0.95rem;line-height:1.5">${f.message}</div>
    </div>
  `).join('');
  document.getElementById('followUpsContent').innerHTML = html;
}

// ===== CONTACT MANAGEMENT =====
function saveContact() {
  if (!window.currentMessage) {
    alert('Please analyze a business first');
    return;
  }

  const data = {
    businessName: document.getElementById('businessName').value.trim(),
    contactPerson: document.getElementById('contactPerson').value.trim(),
    phoneNumber: document.getElementById('phoneNumber').value.trim(),
    notes: document.getElementById('notes').value.trim()
  };

  const summary = window.currentMessage.substring(0, 150) + (window.currentMessage.length > 150 ? '...' : '');

  const contact = {
    businessName: data.businessName,
    contactPerson: data.contactPerson,
    phoneNumber: data.phoneNumber,
    notes: data.notes,
    messageSummary: summary,
    objections: '',
    interestLevel: 'Medium',
    followUpDate: '',
    status: 'new',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const contacts = getContacts();
  contacts.unshift(contact);
  saveContacts(contacts);

  alert('✅ Contact saved! View your contacts in the CRM section below.');

  // Scroll to CRM
  document.getElementById('crmSection').scrollIntoView({ behavior: 'smooth' });
}

// ===== CRM RENDERING =====
function renderContacts() {
  const contacts = getContacts();

  if (contacts.length === 0) {
    document.getElementById('contactsList').innerHTML = '<div style="text-align:center;padding:3rem 1rem;opacity:0.5">No contacts yet. Analyze a business and save it to start building your pipeline.</div>';
    updateStats(contacts);
    return;
  }

  const html = contacts.map((c, i) => {
    const statusColors = { new: '#3b82f6', contacted: '#f59e0b', interested: '#10b981', 'not-interested': '#ef4444', converted: '#8b5cf6' };
    const color = statusColors[c.status] || '#6366f1';

    return `
      <div class="contact-card" onclick="openContactModal(${i})" style="padding:1.25rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;cursor:pointer;transition:all 0.2s;border-left:4px solid ${color}">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem">
          <div>
            <h4 style="margin:0 0 0.35rem 0;font-size:1.05rem">${c.businessName}</h4>
            ${c.contactPerson ? `<div style="font-size:0.9rem;opacity:0.7">${c.contactPerson}</div>` : ''}
          </div>
          <span style="font-size:0.75rem;padding:0.25rem 0.75rem;background:${color}20;color:${color};border-radius:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">${c.status}</span>
        </div>
        <div style="font-size:0.85rem;opacity:0.6;margin-bottom:0.5rem">📞 ${c.phoneNumber}</div>
        <div style="font-size:0.85rem;line-height:1.5;opacity:0.85;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${c.messageSummary}</div>
      </div>
    `;
  }).join('');

  document.getElementById('contactsList').innerHTML = html;
  updateStats(contacts);
}

function updateStats(contacts) {
  document.getElementById('stat-total').textContent = contacts.length;

  const interested = contacts.filter(c => c.status === 'interested').length;
  document.getElementById('stat-interested').textContent = interested;

  const converted = contacts.filter(c => c.status === 'converted').length;
  document.getElementById('stat-converted').textContent = converted;
}

function openContactModal(index) {
  const contacts = getContacts();
  const contact = contacts[index];
  if (!contact) return;

  const statusOptions = ['new', 'contacted', 'interested', 'not-interested', 'converted'];
  const statusButtons = statusOptions.map(s =>
    `<button type="button" onclick="updateStatus(${index}, '${s}')" style="flex:1;padding:0.5rem;background:${contact.status === s ? '#6366f1' : 'rgba(255,255,255,0.08)'};border:1px solid ${contact.status === s ? '#6366f1' : 'rgba(255,255,255,0.15)'};border-radius:6px;cursor:pointer;font-size:0.85rem;transition:all 0.15s">${s}</button>`
  ).join('');

  document.getElementById('contactModal').innerHTML = `
    <div style="padding:2rem;background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:16px;max-width:600px;width:90%;max-height:90vh;overflow-y:auto;position:relative">
      <button type="button" onclick="closeModal()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;color:rgba(255,255,255,0.6);cursor:pointer;font-size:1.5rem">×</button>

      <h3 style="margin:0 0 0.5rem 0">${contact.businessName}</h3>
      ${contact.contactPerson ? `<div style="opacity:0.7;margin-bottom:1rem">Contact: ${contact.contactPerson}</div>` : ''}

      <div style="margin:1.5rem 0">
        <label style="display:block;font-size:0.85rem;margin-bottom:0.5rem;opacity:0.8">📞 Phone Number</label>
        <div style="padding:0.75rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px">${contact.phoneNumber}</div>
      </div>

      ${contact.notes ? `
      <div style="margin:1.5rem 0">
        <label style="display:block;font-size:0.85rem;margin-bottom:0.5rem;opacity:0.8">📝 Notes</label>
        <div style="padding:0.75rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;line-height:1.6">${contact.notes}</div>
      </div>
      ` : ''}

      <div style="margin:1.5rem 0">
        <label style="display:block;font-size:0.85rem;margin-bottom:0.5rem;opacity:0.8">💬 Message Summary</label>
        <div style="padding:0.75rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;line-height:1.6">${contact.messageSummary}</div>
      </div>

      <div style="margin:1.5rem 0">
        <label style="display:block;font-size:0.85rem;margin-bottom:0.5rem;opacity:0.8">🚫 Objections Raised</label>
        <textarea id="objectionsInput" placeholder="Any objections during the conversation..." style="width:100%;padding:0.75rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:white;resize:vertical;min-height:60px">${contact.objections || ''}</textarea>
      </div>

      <div style="margin:1.5rem 0">
        <label style="display:block;font-size:0.85rem;margin-bottom:0.5rem;opacity:0.8">📊 Interest Level</label>
        <select id="interestLevelSelect" style="width:100%;padding:0.75rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:white">
          <option value="Low" ${contact.interestLevel === 'Low' ? 'selected' : ''}>Low</option>
          <option value="Medium" ${contact.interestLevel === 'Medium' ? 'selected' : ''}>Medium</option>
          <option value="High" ${contact.interestLevel === 'High' ? 'selected' : ''}>High</option>
        </select>
      </div>

      <div style="margin:1.5rem 0">
        <label style="display:block;font-size:0.85rem;margin-bottom:0.5rem;opacity:0.8">📅 Follow-up Date</label>
        <input type="date" id="followUpDateInput" value="${contact.followUpDate || ''}" style="width:100%;padding:0.75rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:white">
      </div>

      <div style="margin:1.5rem 0">
        <label style="display:block;font-size:0.85rem;margin-bottom:0.75rem;opacity:0.8">✓ Status</label>
        <div style="display:flex;gap:0.5rem">${statusButtons}</div>
      </div>

      <div style="display:flex;gap:0.75rem;margin-top:2rem">
        <button type="button" onclick="updateContact(${index})" style="flex:1;padding:0.875rem;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;color:white;border-radius:10px;cursor:pointer;font-weight:600;transition:all 0.2s">💾 Update</button>
        <button type="button" onclick="deleteContact(${index})" style="padding:0.875rem 1.5rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#ef4444;border-radius:10px;cursor:pointer;font-weight:600;transition:all 0.2s">🗑️</button>
      </div>
    </div>
  `;

  document.getElementById('contactModal').style.display = 'flex';
}

function updateStatus(index, status) {
  const contacts = getContacts();
  contacts[index].status = status;
  contacts[index].updatedAt = Date.now();
  saveContacts(contacts);
  openContactModal(index); // Re-render modal
  renderContacts();
}

function updateContact(index) {
  const contacts = getContacts();

  contacts[index].objections = document.getElementById('objectionsInput').value;
  contacts[index].interestLevel = document.getElementById('interestLevelSelect').value;
  contacts[index].followUpDate = document.getElementById('followUpDateInput').value;
  contacts[index].updatedAt = Date.now();

  saveContacts(contacts);
  renderContacts();
  closeModal();
  alert('✅ Contact updated!');
}

function deleteContact(index) {
  if (!confirm('Delete this contact?')) return;

  const contacts = getContacts();
  contacts.splice(index, 1);
  saveContacts(contacts);
  renderContacts();
  closeModal();
}

function closeModal() {
  document.getElementById('contactModal').style.display = 'none';
}

// ===== UTILITY =====
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ===== SEARCH & FILTER =====
function filterContacts() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const statusFilter = document.getElementById('filterSelect').value;
  const contacts = getContacts();

  const filtered = contacts.filter(c => {
    const matchesSearch = c.businessName.toLowerCase().includes(searchTerm) ||
                         (c.contactPerson && c.contactPerson.toLowerCase().includes(searchTerm)) ||
                         c.phoneNumber.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    document.getElementById('contactsList').innerHTML = '<div style="text-align:center;padding:3rem 1rem;opacity:0.5">No contacts match your filter</div>';
    return;
  }

  const statusColors = { new: '#3b82f6', contacted: '#f59e0b', interested: '#10b981', 'not-interested': '#ef4444', converted: '#8b5cf6' };

  const html = filtered.map((c, i) => {
    const realIndex = contacts.indexOf(c);
    const color = statusColors[c.status] || '#6366f1';

    return `
      <div class="contact-card" onclick="openContactModal(${realIndex})" style="padding:1.25rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;cursor:pointer;transition:all 0.2s;border-left:4px solid ${color}">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem">
          <div>
            <h4 style="margin:0 0 0.35rem 0;font-size:1.05rem">${c.businessName}</h4>
            ${c.contactPerson ? `<div style="font-size:0.9rem;opacity:0.7">${c.contactPerson}</div>` : ''}
          </div>
          <span style="font-size:0.75rem;padding:0.25rem 0.75rem;background:${color}20;color:${color};border-radius:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">${c.status}</span>
        </div>
        <div style="font-size:0.85rem;opacity:0.6;margin-bottom:0.5rem">📞 ${c.phoneNumber}</div>
        <div style="font-size:0.85rem;line-height:1.5;opacity:0.85;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${c.messageSummary}</div>
      </div>
    `;
  }).join('');

  document.getElementById('contactsList').innerHTML = html;
}

function resetFilter() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterSelect').value = 'all';
  renderContacts();
}

// ===== EXPORT =====
function exportContacts() {
  const contacts = getContacts();
  if (contacts.length === 0) {
    alert('No contacts to export');
    return;
  }

  const csv = [
    ['Business Name', 'Contact Person', 'Phone', 'Status', 'Interest', 'Objections', 'Follow-up Date', 'Message Summary', 'Notes', 'Created'].join(','),
    ...contacts.map(c => [
      `"${c.businessName}"`,
      `"${c.contactPerson || ''}"`,
      `"${c.phoneNumber}"`,
      c.status,
      c.interestLevel,
      `"${(c.objections || '').replace(/"/g, '""')}"`,
      c.followUpDate || '',
      `"${(c.messageSummary || '').replace(/"/g, '""')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
      new Date(c.createdAt).toISOString()
    ].join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sales-contacts-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Form submission
  document.getElementById('salesForm').addEventListener('submit', handleFormSubmit);

  // Search and filter
  document.getElementById('searchInput').addEventListener('input', filterContacts);
  document.getElementById('filterSelect').addEventListener('change', filterContacts);

  // Load contacts
  renderContacts();
});
