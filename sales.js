// =========================================================
// WhatsApp AI Sales Assistant — Main JS
// Integrates Google Gemini AI (optional) + template fallback
// =========================================================

// ===== CONFIG =====
const STORAGE_KEY = 'wa_sales_contacts';
const API_KEY_STORAGE = 'gemini_api_key';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const DEFAULT_GEMINI_KEY = 'AIzaSyB7JdVh8bJv5fGpZ9vZ2qX3rW6cE7tY1uM';

// ===== DATA LAYER =====
function getContacts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveContacts(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
function getApiKey() { return localStorage.getItem(API_KEY_STORAGE) || DEFAULT_GEMINI_KEY; }
function setApiKey(key) { localStorage.setItem(API_KEY_STORAGE, key.trim()); }

// ===== HELPERS =====
const $ = (id) => document.getElementById(id);
const genId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

function showToast(msg) {
  const existing = document.getElementById('site-toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.id = 'site-toast';
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;padding:1rem 1.5rem;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border-radius:12px;font-size:0.9rem;font-weight:600;z-index:10000;box-shadow:0 8px 32px rgba(99,102,241,0.4);animation:slideUp .3s ease;max-width:400px';
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ===== INDUSTRY KNOWLEDGE =====
const INDUSTRIES = {
  dental: {
    name: 'Dental Practice', emoji: '🦷',
    whatTheyDo: 'Provide dental care services including routine check-ups, cleanings, fillings, cosmetic dentistry, and emergency dental work.',
    services: ['General dentistry & examinations', 'Teeth whitening & cosmetic procedures', 'Root canals & extractions', 'Dental implants & orthodontics', 'Emergency dental care'],
    challenges: ['Scheduling conflicts and no-shows eat up valuable chair time', 'New patient enquiries often come after hours when desks are closed', 'Competition from other local practices means leads must be captured fast', 'Staff spend more time on phones instead of with patients'],
    benefits: 'An AI receptionist answers every call instantly, books appointments directly into your system, sends reminders to reduce no-shows, and follows up with patients who missed calls.'
  },
  medical: {
    name: 'Medical Practice', emoji: '🏥',
    whatTheyDo: 'Deliver healthcare services to patients, managing appointments, follow-ups, and patient enquiries.',
    services: ['General consultations', 'Specialist referrals', 'Chronic disease management', 'Lab work & diagnostics', 'Patient follow-ups'],
    challenges: ['High patient volumes mean many calls go unanswered', 'After-hours enquiries pile up overnight', 'Staff are stretched between patient care and admin', 'Missed follow-ups lead to poor patient outcomes'],
    benefits: 'Your AI receptionist handles every patient call 24/7, books appointments, sends reminders, and ensures no enquiry falls through the cracks.'
  },
  beauty: {
    name: 'Beauty Salon / Spa', emoji: '💅',
    whatTheyDo: 'Offer beauty and wellness services including hair, nails, skincare, massages, and spa treatments.',
    services: ['Hair styling & colouring', 'Manicures & pedicures', 'Facials & skincare', 'Massage therapy', 'Bridal & event packages'],
    challenges: ['Peak booking times overwhelm the front desk', 'Clients calling after hours cannot book appointments', 'Competition is fierce — clients move to the salon that answers first', 'Staff are hands-on with clients and cannot answer phones'],
    benefits: 'Your AI receptionist books every client instantly, even at midnight, sends appointment reminders to reduce no-shows, and upsells packages.'
  },
  restaurant: {
    name: 'Restaurant', emoji: '🍽️',
    whatTheyDo: 'Serve food and drinks to diners, handling reservations, takeout orders, and catering enquiries.',
    services: ['Dine-in service', 'Takeaway & delivery', 'Private event catering', 'Group bookings', 'Special menu requests'],
    challenges: ['Lunch and dinner rushes make it impossible to answer every call', 'Lost reservation enquiries mean lost revenue', 'Staff cannot juggle the floor, kitchen, and phones', 'Catering enquiries need quick responses to win the booking'],
    benefits: 'An AI receptionist takes every reservation call, handles catering enquiries instantly, and captures orders even during the busiest service.'
  },
  fitness: {
    name: 'Fitness / Gym', emoji: '🏋️',
    whatTheyDo: 'Provide fitness services including gym access, personal training, group classes, and wellness programmes.',
    services: ['Gym memberships', 'Personal training', 'Group fitness classes', 'Nutrition coaching', 'Corporate wellness'],
    challenges: ['Prospects enquiring about memberships need instant answers or they walk away', 'High staff turnover means inconsistent phone handling', 'Trial sign-ups need prompt follow-up to convert', 'Evening peak hours make phones ring off the hook'],
    benefits: 'Your AI receptionist answers every membership enquiry, books trial sessions, and follows up with prospects around the clock.'
  },
  'home-services': {
    name: 'Home Services', emoji: '🔧',
    whatTheyDo: 'Provide home service solutions like plumbing, electrical work, cleaning, and repairs.',
    services: ['Emergency repairs', 'Routine maintenance', 'Installations & upgrades', 'Inspections & quotes', 'Service contracts'],
    challenges: ['Emergency calls come in at all hours and missing them means losing to competitors', 'Quotes need fast turnaround or customers hire someone else', 'Owners are often on-site and cannot answer phones', 'Seasonal demand spikes overwhelm small teams'],
    benefits: 'Your AI receptionist captures every emergency call, books assessments instantly, and follows up on quote requests — even while you are on the job.'
  },
  'real-estate': {
    name: 'Real Estate', emoji: '🏠',
    whatTheyDo: 'Handle property sales, rentals, and management services for landlords and tenants.',
    services: ['Property sales', 'Rental management', 'Tenant screening', 'Property valuations', 'Lease renewals'],
    challenges: ['Property enquiries come in 24/7 especially after work hours', 'Missing a serious buyer call can mean losing a big sale', 'Agents are in showings and cannot be on the phone', 'Rental applications need fast processing'],
    benefits: 'Your AI receptionist qualifies every lead, books viewings, sends listing alerts, and captures buyer details — so no opportunity slips through.'
  },
  legal: {
    name: 'Law Firm', emoji: '⚖️',
    whatTheyDo: 'Provide legal services across various practice areas to individuals and businesses.',
    services: ['Consultations & case reviews', 'Contract drafting', 'Litigation & dispute resolution', 'Conveyancing & property law', 'Estate planning'],
    challenges: ['Potential clients call multiple firms — the first to respond wins', 'Consultation bookings during business hours are chaotic', 'Billing inquiries eat reception time', 'After-hours calls from distressed clients need acknowledgment'],
    benefits: 'An AI receptionist captures every potential client instantly, qualifies their matter, and books consultations — so no lead goes to a competitor.'
  },
  retail: {
    name: 'Retail Store', emoji: '🛍️',
    whatTheyDo: 'Sell products directly to consumers in a physical or online storefront.',
    services: ['Product sales', 'Special orders', 'Lay-bys & financing', 'Gift registry', 'Loyalty programmes'],
    challenges: ['Floor staff cannot answer phones during rushes', 'Product availability queries waste time', 'After-hours enquiries disappear if unanswered'],
    benefits: 'Your AI receptionist answers product queries, checks stock, books consultations, and captures sales 24/7.'
  },
  auto: {
    name: 'Auto Services', emoji: '🔩',
    whatTheyDo: 'Provide vehicle repairs, servicing, maintenance, and vehicle sales.',
    services: ['Vehicle servicing & repairs', 'Diagnostics & inspections', 'Tyre replacement', 'Vehicle sales', 'Service plans'],
    challenges: ['Mechanics are under vehicles and cannot answer phones', 'Customers compare quotes — fastest response wins', 'Emergency breakdown calls come in anytime', 'Booking systems get overwhelmed during peak season'],
    benefits: 'Your AI receptionist takes every booking call, provides quotes for common services, and follows up with pending enquiries.'
  },
  education: {
    name: 'Education / Tutoring', emoji: '📚',
    whatTheyDo: 'Provide educational services including tutoring, courses, and skills training.',
    services: ['One-on-one tutoring', 'Group classes', 'Online courses', 'Exam preparation', 'Skills workshops'],
    challenges: ['Parents and students enquire outside office hours', 'Trial lessons need prompt booking', 'Class schedules change frequently', 'Instructors are teaching and cannot answer phones'],
    benefits: 'Your AI receptionist handles every enrolment enquiry, books trial sessions, and sends class reminders automatically.'
  },
  tech: {
    name: 'Tech / IT Services', emoji: '💻',
    whatTheyDo: 'Provide technology solutions including IT support, software development, and managed services.',
    services: ['IT support & helpdesk', 'Software development', 'Cloud solutions', 'Cybersecurity services', 'Managed IT services'],
    challenges: ['Clients need immediate responses for IT emergencies', 'Project scoping calls take senior staff time', 'Prospects expect fast quotes in a competitive market'],
    benefits: 'Your AI receptionist captures every lead, qualifies technical needs, and books discovery calls — without pulling your team off real work.'
  },
  consulting: {
    name: 'Consulting', emoji: '📊',
    whatTheyDo: 'Offer professional consulting services across business, financial, or management domains.',
    services: ['Strategy consulting', 'Financial advisory', 'Business coaching', 'Process optimisation', 'Market research'],
    challenges: ['High-value prospects evaluate multiple consultants — responsiveness wins', 'Discovery calls are hard to schedule across busy calendars', 'Small teams juggle client delivery and business development'],
    benefits: 'An AI receptionist captures every enquiry instantly, qualifies the lead, and books discovery calls.'
  },
  other: {
    name: 'Business', emoji: '📦',
    whatTheyDo: 'A business serving customers and needing to manage enquiries, bookings, and sales.',
    services: ['Customer service', 'Booking & scheduling', 'Sales & follow-ups', 'Lead capture'],
    challenges: ['Missed calls mean missed revenue', 'After-hours enquiries are lost', 'Staff cannot balance core work and phones', 'Leads go cold when follow-ups are delayed'],
    benefits: 'Your AI receptionist answers every call, captures leads, books appointments, and follows up automatically.'
  }
};

const getIndustry = (type) => INDUSTRIES[type] || INDUSTRIES.other;

// ===== GEMINI API =====
async function callGemini(prompt, maxTokens = 1024) {
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
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || null;
  } catch (e) {
    console.warn('Gemini call failed:', e.message);
    return null;
  }
}

function extractJSON(raw) {
  if (!raw) return null;
  const stripped = raw.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
  const startBracket = stripped.indexOf('{');
  const startArray = stripped.indexOf('[');
  let startIndex = -1, endIndex = -1;
  if (startBracket === -1 && startArray === -1) return null;
  if (startBracket === -1) { startIndex = startArray; endIndex = stripped.lastIndexOf(']'); }
  else if (startArray === -1) { startIndex = startBracket; endIndex = stripped.lastIndexOf('}'); }
  else {
    const first = Math.min(startBracket, startArray);
    startIndex = first;
    endIndex = stripped.lastIndexOf(first === startBracket ? '}' : ']');
  }
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) return null;
  const jsonStr = stripped.substring(startIndex, endIndex + 1);
  try { return JSON.parse(jsonStr); }
  catch { return null; }
}

// ===== FORM DATA EXTRACTION =====
function getFormData() {
  return {
    businessName: ($('businessName')?.value || '').trim(),
    contactPerson: ($('contactPerson')?.value || '').trim(),
    phoneNumber: ($('phoneNumber')?.value || '').trim(),
    websiteUrl: ($('websiteUrl')?.value || '').trim(),
    businessType: $('businessType')?.value || 'other',
    notes: ($('notes')?.value || '').trim()
  };
}

// ===== ANALYSIS =====
async function analyzeBusiness(data) {
  const industry = getIndustry(data.businessType);
  const template = {
    whatTheyDo: industry.whatTheyDo,
    services: industry.services,
    challenges: industry.challenges,
    benefits: industry.benefits
  };

  if (!getApiKey()) return template;

  const prompt = `Analyze this business for an AI receptionist sales pitch:

Business: ${data.businessName}
Industry: ${industry.name}
Contact: ${data.contactPerson || 'Business Owner'}
Website: ${data.websiteUrl || 'N/A'}
Notes: ${data.notes || 'N/A'}

Respond with JSON only (no markdown):
{
  "whatTheyDo": "1-2 sentence description",
  "services": ["service 1","service 2","service 3","service 4"],
  "challenges": ["challenge 1","challenge 2","challenge 3","challenge 4"],
  "benefits": "How AI receptionist helps this business specifically (2-3 sentences)"
}

Focus on practical, specific insights relevant to ${industry.name}.`;

  const response = await callGemini(prompt, 400);
  const parsed = extractJSON(response);
  if (parsed && parsed.whatTheyDo) return parsed;
  return template;
}

// ===== STRATEGY =====
async function generateStrategy(data, analysis) {
  const industry = getIndustry(data.businessType);
  const template = [
    `Lead with empathy: ${data.businessName} likely struggles with ${analysis.challenges[0].toLowerCase()}`,
    `Highlight their ${analysis.services[0].toLowerCase()} — connect AI value to their core service`,
    `Address the biggest pain: staff time wasted on phones instead of serving customers`,
    `Use social proof: similar ${industry.name.toLowerCase()} businesses saw 30-40% more bookings`,
    `Soft CTA: "Can I show you how it works in a 5-minute call?"`
  ];

  if (!getApiKey()) return template;

  const prompt = `Generate 5 WhatsApp sales strategy points for contacting this ${industry.name}:

Business: ${data.businessName}
Key challenge: ${analysis.challenges[0]}
Key service: ${analysis.services[0]}

Return a JSON array of 5 strings only. Each one is a concise, actionable strategy point. No markdown.`;

  const response = await callGemini(prompt, 400);
  const parsed = extractJSON(response);
  if (Array.isArray(parsed) && parsed.length >= 3) return parsed.slice(0, 5);
  return template;
}

// ===== WHATSAPP MESSAGE =====
async function generateWhatsAppMessage(data, analysis, strategy) {
  const industry = getIndustry(data.businessType);
  const greeting = data.contactPerson ? `Hi ${data.contactPerson.split(' ')[0]}! 👋\n\n` : 'Hi there! 👋\n\n';
  const template = greeting + `${data.businessName} sounds like a great fit for what we do.\n\nQuick question — when customers call outside business hours, or when your team is busy, how do you currently handle those enquiries?\n\nWe've been helping ${industry.name.toLowerCase()} businesses like yours capture every lead with an AI receptionist that answers calls 24/7, books appointments, and follows up automatically.\n\n${industry.benefits}\n\nWould you be open to a quick 5-minute demo to see how it works? No pressure at all.\n\nCheers,\nBranley`;

  if (!getApiKey()) return template;

  const prompt = `Write a WhatsApp sales message for this business:

To: ${data.contactPerson || 'Business Owner'}
Business: ${data.businessName} (${industry.name})
Context: ${analysis.whatTheyDo}
Their challenge: ${strategy[0]}
Strategy: ${strategy.slice(0, 3).join('; ')}

Requirements:
- Start with ${greeting.trim()}
- 120-160 words total
- Friendly, professional, conversational — NOT salesy
- Ask a short question about their current call-handling process
- Include 2 specific benefits relevant to their industry
- End with a soft CTA: "Can I show you how it works in a 5-minute call?"
- Sign off "Cheers, Branley"
- Use 2-4 emojis naturally (not spammy)
- No pricing, no mention of "AI receptionist" being a robot — position it as "our AI receptionist service"

Write just the message body, no explanation.`;

  const response = await callGemini(prompt, 400);
  if (response && response.length > 60) return response.trim();
  return template;
}

// ===== FOLLOW-UPS =====
async function generateFollowUps(data, analysis) {
  const industry = getIndustry(data.businessType);
  const template = [
    { timing: '2 days', message: `Hi! 👋 Just checking if you had a chance to think about our AI receptionist. Happy to answer any questions about how it works for ${industry.name.toLowerCase()} businesses!` },
    { timing: '5 days', message: `Quick thought — we've seen ${industry.name.toLowerCase()} businesses gain 30% more bookings in the first month. Want me to share a quick case study?` },
    { timing: '1 week', message: `I'm putting together a short analysis of missed-call patterns in your industry. Happy to share what I find for ${data.businessName} — would that be useful?` },
    { timing: '2 weeks', message: `Last check-in from me! If the timing isn't right, totally understand. But if you ever want to see how it works, just say the word 😊` }
  ];

  if (!getApiKey()) return template;

  const prompt = `Generate 4 WhatsApp follow-up messages for this ${industry.name}:

Business: ${data.businessName}
Previous message benefit: ${analysis.benefits}
Last touch: 2 days ago

Return a JSON array:
[
  {"timing": "2 days", "message": "..."},
  {"timing": "5 days", "message": "..."},
  {"timing": "1 week", "message": "..."},
  {"timing": "2 weeks", "message": "..."}
]

Each: 20-35 words, friendly, offer new value (case study, free audit, demo, etc.), no pressure. No markdown.`;

  const response = await callGemini(prompt, 400);
  const parsed = extractJSON(response);
  if (Array.isArray(parsed) && parsed.length >= 3) return parsed.slice(0, 4);
  return template;
}

// ===== DISPLAY FUNCTIONS =====
function renderAnalysis(data, analysis) {
  const industry = getIndustry(data.businessType);
  let html = `<strong style="font-size:1.05rem">${escapeHtml(data.businessName)}</strong>`;
  if (data.contactPerson) html += `<div style="opacity:0.7;font-size:0.88rem;margin-top:0.3rem">Contact: ${escapeHtml(data.contactPerson)}</div>`;
  html += `<div style="opacity:0.7;font-size:0.88rem">🏷️ <strong>Industry:</strong> ${industry.name}</div>`;

  html += `<div style="margin:1.25rem 0"><h4 style="margin:0 0 0.6rem 0;font-size:0.95rem">📋 What They Do</h4><p style="margin:0;line-height:1.6;font-size:0.95rem;opacity:0.9">${escapeHtml(analysis.whatTheyDo)}</p></div>`;

  if (analysis.services && analysis.services.length) {
    html += `<div style="margin:1.25rem 0"><h4 style="margin:0 0 0.6rem 0;font-size:0.95rem">🛠️ Likely Services</h4><ul style="margin:0;padding-left:1.25rem">`;
    analysis.services.forEach(s => html += `<li style="margin-bottom:0.3rem;font-size:0.92rem">${escapeHtml(s)}</li>`);
    html += `</ul></div>`;
  }

  if (analysis.challenges && analysis.challenges.length) {
    html += `<div style="margin:1.25rem 0"><h4 style="margin:0 0 0.6rem 0;font-size:0.95rem">⚠️ Likely Challenges</h4><ul style="margin:0;padding-left:1.25rem">`;
    analysis.challenges.forEach(c => html += `<li style="margin-bottom:0.3rem;font-size:0.92rem">${escapeHtml(c)}</li>`);
    html += `</ul></div>`;
  }

  html += `<div style="margin:1.25rem 0;padding:1rem;background:rgba(0,255,136,0.06);border-left:3px solid #00ff88;border-radius:6px"><h4 style="margin:0 0 0.6rem 0;font-size:0.95rem">💡 How AI Receptionist Helps</h4><p style="margin:0;line-height:1.6;font-size:0.95rem;opacity:0.9">${escapeHtml(analysis.benefits)}</p></div>`;

  $('analysisContent').innerHTML = html;
}

function renderStrategy(strategy) {
  if (!Array.isArray(strategy)) return;
  $('strategyContent').innerHTML = strategy.map((s, i) =>
    `<div style="display:flex;gap:0.75rem;margin-bottom:0.7rem"><span style="color:#00ff88;font-weight:700;min-width:1.5rem">${i + 1}.</span><span style="font-size:0.92rem;line-height:1.5">${escapeHtml(s)}</span></div>`
  ).join('');
}

function renderFollowUps(followUps) {
  if (!Array.isArray(followUps)) return;
  $('followUpsContent').innerHTML = followUps.map(f =>
    `<div style="margin-bottom:0.8rem;padding:0.75rem;background:rgba(255,255,255,0.04);border-radius:8px;border:1px solid rgba(255,255,255,0.08)">
      <div style="font-size:0.82rem;color:#00ff88;margin-bottom:0.35rem;font-weight:600">⏰ ${escapeHtml(f.timing)}</div>
      <div style="font-size:0.92rem;line-height:1.5">${escapeHtml(f.message)}</div>
    </div>`
  ).join('');
}

// ===== FORM HANDLER =====
async function handleFormSubmit(event) {
  event.preventDefault();

  const data = getFormData();
  if (!data.businessName || !data.phoneNumber || !data.businessType) {
    showToast('⚠️ Please fill in Business Name, Phone Number, and Business Type');
    return;
  }

  const btn = event.target.querySelector('button[type="submit"]');
  const original = btn.textContent;
  const hasGemini = !!getApiKey();
  btn.textContent = hasGemini ? '🧠 AI is analysing...' : 'Generating...';
  btn.disabled = true;
  $('resultsSection').style.display = 'none';

  try {
    const analysis = await analyzeBusiness(data);
    renderAnalysis(data, analysis);

    const strategy = await generateStrategy(data, analysis);
    renderStrategy(strategy);

    const message = await generateWhatsAppMessage(data, analysis, strategy);
    $('messageTextarea').value = message;
    window.currentAnalysis = analysis;
    window.currentStrategy = strategy;
    window.currentMessage = message;

    const followUps = await generateFollowUps(data, analysis);
    renderFollowUps(followUps);

    $('resultsSection').style.display = 'block';
    $('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(hasGemini ? '✅ AI analysis complete!' : '✅ Strategy ready! Connect Gemini to personalise further.');
  } catch (e) {
    console.error('Generation error:', e);
    showToast('❌ Something went wrong. Please try again.');
  } finally {
    btn.textContent = original;
    btn.disabled = false;
  }
}

// ===== MESSAGE ACTIONS =====
function copyMessage() {
  const msg = $('messageTextarea').value;
  if (!msg) return showToast('⚠️ Nothing to copy');
  navigator.clipboard.writeText(msg).then(() => showToast('✅ Message copied!')).catch(() => showToast('❌ Copy failed'));
}

function sendViaWhatsApp() {
  const msg = $('messageTextarea').value;
  const phone = getFormData().phoneNumber.replace(/\s|-/g, '');
  if (!msg) return showToast('⚠️ Generate a message first');
  if (!phone) return showToast('⚠️ Add a phone number first');
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
}

// ===== CONTACT SAVE =====
function saveContact() {
  const data = getFormData();
  const msg = $('messageTextarea').value;
  if (!data.businessName) return showToast('⚠️ Fill in a business name first');

  const contacts = getContacts();
  const existing = contacts.findIndex(c => c.phoneNumber === data.phoneNumber && c.businessName === data.businessName);

  const record = {
    id: existing >= 0 ? contacts[existing].id : genId(),
    businessName: data.businessName,
    contactPerson: data.contactPerson,
    phoneNumber: data.phoneNumber,
    website: data.websiteUrl,
    businessType: data.businessType,
    industryLabel: getIndustry(data.businessType).name,
    notes: data.notes,
    messageSummary: msg ? msg.substring(0, 200) + (msg.length > 200 ? '...' : '') : '',
    objections: existing >= 0 ? (contacts[existing].objections || '') : '',
    interestLevel: existing >= 0 ? (contacts[existing].interestLevel || 'Medium') : 'Medium',
    followUpDate: existing >= 0 ? (contacts[existing].followUpDate || '') : '',
    status: existing >= 0 ? contacts[existing].status : 'new',
    converted: existing >= 0 ? contacts[existing].converted : false,
    createdAt: existing >= 0 ? (contacts[existing].createdAt || Date.now()) : Date.now(),
    updatedAt: Date.now()
  };

  if (existing >= 0) contacts[existing] = record;
  else contacts.unshift(record);

  saveContacts(contacts);
  showToast('✅ Contact saved!');
  renderCRM();
}

// ===== CRM =====
function showCRM() {
  $('tool-view').style.display = 'none';
  $('crm-view').style.display = 'block';
  renderCRM();
}

function showTool() {
  $('tool-view').style.display = 'block';
  $('crm-view').style.display = 'none';
}

function renderCRM() {
  const contacts = getContacts();
  const term = ($('searchInput')?.value || '').toLowerCase();
  const filter = $('filterSelect')?.value || 'all';

  $('stat-total').textContent = contacts.length;
  $('stat-interested').textContent = contacts.filter(c => c.status === 'interested').length;
  $('stat-converted').textContent = contacts.filter(c => c.converted).length;

  const filtered = contacts.filter(c => {
    const match = !term || c.businessName.toLowerCase().includes(term) || (c.contactPerson || '').toLowerCase().includes(term);
    const status = filter === 'all' || c.status === filter;
    return match && status;
  });

  const list = $('contactsList');
  if (contacts.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:3rem 1rem;opacity:0.6"><p style="font-size:1.1rem;margin-bottom:0.5rem">📭 No contacts yet</p><p style="font-size:0.88rem">Save your first business contact after analysing.</p></div>`;
    return;
  }
  if (filtered.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:3rem 1rem;opacity:0.6">🔍 No matches found</div>`;
    return;
  }

  const statusBadge = s => {
    const colors = { 'new': '#60a5fa', 'contacted': '#f59e0b', 'interested': '#10b981', 'not-interested': '#ef4444', 'converted': '#8b5cf6' };
    const labels = { 'new': 'New', 'contacted': 'Contacted', 'interested': 'Interested', 'not-interested': 'Not Interested', 'converted': 'Converted' };
    const c = colors[s] || '#6366f1';
    return `<span style="display:inline-block;font-size:0.75rem;padding:0.2rem 0.75rem;background:${c}25;color:${c};border-radius:12px;font-weight:600">${labels[s] || s}</span>`;
  };
  const interestBadge = lvl => {
    const colors = { 'Low': '#ef4444', 'Medium': '#f59e0b', 'High': '#10b981' };
    const c = colors[lvl] || '#6366f1';
    return `<span style="font-size:0.8rem;color:${c};font-weight:600">${lvl}</span>`;
  };

  list.innerHTML = filtered.map(c => `
    <div class="contact-card" onclick="openContactModal('${c.id}')" style="padding:1rem;margin-bottom:0.75rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;cursor:pointer;border-left:3px solid #6366f1">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font-weight:700;font-size:1rem;margin-bottom:0.2rem">${escapeHtml(c.businessName)}</div>
          <div style="font-size:0.85rem;opacity:0.6">${escapeHtml(c.contactPerson || '—')} · ${escapeHtml(c.phoneNumber)}</div>
          <div style="font-size:0.82rem;opacity:0.5;margin-top:0.2rem">${escapeHtml(c.industryLabel || c.businessType)}</div>
        </div>
        <div style="display:flex;gap:0.4rem;align-items:center">${interestBadge(c.interestLevel)} ${statusBadge(c.status)}</div>
      </div>
      ${c.followUpDate ? `<div style="font-size:0.8rem;margin-top:0.5rem;opacity:0.7">📅 Follow-up: ${formatDate(c.followUpDate)}</div>` : ''}
    </div>
  `).join('');
}

function openContactModal(id) {
  const contacts = getContacts();
  const c = contacts.find(x => x.id === id);
  if (!c) return;

  const modal = $('contactModal');
  modal.innerHTML = `
    <div style="background:rgba(20,20,40,0.98);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:2rem;max-width:600px;width:90%;max-height:90vh;overflow-y:auto;position:relative">
      <button onclick="closeModal()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;color:white;font-size:1.5rem;cursor:pointer;opacity:0.6">✕</button>
      <h2 style="margin:0 0 0.5rem 0;font-size:1.5rem">${escapeHtml(c.businessName)}</h2>
      <div style="opacity:0.7;font-size:0.9rem;margin-bottom:1.5rem">${escapeHtml(c.contactPerson || c.phoneNumber)}</div>
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">
        <div><div style="font-size:0.8rem;opacity:0.6;margin-bottom:0.2rem">Phone</div><div style="font-size:0.95rem">${escapeHtml(c.phoneNumber)}</div></div>
        <div><div style="font-size:0.8rem;opacity:0.6;margin-bottom:0.2rem">Website</div><div style="font-size:0.95rem">${escapeHtml(c.website || '—')}</div></div>
        <div><div style="font-size:0.8rem;opacity:0.6;margin-bottom:0.2rem">Industry</div><div style="font-size:0.95rem">${escapeHtml(c.industryLabel || c.businessType)}</div></div>
        <div><div style="font-size:0.8rem;opacity:0.6;margin-bottom:0.2rem">Interest Level</div><div style="font-size:0.95rem">${escapeHtml(c.interestLevel)}</div></div>
      </div>

      <div style="margin-bottom:1.5rem">
        <div style="font-size:0.85rem;font-weight:600;margin-bottom:0.5rem">📝 WhatsApp Summary</div>
        <div style="font-size:0.9rem;line-height:1.6;opacity:0.9;padding:0.75rem;background:rgba(255,255,255,0.04);border-radius:8px">${escapeHtml(c.messageSummary || 'No message saved yet.')}</div>
      </div>

      <div style="margin-bottom:1.5rem">
        <div style="font-size:0.85rem;font-weight:600;margin-bottom:0.5rem">🚧 Objections / Notes</div>
        <div style="font-size:0.9rem;line-height:1.6;opacity:0.9;padding:0.75rem;background:rgba(255,255,255,0.04);border-radius:8px">${escapeHtml(c.objections || 'None raised')}</div>
      </div>

      <div style="margin-bottom:1.5rem">
        <div style="font-size:0.85rem;font-weight:600;margin-bottom:0.5rem">📅 Follow-up Date</div>
        <div style="font-size:0.9rem;opacity:0.9">${c.followUpDate ? formatDate(c.followUpDate) : 'Not scheduled'}</div>
      </div>

      <div style="margin-bottom:1.5rem">
        <div style="font-size:0.85rem;font-weight:600;margin-bottom:0.75rem">Status</div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap" id="modalStatusButtons"></div>
      </div>

      <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
        <button type="button" class="btn-gradient" onclick="editContact('${c.id}')" style="flex:1;padding:0.75rem">✏️ Edit Notes</button>
        <button type="button" class="btn-gradient" onclick="scheduleFollowUp('${c.id}')" style="flex:1;padding:0.75rem">📅 Schedule Follow-up</button>
        <button type="button" class="btn-gradient" onclick="deleteContact('${c.id}')" style="flex:1;padding:0.75rem;background:linear-gradient(135deg,#ef4444,#dc2626)">🗑️ Delete</button>
      </div>
    </div>
  `;
  modal.style.display = 'flex';

  const statuses = ['new', 'contacted', 'interested', 'not-interested', 'converted'];
  const statusLabels = { 'new': 'New', 'contacted': 'Contacted', 'interested': 'Interested', 'not-interested': 'Not Interested', 'converted': 'Converted' };
  $('modalStatusButtons').innerHTML = statuses.map(s =>
    `<button type="button" class="btn ${c.status === s ? 'btn-wa' : 'btn-outline'}" style="padding:0.5rem 1rem;font-size:0.85rem" onclick="updateContactStatus('${c.id}','${s}')">${statusLabels[s]}</button>`
  ).join('');
}

function closeModal() {
  $('contactModal').style.display = 'none';
}

function updateContactStatus(id, status) {
  const contacts = getContacts();
  const c = contacts.find(x => x.id === id);
  if (!c) return;
  c.status = status;
  c.converted = status === 'converted';
  c.updatedAt = Date.now();
  saveContacts(contacts);
  closeModal();
  renderCRM();
  showToast('✅ Status updated');
}

function editContact(id) {
  const contacts = getContacts();
  const c = contacts.find(x => x.id === id);
  if (!c) return;
  const notes = prompt('Edit follow-up notes / objections:', c.objections || '');
  if (notes !== null) {
    c.objections = notes;
    c.updatedAt = Date.now();
    saveContacts(contacts);
    closeModal();
    renderCRM();
    showToast('✅ Notes updated');
  }
}

function scheduleFollowUp(id) {
  const contacts = getContacts();
  const c = contacts.find(x => x.id === id);
  if (!c) return;
  const date = prompt('Follow-up date (YYYY-MM-DD):', c.followUpDate || '');
  if (date) {
    c.followUpDate = date;
    if (c.status === 'new') c.status = 'contacted';
    c.updatedAt = Date.now();
    saveContacts(contacts);
    closeModal();
    renderCRM();
    showToast('📅 Follow-up scheduled');
  }
}

function deleteContact(id) {
  if (!confirm('Delete this contact?')) return;
  saveContacts(getContacts().filter(c => c.id !== id));
  closeModal();
  renderCRM();
  showToast('🗑️ Contact deleted');
}

function exportContacts() {
  const contacts = getContacts();
  if (contacts.length === 0) return showToast('⚠️ No contacts to export');

  const headers = ['Business Name', 'Contact Person', 'Phone', 'Website', 'Industry', 'Status', 'Interest Level', 'Follow-up Date', 'Message Summary', 'Objections', 'Created'];
  const rows = contacts.map(c => [
    c.businessName,
    c.contactPerson || '',
    c.phoneNumber,
    c.website || '',
    c.industryLabel || c.businessType,
    c.status,
    c.interestLevel,
    c.followUpDate || '',
    c.messageSummary || '',
    c.objections || '',
    formatDate(c.createdAt)
  ]);

  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📥 Contacts exported!');
}

// ===== API KEY UI =====
function updateApiKeyUI() {
  const key = getApiKey();
  const status = $('apiStatus');
  const text = $('apiStatusText');
  const input = $('apiKeyInput');
  if (key) {
    status.className = 'api-status active';
    text.textContent = 'Connected';
    input.value = '';
    input.placeholder = 'Key saved ✓ (paste new to change)';
  } else {
    status.className = 'api-status inactive';
    text.textContent = 'Not connected';
    input.placeholder = 'Paste your Gemini API key (optional)';
  }
}

function saveApiKeyFromUI() {
  const input = $('apiKeyInput');
  const key = input.value.trim();
  if (key) {
    setApiKey(key);
    showToast('🧠 Gemini AI connected!');
  } else {
    localStorage.removeItem(API_KEY_STORAGE);
    showToast('📝 API key cleared');
  }
  updateApiKeyUI();
}

function resetFilter() {
  $('searchInput').value = '';
  $('filterSelect').value = 'all';
  renderCRM();
}

function filterContacts() {
  renderCRM();
}

function toggleNav() {
  const links = $('navLinks');
  links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  const form = $('salesForm');
  if (form) form.addEventListener('submit', handleFormSubmit);

  const searchInput = $('searchInput');
  const filterSelect = $('filterSelect');
  if (searchInput) searchInput.addEventListener('input', filterContacts);
  if (filterSelect) filterSelect.addEventListener('change', filterContacts);

  updateApiKeyUI();
  renderCRM();
});
