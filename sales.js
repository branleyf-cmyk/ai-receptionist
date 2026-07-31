// =============================================================
// WhatsApp AI Sales Assistant — sales.js
// Matches the current sales.html structure
// =============================================================

// ===== CONFIG =====
const STORAGE_KEY = 'ai_receptionist_contacts';
const GEMINI_API_KEY = 'AIzaSyB7j dVh8bJv5fGpZ9vZ2qX3rW6cE7tY1uM'; // Hardcoded free Gemini key
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY;

// ===== HELPERS =====
const $ = id => document.getElementById(id);

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

function showToast(msg) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== LOCAL STORAGE =====
function getContacts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveContacts(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ===== GEMINI API =====
async function callGemini(prompt, maxTokens) {
  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: maxTokens || 800 }
      })
    });
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  } catch (e) {
    console.warn('Gemini API error:', e);
    return '';
  }
}

function extractJSON(text) {
  if (!text) return null;
  try {
    const match = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (e) { console.warn('JSON parse error:', e); }
  return null;
}

// ===== INDUSTRY DATA =====
function getIndustry(type) {
  const industries = {
    'dental': {
      name: 'Dental Practice',
      whatTheyDo: 'Provide dental care services including check-ups, cleanings, fillings, cosmetic dentistry, and emergency treatments.',
      services: ['Routine check-ups & cleanings', 'Cosmetic dentistry (whitening, veneers)', 'Emergency dental care', 'Orthodontics & braces'],
      challenges: ['High no-show rates for appointments', 'Missed calls after hours when patients have dental emergencies', 'Staff overwhelmed balancing front desk with patient care', 'Losing new patient enquiries to competitors who answer first'],
      benefits: 'An AI receptionist can answer emergency calls 24/7, book appointments automatically, send reminders to reduce no-shows, and capture new patient enquiries instantly — even at 2am when a patient has toothache.'
    },
    'medical': {
      name: 'Medical / Clinic',
      whatTheyDo: 'Offer healthcare services including consultations, diagnostics, chronic medication management, and wellness programmes.',
      services: ['GP consultations', 'Chronic medication management', 'Lab tests & diagnostics', 'Wellness & vaccination programmes'],
      challenges: ['Overflowing switchboard during peak hours', 'Patients unable to book after hours', 'Staff spending too much time on routine enquiries', 'Missed follow-up opportunities with patients'],
      benefits: 'An AI receptionist handles routine booking, prescription refill requests, and general enquiries 24/7 — freeing nurses and admins to focus on patients in the waiting room.'
    },
    'beauty': {
      name: 'Beauty Salon / Spa',
      whatTheyDo: 'Provide beauty treatments such as nails, hair, skincare, massages, and wellness services.',
      services: ['Hair styling & treatments', 'Nail care & manicures', 'Facials & skincare', 'Massages & body treatments'],
      challenges: ['Double-booking during peak times', 'Clients booking via Instagram DMs that get missed', 'No-shows costing revenue', 'Difficulty filling last-minute cancellations'],
      benefits: 'An AI receptionist books appointments instantly from any enquiry, sends reminders, fills cancellations with waitlist clients, and captures bookings from Instagram/Facebook at 11pm when the salon is closed.'
    },
    'restaurant': {
      name: 'Restaurant',
      whatTheyDo: 'Serve food and beverages to dine-in, takeaway, and delivery customers.',
      services: ['Dine-in dining', 'Takeaway & delivery orders', 'Catering for events', 'Private functions & bookings'],
      challenges: ['Missed reservation calls during busy service', 'Staff pulled off the floor to answer phones', 'Repetitive questions about menu, hours, and parking', 'Lost group booking enquiries'],
      benefits: 'An AI receptionist handles reservations, answers FAQs about menus and hours, takes group bookings, and manages takeaway orders — so waiters stay on the floor and no reservation is missed.'
    },
    'fitness': {
      name: 'Fitness / Gym',
      whatTheyDo: 'Offer gym facilities, personal training, group classes, and fitness programmes.',
      services: ['Gym access & memberships', 'Personal training sessions', 'Group fitness classes', 'Nutrition coaching'],
      challenges: ['Losing sign-ups to 24/7 competitors', 'Trainer schedule chaos', 'Membership renewal follow-ups falling through', 'Peak-hour call overload'],
      benefits: 'An AI receptionist captures new member sign-ups 24/7, books personal training sessions, sends renewal reminders, and answers class timetable questions — so no lead goes to a competitor.'
    },
    'home-services': {
      name: 'Home Services',
      whatTheyDo: 'Provide in-home services such as plumbing, electrical, cleaning, gardening, or renovations.',
      services: ['Emergency repairs', 'Routine maintenance', 'Installations & renovations', 'Cleaning & gardening'],
      challenges: ['Missing urgent calls while on a job', 'Quotes getting lost in WhatsApp threads', 'Scheduling conflicts across multiple technicians', 'No after-hours availability'],
      benefits: 'An AI receptionist answers emergency calls instantly, books site visits, sends quote reminders, and schedules technicians — even while you are under a house fixing a pipe.'
    },
    'real-estate': {
      name: 'Real Estate / Rental',
      whatTheyDo: 'Facilitate property sales, rentals, and management for landlords and tenants.',
      services: ['Property sales & listings', 'Rental management', 'Tenant screening', 'Property valuations'],
      challenges: ['Missing enquiries from serious buyers/tenants', 'Repetitive questions about listings', 'Scheduling viewings across multiple properties', 'Following up with cold leads'],
      benefits: 'An AI receptionist qualifies leads instantly, answers listing questions, books viewings, and follows up with cold leads — so no serious buyer slips through to another agent.'
    },
    'legal': {
      name: 'Law Firm',
      whatTheyDo: 'Provide legal services including consultations, document preparation, and representation.',
      services: ['Legal consultations', 'Contract drafting & review', 'Litigation & dispute resolution', 'Conveyancing & estates'],
      challenges: ['High-value leads lost to slow response times', 'Billable hours wasted on intake calls', 'Confidentiality concerns with reception staff', 'After-hours enquiries going to competitors'],
      benefits: 'An AI receptionist qualifies new matters, captures case details confidentially, books consultations, and filters genuine enquiries — so attorneys focus on billable work, not intake admin.'
    },
    'retail': {
      name: 'Retail Store',
      whatTheyDo: 'Sell products directly to consumers in a physical or online store.',
      services: ['In-store sales', 'Online orders & delivery', 'Product enquiries', 'Returns & exchanges'],
      challenges: ['Missing calls while helping in-store customers', 'Repetitive product/stock questions', 'Poor after-hours online enquiry response', 'Losing sales to faster-responding competitors'],
      benefits: 'An AI receptionist checks stock availability, processes orders, answers product questions, and captures leads 24/7 — so no sale is lost just because the shop floor is busy.'
    },
    'auto': {
      name: 'Auto Mechanic / Dealer',
      whatTheyDo: 'Provide vehicle repairs, servicing, and sales of new/used cars.',
      services: ['Vehicle servicing & repairs', 'Diagnostics & mechanical work', 'Car sales (new & used)', 'Tyres & batteries'],
      challenges: ['Missing calls with greasy hands', 'Booking confusion across multiple bays', 'Customers calling for status updates', 'Losing quotes to dealerships that respond faster'],
      benefits: 'An AI receptionist books services, provides status updates, sends quote reminders, and captures walk-around enquiries — so mechanics stay under the bonnet and no job slips away.'
    },
    'education': {
      name: 'Education / Tutoring',
      whatTheyDo: 'Offer educational services including tutoring, courses, and skills training.',
      services: ['One-on-one tutoring', 'Group classes & workshops', 'Online courses', 'Exam preparation'],
      challenges: ['Parent enquiries flooding at registration time', 'Scheduling across multiple tutors/venues', 'Chasing unpaid fees', 'Losing students to faster-responding competitors'],
      benefits: 'An AI receptionist handles parent enquiries, books trial lessons, sends payment reminders, and follows up with interested students — even during exam season when phones never stop.'
    },
    'tech': {
      name: 'Tech / IT Services',
      whatTheyDo: 'Provide IT support, software development, web design, or technology consulting.',
      services: ['IT support & helpdesk', 'Software/web development', 'Cloud & infrastructure', 'Cybersecurity consulting'],
      challenges: ['Support tickets piling up outside business hours', 'Qualified leads lost to slow response times', 'Developers interrupted by sales calls', 'Onboarding new clients manually'],
      benefits: 'An AI receptionist triages support requests, qualifies new leads, books discovery calls, and handles onboarding admin — so developers stay in flow and no enterprise lead goes cold.'
    },
    'consulting': {
      name: 'Consulting',
      whatTheyDo: 'Provide expert advisory services in areas like business, finance, HR, or strategy.',
      services: ['Strategy & business consulting', 'Financial advisory', 'HR & recruitment consulting', 'Training & workshops'],
      challenges: ['High-value leads lost to slow response', 'Consultants interrupted by intake calls', 'Proposal follow-ups falling through', 'Difficulty qualifying serious enquiries'],
      benefits: 'An AI receptionist qualifies leads, captures brief details, books discovery calls, and follows up on proposals — so consultants focus on high-value advisory work, not admin.'
    },
    'other': {
      name: 'Business',
      whatTheyDo: 'Provide products or services to customers in their industry.',
      services: ['Core service offering', 'Customer consultations', 'Follow-up services', 'Support & maintenance'],
      challenges: ['Missing calls during busy periods', 'After-hours enquiries going unanswered', 'Staff time wasted on routine questions', 'Leads slipping to faster-responding competitors'],
      benefits: 'An AI receptionist answers every call 24/7, books appointments, captures leads, and handles routine questions — so no opportunity is missed, day or night.'
    }
  };
  return industries[type] || industries['other'];
}

// ===== FORM DATA =====
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

  $('analysis-what-they-do').innerHTML = `<strong>What they do:</strong> ${escapeHtml(analysis.whatTheyDo)}`;
  $('analysis-services').textContent = (analysis.services || []).join(' • ');

  const challengesEl = $('analysis-challenges');
  challengesEl.innerHTML = (analysis.challenges || []).map(c =>
    `<div style="padding:.4rem 0;font-size:.88rem;border-bottom:1px solid var(--border-color)">⚠️ ${escapeHtml(c)}</div>`
  ).join('');

  // Add benefits section
  const benefitsDiv = document.createElement('div');
  benefitsDiv.style.cssText = 'margin-top:1rem;padding:1rem;background:rgba(16,185,129,.06);border-left:3px solid var(--accent-primary);border-radius:8px';
  benefitsDiv.innerHTML = `<strong style="color:var(--accent-primary)">💡 How AI Receptionist Helps:</strong><p style="margin:.5rem 0 0;font-size:.88rem;line-height:1.6">${escapeHtml(analysis.benefits)}</p>`;
  challengesEl.parentNode.appendChild(benefitsDiv);

  $('analysis-panel').classList.add('active');
}

function renderStrategy(strategy) {
  if (!Array.isArray(strategy)) return;
  $('strategy-list').innerHTML = strategy.map((s, i) =>
    `<li><span style="color:var(--accent-primary);font-weight:700">${i + 1}.</span> ${escapeHtml(s)}</li>`
  ).join('');
  $('strategy-panel').classList.add('active');
}

function renderFollowUps(followUps) {
  if (!Array.isArray(followUps)) return;
  $('followup-list').innerHTML = followUps.map(f =>
    `<li><span style="color:var(--accent-warm);font-weight:600">${escapeHtml(f.timing)}:</span> ${escapeHtml(f.message)}</li>`
  ).join('');
  $('followup-panel').classList.add('active');
}

// ===== FORM HANDLER =====
async function handleFormSubmit(event) {
  event.preventDefault();

  const data = getFormData();
  if (!data.businessName || !data.phoneNumber || !data.businessType) {
    showToast('⚠️ Please fill in Business Name, Phone Number, and Business Type');
    return;
  }

  const btn = $('analyse-btn');
  const original = btn.textContent;
  btn.textContent = '🧠 AI is analysing...';
  btn.disabled = true;

  // Hide previous results
  ['analysis-panel', 'strategy-panel', 'followup-panel'].forEach(id => {
    $(id)?.classList.remove('active');
  });

  try {
    const analysis = await analyzeBusiness(data);
    renderAnalysis(data, analysis);

    const strategy = await generateStrategy(data, analysis);
    renderStrategy(strategy);

    const message = await generateWhatsAppMessage(data, analysis, strategy);
    $('message-text').value = message;

    window.currentAnalysis = analysis;
    window.currentStrategy = strategy;
    window.currentMessage = message;

    const followUps = await generateFollowUps(data, analysis);
    renderFollowUps(followUps);

    // Scroll to results
    $('analysis-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('✅ AI analysis complete!');
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
  const msg = $('message-text').value;
  if (!msg) return showToast('⚠️ Generate a message first');
  navigator.clipboard.writeText(msg).then(() => showToast('✅ Message copied!')).catch(() => showToast('❌ Copy failed'));
}

function sendViaWhatsApp() {
  const msg = $('message-text').value;
  const phone = getFormData().phoneNumber.replace(/\s|-/g, '');
  if (!msg) return showToast('⚠️ Generate a message first');
  if (!phone) return showToast('⚠️ Add a phone number first');
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
}

// ===== CONTACT SAVE =====
function saveContact() {
  const data = getFormData();
  const msg = $('message-text').value;
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
  const term = ($('crm-search')?.value || '').toLowerCase();
  const filter = $('crm-filter')?.value || 'all';

  $('stat-total').textContent = contacts.length;
  $('stat-interested').textContent = contacts.filter(c => c.status === 'interested').length;
  $('stat-converted').textContent = contacts.filter(c => c.converted).length;

  const filtered = contacts.filter(c => {
    const match = !term || c.businessName.toLowerCase().includes(term) || (c.contactPerson || '').toLowerCase().includes(term);
    const status = filter === 'all' || c.status === filter;
    return match && status;
  });

  const list = $('contacts-list');
  if (contacts.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">📭</div>
      <div class="empty-state-title">No contacts yet</div>
      <div class="empty-state-desc">Save your first business contact after analysing.</div>
    </div>`;
    return;
  }
  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">🔍</div>
      <div class="empty-state-title">No matches found</div>
      <div class="empty-state-desc">Try a different search or filter.</div>
    </div>`;
    return;
  }

  const statusBadge = s => {
    const labels = { 'new': 'New', 'contacted': 'Contacted', 'interested': 'Interested', 'not-interested': 'Not Interested', 'converted': 'Converted' };
    return `<span class="status-badge status-${s}">${labels[s] || s}</span>`;
  };
  const interestBadge = lvl => {
    const cls = lvl === 'High' ? 'interest-high' : lvl === 'Low' ? 'interest-low' : 'interest-medium';
    return `<span class="interest-badge ${cls}">${lvl}</span>`;
  };

  list.innerHTML = `<table class="contact-table">
    <thead><tr>
      <th>Business</th><th>Phone</th><th>Industry</th><th>Interest</th><th>Status</th><th>Follow-up</th><th></th>
    </tr></thead>
    <tbody>${filtered.map(c => `
      <tr onclick="openContactModal('${c.id}')">
        <td class="name-cell"><strong>${escapeHtml(c.businessName)}</strong><small>${escapeHtml(c.contactPerson || '—')}</small></td>
        <td>${escapeHtml(c.phoneNumber)}</td>
        <td>${escapeHtml(c.industryLabel || c.businessType)}</td>
        <td>${interestBadge(c.interestLevel)}</td>
        <td>${statusBadge(c.status)}</td>
        <td>${c.followUpDate ? formatDate(c.followUpDate) : '—'}</td>
        <td><button class="delete-btn" onclick="event.stopPropagation();deleteContact('${c.id}')" title="Delete">🗑️</button></td>
      </tr>
    `).join('')}</tbody>
  </table>`;
}

function openContactModal(id) {
  const contacts = getContacts();
  const c = contacts.find(x => x.id === id);
  if (!c) return;

  $('modal-business').textContent = c.businessName;
  $('modal-contact').textContent = c.contactPerson || c.phoneNumber;
  $('modal-phone').textContent = c.phoneNumber;
  $('modal-website').textContent = c.website || '—';
  $('modal-type').textContent = c.industryLabel || c.businessType;
  $('modal-summary').textContent = c.messageSummary || 'No message saved yet.';
  $('modal-objections').textContent = c.objections || 'None raised';
  $('modal-interest').textContent = c.interestLevel;
  $('modal-followup').textContent = c.followUpDate ? formatDate(c.followUpDate) : 'Not scheduled';

  // Status buttons
  const statuses = ['new', 'contacted', 'interested', 'not-interested', 'converted'];
  const statusLabels = { 'new': 'New', 'contacted': 'Contacted', 'interested': 'Interested', 'not-interested': 'Not Interested', 'converted': 'Converted' };
  $('modal-status').innerHTML = statuses.map(s =>
    `<button type="button" class="btn btn-sm ${c.status === s ? 'btn-wa' : 'btn-outline'}" style="margin-right:.5rem;margin-bottom:.5rem" onclick="updateContactStatus('${c.id}','${s}')">${statusLabels[s]}</button>`
  ).join('');

  // Button handlers
  $('modal-edit-btn').onclick = () => editContact(c.id);
  $('modal-followup-btn').onclick = () => scheduleFollowUp(c.id);
  $('modal-close-btn').onclick = () => closeModal();

  $('contact-modal').classList.add('active');
}

function closeModal() {
  $('contact-modal').classList.remove('active');
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

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Form submission
  const form = $('sales-form');
  if (form) form.addEventListener('submit', handleFormSubmit);

  // Copy button
  const copyBtn = $('copy-btn');
  if (copyBtn) copyBtn.addEventListener('click', copyMessage);

  // CRM navigation
  const crmNavLink = document.querySelector('.crm-nav-link');
  if (crmNavLink) {
    crmNavLink.addEventListener('click', (e) => {
      e.preventDefault();
      showCRM();
    });
  }

  const backBtn = $('back-to-tool-btn');
  if (backBtn) backBtn.addEventListener('click', showTool);

  // CRM search & filter
  const searchInput = $('crm-search');
  const filterSelect = $('crm-filter');
  if (searchInput) searchInput.addEventListener('input', renderCRM);
  if (filterSelect) filterSelect.addEventListener('change', renderCRM);

  // Close modal on backdrop click
  const modal = $('contact-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  renderCRM();
});
