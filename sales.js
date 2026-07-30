/* ===== WhatsApp AI Sales Assistant ===== */
/* Pure vanilla JS — no API keys needed */

// ===== DATA LAYER =====
const STORAGE_KEY = 'wa_sales_contacts';

function getContacts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function saveContacts(contacts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

// ===== INDUSTRY KNOWLEDGE =====
const INDUSTRIES = {
  dental: {
    name: 'Dental Practice',
    whatTheyDo: 'Provide dental care services including routine check-ups, cleanings, fillings, cosmetic dentistry, and emergency dental work.',
    services: ['General dentistry & examinations', 'Teeth whitening & cosmetic procedures', 'Root canals & extractions', 'Dental implants & orthodontics', 'Emergency dental care'],
    challenges: ['Scheduling conflicts and no-shows eat up valuable chair time', 'New patient enquiries often come after hours when desks are closed', 'Competition from other local practices means leads must be captured fast', 'Staff spend time on phones instead of with patients'],
    benefits: 'An AI receptionist answers every call instantly, books appointments directly into your system, and follows up with patients who missed calls — so your practice never loses a booking to voicemail.'
  },
  medical: {
    name: 'Medical / Clinic',
    whatTheyDo: 'Deliver healthcare services to patients, managing appointments, follow-ups, and patient enquiries.',
    services: ['General consultations', 'Specialist referrals', 'Chronic disease management', 'Lab work & diagnostics', 'Patient follow-ups'],
    challenges: ['High patient volumes mean many calls go unanswered during clinic hours', 'After-hours enquiries pile up overnight', 'Staff are stretched between patient care and admin', 'Missed follow-ups lead to poor patient outcomes'],
    benefits: 'Your AI receptionist handles every patient call 24/7, books appointments, sends reminders, and ensures no enquiry falls through the cracks — freeing staff to focus on care.'
  },
  beauty: {
    name: 'Beauty Salon / Spa',
    whatTheyDo: 'Offer beauty and wellness services including hair, nails, skincare, massages, and spa treatments.',
    services: ['Hair styling & colouring', 'Manicures & pedicures', 'Facials & skincare', 'Massage therapy', 'Bridal & event packages'],
    challenges: ['Peak booking times overwhelm the front desk', 'Clients calling after hours can\'t book appointments', 'Competition is fierce — clients will move to the salon that answers first', 'Staff are hands-on with clients and can\'t answer phones'],
    benefits: 'Your AI receptionist books every client instantly, even at midnight, sends appointment reminders to reduce no-shows, and upsells packages — 24/7 with no extra staff needed.'
  },
  restaurant: {
    name: 'Restaurant',
    whatTheyDo: 'Serve food and drinks to diners, handling reservations, takeout orders, and catering enquiries.',
    services: ['Dine-in service', 'Takeaway & delivery', 'Private event catering', 'Group bookings', 'Special menu requests'],
    challenges: ['Lunch and dinner rushes make it impossible to answer every call', 'Lost reservation enquiries mean lost revenue', 'Staff can\'t juggle the floor, kitchen, and phones', 'Catering enquiries often need quick responses to win the booking'],
    benefits: 'An AI receptionist takes every reservation call, handles catering enquiries instantly, and captures orders even during the busiest service — no missed revenue.'
  },
  fitness: {
    name: 'Fitness / Gym',
    whatTheyDo: 'Provide fitness services including gym access, personal training, group classes, and wellness programmes.',
    services: ['Gym memberships', 'Personal training', 'Group fitness classes', 'Nutrition coaching', 'Corporate wellness'],
    challenges: ['Prospects enquiring about memberships need instant answers or they walk away', 'High staff turnover means inconsistent phone handling', 'Trial sign-ups need prompt follow-up to convert', 'Evening peak hours make phones ring off the hook'],
    benefits: 'Your AI receptionist answers every membership enquiry, books trial sessions, and follows up with prospects — turning more enquiries into paying members around the clock.'
  },
  'home-services': {
    name: 'Home Services',
    whatTheyDo: 'Provide home service solutions like plumbing, electrical work, cleaning, or repairs.',
    services: ['Emergency repairs', 'Routine maintenance', 'Installations & upgrades', 'Inspections & quotes', 'Service contracts'],
    challenges: ['Emergency calls come in at all hours — missing them means losing to competitors', 'Quotes need fast turnaround or customers hire someone else', 'Owners are often on-site and can\'t answer phones', 'Seasonal demand spikes overwhelm small teams'],
    benefits: 'Your AI receptionist captures every emergency call, books assessments instantly, and follows up on quote requests — so you never lose a job to a competitor who answered first.'
  },
  'real-estate': {
    name: 'Real Estate / Rental',
    whatTheyDo: 'Handle property sales, rentals, and management services for landlords and tenants.',
    services: ['Property sales', 'Rental management', 'Tenant screening', 'Property valuations', 'Lease renewals'],
    challenges: ['Property enquiries come in 24/7 — especially after work hours', 'Missing a serious buyer\'s call can mean losing a R2M+ sale', 'Agents are in showings and can\'t be on the phone', 'Rental applications need fast processing'],
    benefits: 'Your AI receptionist qualifies every lead, books viewings, and captures buyer details instantly — so you never miss a serious enquiry, day or night.'
  },
  legal: {
    name: 'Law Firm',
    whatTheyDo: 'Provide legal services across various practice areas to individuals and businesses.',
    services: ['Consultations & case reviews', 'Contract drafting', 'Litigation & dispute resolution', 'Conveyancing & property law', 'Estate planning'],
    challenges: ['Potential clients often call multiple firms — the first to respond wins the case', 'Consultation bookings during business hours are chaotic', 'Billing inquiries take up reception time', 'After-hours calls from distressed clients need immediate acknowledgment'],
    benefits: 'An AI receptionist captures every potential client instantly, qualifies their matter, and books consultations — ensuring your firm is always first to respond.'
  },
  retail: {
    name: 'Retail Store',
    whatTheyDo: 'Sell products directly to consumers in a physical or online storefront.',
    services: ['Product sales', 'Special orders', 'Lay-bys & financing', 'Gift registry', 'Loyalty programmes'],
    challenges: ['Floor staff can\'t answer phones during rushes', 'Product availability queries waste time for both staff and customers', 'Online competition means in-store service must be excellent', 'After-hours enquiries disappear if not answered'],
    benefits: 'Your AI receptionist answers product queries, checks stock, books consultations, and captures sales that would otherwise walk away — 24/7.'
  },
  auto: {
    name: 'Auto Mechanic / Dealer',
    whatTheyDo: 'Provide vehicle repairs, servicing, maintenance, and vehicle sales.',
    services: ['Vehicle servicing & repairs', 'Diagnostics & inspections', 'Tyre replacement', 'Vehicle sales', 'Service plans & maintenance contracts'],
    challenges: ['Mechanics are under vehicles and can\'t answer phones', 'Customers compare quotes — the fastest response wins the job', 'Emergency breakdown calls come in anytime', 'Booking systems get overwhelmed during peak season'],
    benefits: 'Your AI receptionist takes every booking call, provides quotes for common services, and follows up with pending enquiries — keeping your bays full.'
  },
  education: {
    name: 'Education / Tutoring',
    whatTheyDo: 'Provide educational services including tutoring, courses, and skills training.',
    services: ['One-on-one tutoring', 'Group classes', 'Online courses', 'Test preparation', 'Skills workshops'],
    challenges: ['Parent and student enquiries spike during registration periods', 'Scheduling across multiple tutors is complex', 'Prospects enquiring about courses need immediate info or they move on', 'Small teams handle teaching AND admin'],
    benefits: 'An AI receptionist answers every enquiry, books trial lessons, and sends follow-ups — turning more enquiries into enrolled students.'
  },
  tech: {
    name: 'Tech / IT Services',
    whatTheyDo: 'Provide technology services including IT support, software development, web design, and consulting.',
    services: ['IT support & helpdesk', 'Software development', 'Web design & development', 'Cloud solutions', 'Cybersecurity consulting'],
    challenges: ['Clients need immediate responses for IT emergencies', 'Project scoping calls take up senior staff time', 'Prospects expect fast quotes in a competitive market', 'Support tickets pile up outside business hours'],
    benefits: 'Your AI receptionist captures every lead, qualifies technical needs, and books discovery calls — so your team focuses on delivering, not triaging phones.'
  },
  consulting: {
    name: 'Consulting',
    whatTheyDo: 'Offer professional consulting services across business, financial, or management domains.',
    services: ['Strategy consulting', 'Financial advisory', 'Business coaching', 'Process optimisation', 'Market research'],
    challenges: ['High-value prospects evaluate multiple consultants — responsiveness wins', 'Discovery calls are hard to schedule across busy calendars', 'Follow-ups on proposals often slip through the cracks', 'Small teams juggle client delivery and business development'],
    benefits: 'An AI receptionist captures every enquiry instantly, qualifies the lead, and books discovery calls — ensuring you\'re always the most responsive consultant in the room.'
  },
  other: {
    name: 'Other Business',
    whatTheyDo: 'Operate a business that serves customers and needs to manage enquiries, bookings, and sales.',
    services: ['Customer service & enquiries', 'Booking & scheduling', 'Sales & follow-ups', 'Lead capture', 'General support'],
    challenges: ['Missed calls mean missed revenue', 'After-hours enquiries are lost', 'Staff can\'t balance core work and phones', 'Leads go cold when follow-ups are delayed'],
    benefits: 'Your AI receptionist answers every call, captures leads, books appointments, and follows up automatically — so you never miss an opportunity.'
  }
};

// ===== BUSINESS ANALYSIS =====
function analyseBusiness(data) {
  const industry = INDUSTRIES[data.businessType] || INDUSTRIES.other;

  const analysis = {
    whatTheyDo: industry.whatTheyDo,
    services: industry.services,
    challenges: industry.challenges,
    benefits: industry.benefits,
    industryName: industry.name
  };

  // Add custom context from notes
  if (data.notes && data.notes.trim()) {
    analysis.customNote = `Additional context: ${data.notes}`;
  }

  return analysis;
}

// ===== GENERATE SALES STRATEGY =====
function generateStrategy(data, analysis) {
  const personalised = [];

  personalised.push(`Lead with empathy: ${data.businessName} likely struggles with ${analysis.challenges[0].toLowerCase()}`);
  personalised.push(`Highlight the ${analysis.services[0]} angle — connect AI receptionist value directly to their core service offering`);
  personalised.push(`Address the biggest pain: staff time wasted on phones instead of ${data.businessType === 'home-services' ? 'on-site work' : 'customer-facing tasks'}`);
  personalised.push(`Use social proof: mention similar businesses in ${analysis.industryName.toLowerCase()} who saw increased bookings after switching to AI`);
  personalised.push(`Offer a low-risk demo: "Can I show you how it works in a 5-minute WhatsApp call?"`);

  return personalised;
}

// ===== GENERATE WHATSAPP MESSAGE =====
function generateMessage(data, analysis) {
  const greeting = data.contactPerson ?
    `Hi ${data.contactPerson}! 👋` :
    `Hi there! 👋`;

  const intro = `My name is Alex, and I'm an AI assistant reaching out from AI Receptionist — a company that helps ${analysis.industryName.toLowerCase()} businesses like ${data.businessName} never miss a customer call again.`;

  const insight = `I noticed that many ${analysis.industryName.toLowerCase()} businesses face challenges like ${analysis.challenges[0].toLowerCase().replace(/\.$/, '')}. Our AI receptionist is specifically designed to solve this — it answers calls 24/7, books appointments automatically, and follows up with leads who couldn't get through.`;

  const benefit = `Here's what this means for ${data.businessName}:\n• Never miss a customer call again — even after hours\n• Book appointments directly into your system\n• Reduce staff time on phones so they can focus on customers\n• Capture every lead and follow up automatically`;

  const cta = `Would you be open to a quick 5-minute demo? I can show you exactly how it works via WhatsApp — no commitment needed. Just reply "Yes" and I'll set it up! 😊`;

  return `${greeting}\n\n${intro}\n\n${insight}\n\n${benefit}\n\n${cta}\n\nBest regards,\nAlex\nAI Receptionist | AI-Powered Sales`;
}

// ===== FOLLOW-UP SUGGESTIONS =====
function generateFollowUps(data, analysis) {
  return [
    `Follow up in 2 days with: "Hi ${data.contactPerson || 'there'}! Just checking if you had a chance to think about the AI receptionist demo. Happy to answer any questions!"`,
    `If no response after 5 days, send a case study: a similar ${analysis.industryName.toLowerCase()} business that increased bookings by 30%`,
    `After 7 days, offer a free audit: "I'd love to show you how many calls ${data.businessName} might be missing — want me to run a quick analysis?"`,
    `If they replied but weren't sure, send a voice demo: record a sample AI call and WhatsApp it to them`
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
    showToast('Please fill in all required fields');
    return;
  }

  // Analyse
  const analysis = analyseBusiness(data);
  displayAnalysis(analysis);

  // Generate strategy
  const strategy = generateStrategy(data, analysis);
  displayStrategy(strategy);

  // Generate message
  const message = generateMessage(data, analysis);
  document.getElementById('message-text').value = message;

  // Generate follow-ups
  const followUps = generateFollowUps(data, analysis);
  displayFollowUps(followUps);

  // Store current data for save
  window._currentData = data;
  window._currentAnalysis = analysis;
  window._currentMessage = message;

  showToast('Business analysed successfully!');
}

// ===== DISPLAY FUNCTIONS =====
function displayAnalysis(analysis) {
  document.getElementById('analysis-what-they-do').textContent = analysis.whatTheyDo;
  document.getElementById('analysis-services').textContent = analysis.services.map(s => `• ${s}`).join('\n');
  document.getElementById('analysis-challenges').innerHTML = analysis.challenges.map(c =>
    `<div style="padding:.4rem 0;font-size:.88rem;border-bottom:1px solid var(--border-color);color:#d1fae5">⚡ ${c}</div>`
  ).join('');
  if (analysis.customNote) {
    document.getElementById('analysis-challenges').innerHTML +=
      `<div style="padding:.5rem;margin-top:.5rem;background:rgba(99,102,241,.1);border-radius:8px;font-size:.85rem;color:#c7d2fe">📝 ${analysis.customNote}</div>`;
  }
  document.getElementById('analysis-panel').classList.add('active');
}

function displayStrategy(items) {
  document.getElementById('strategy-list').innerHTML = items.map(item =>
    `<li><span style="color:var(--accent-primary);flex-shrink:0">&#x2713;</span><span style="color:#d1fae5">${item}</span></li>`
  ).join('');
  document.getElementById('strategy-panel').classList.add('active');
}

function displayFollowUps(items) {
  document.getElementById('followup-list').innerHTML = items.map(item =>
    `<li><span style="flex-shrink:0">&#x1F551;</span><span style="color:#d1fae5;font-size:.84rem">${item}</span></li>`
  ).join('');
  document.getElementById('followup-panel').classList.add('active');
}

// ===== WHATSAPP =====
function sendViaWhatsApp() {
  const message = document.getElementById('message-text').value.trim();
  const phone = document.getElementById('phoneNumber').value.trim();

  if (!message) {
    showToast('Please generate a message first');
    return;
  }

  if (!phone) {
    showToast('Please enter a phone number');
    return;
  }

  // Clean phone number — remove spaces, dashes, plus
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');

  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
}

// ===== SAVE CONTACT =====
function saveContact() {
  if (!window._currentData) {
    showToast('Please analyse a business first');
    return;
  }

  const contacts = getContacts();
  const existingIndex = contacts.findIndex(c =>
    c.phoneNumber === window._currentData.phoneNumber
  );

  const contactRecord = {
    id: existingIndex >= 0 ? contacts[existingIndex].id : Date.now(),
    businessName: window._currentData.businessName,
    contactPerson: window._currentData.contactPerson,
    phoneNumber: window._currentData.phoneNumber,
    website: window._currentData.websiteUrl,
    businessType: window._currentData.businessType,
    industryLabel: window._currentAnalysis.industryName,
    notes: window._currentData.notes,
    messageSummary: window._currentMessage.substring(0, 150) + '...',
    objections: 'None raised yet',
    interestLevel: 'Medium',
    status: 'new',
    followUpDate: '',
    converted: false,
    createdAt: existingIndex >= 0 ? contacts[existingIndex].createdAt : new Date().toISOString()
  };

  if (existingIndex >= 0) {
    contacts[existingIndex] = contactRecord;
  } else {
    contacts.unshift(contactRecord);
  }

  saveContacts(contacts);
  showToast('Contact saved successfully!');
}

// ===== CRM =====
function showCRM() {
  document.getElementById('tool-view').style.display = 'none';
  document.getElementById('crm-view').style.display = 'block';
  renderCRM();
}

function showTool() {
  document.getElementById('tool-view').style.display = 'block';
  document.getElementById('crm-view').style.display = 'none';
}

function renderCRM() {
  const contacts = getContacts();
  const searchTerm = (document.getElementById('crm-search')?.value || '').toLowerCase();
  const filterStatus = document.getElementById('crm-filter')?.value || 'all';

  // Stats
  document.getElementById('stat-total').textContent = contacts.length;
  document.getElementById('stat-interested').textContent =
    contacts.filter(c => c.status === 'interested').length;
  document.getElementById('stat-converted').textContent =
    contacts.filter(c => c.converted).length;

  // Filter
  let filtered = contacts.filter(c => {
    const matchSearch = !searchTerm ||
      c.businessName.toLowerCase().includes(searchTerm) ||
      (c.contactPerson || '').toLowerCase().includes(searchTerm);
    const matchFilter = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const list = document.getElementById('contacts-list');

  if (contacts.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">&#x1F465;</div>
        <div class="empty-state-title">No contacts yet</div>
        <div class="empty-state-desc">Save your first business contact to start tracking your pipeline.</div>
        <button class="btn btn-sm btn-outline" onclick="showTool()">Go to Sales Tool</button>
      </div>`;
    return;
  }

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">&#x1F50D;</div>
        <div class="empty-state-title">No matches found</div>
        <div class="empty-state-desc">Try adjusting your search or filter.</div>
      </div>`;
    return;
  }

  list.innerHTML = `<table class="contact-table">
    <thead><tr>
      <th>Business</th>
      <th>Industry</th>
      <th>Interest</th>
      <th>Status</th>
      <th>Follow-up</th>
      <th></th>
    </tr></thead>
    <tbody>
      ${filtered.map(c => `<tr onclick="openContactModal('${c.id}')">
        <td class="name-cell">
          <strong>${escapeHtml(c.businessName)}</strong>
          <small>${escapeHtml(c.contactPerson || c.phoneNumber)}</small>
        </td>
        <td><span style="color:var(--text-secondary)">${escapeHtml(c.industryLabel || c.businessType)}</span></td>
        <td><span class="interest-badge interest-${c.interestLevel.toLowerCase()}">${c.interestLevel}</span></td>
        <td><span class="status-badge status-${c.status}">${formatStatus(c.status)}</span></td>
        <td>${c.followUpDate ? formatDate(c.followUpDate) : '<span style="color:var(--text-secondary)">—</span>'}</td>
        <td><button class="delete-btn" onclick="event.stopPropagation();deleteContact('${c.id}')">&#x1F5D1;</button></td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function openContactModal(id) {
  const contacts = getContacts();
  const contact = contacts.find(c => c.id == id);
  if (!contact) return;

  document.getElementById('modal-business').textContent = contact.businessName;
  document.getElementById('modal-contact').textContent =
    contact.contactPerson ? `Attn: ${contact.contactPerson}` : contact.phoneNumber;
  document.getElementById('modal-phone').textContent = contact.phoneNumber;
  document.getElementById('modal-website').textContent = contact.website || '—';
  document.getElementById('modal-type').textContent = contact.industryLabel || contact.businessType;
  document.getElementById('modal-summary').textContent = contact.messageSummary || 'No summary available';
  document.getElementById('modal-objections').textContent = contact.objections || 'None raised';
  document.getElementById('modal-interest').textContent = contact.interestLevel;
  document.getElementById('modal-followup').textContent = contact.followUpDate ? formatDate(contact.followUpDate) : 'Not scheduled';

  // Status buttons
  const statuses = ['new', 'contacted', 'interested', 'not-interested', 'converted'];
  document.getElementById('modal-status').innerHTML = statuses.map(s =>
    `<button class="btn btn-sm ${contact.status === s ? 'btn-wa' : 'btn-outline'}"
      style="margin:0.2rem" onclick="updateContactStatus(${id}, '${s}')">${formatStatus(s)}</button>`
  ).join('');

  // Edit button
  document.getElementById('modal-edit-btn').onclick = () => editContact(id);
  document.getElementById('modal-followup-btn').onclick = () => scheduleFollowUp(id);
  document.getElementById('modal-close-btn').onclick = closeModal;

  document.getElementById('contact-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('contact-modal').classList.remove('active');
}

function updateContactStatus(id, status) {
  const contacts = getContacts();
  const contact = contacts.find(c => c.id == id);
  if (!contact) return;

  contact.status = status;
  contact.converted = status === 'converted';
  if (status === 'interested') contact.interestLevel = 'High';
  if (status === 'not-interested') contact.interestLevel = 'Low';

  saveContacts(contacts);
  closeModal();
  renderCRM();
  showToast('Status updated');
}

function deleteContact(id) {
  if (!confirm('Delete this contact?')) return;
  const contacts = getContacts().filter(c => c.id != id);
  saveContacts(contacts);
  renderCRM();
  showToast('Contact deleted');
}

function editContact(id) {
  const contacts = getContacts();
  const contact = contacts.find(c => c.id == id);
  if (!contact) return;

  const newFollowUp = prompt('Enter follow-up date (YYYY-MM-DD):', contact.followUpDate || '');
  if (newFollowUp !== null) {
    contact.followUpDate = newFollowUp;
    saveContacts(contacts);
    closeModal();
    renderCRM();
    showToast('Follow-up updated');
  }
}

function scheduleFollowUp(id) {
  const contacts = getContacts();
  const contact = contacts.find(c => c.id == id);
  if (!contact) return;

  const date = prompt('Enter follow-up date (YYYY-MM-DD):');
  if (date) {
    contact.followUpDate = date;
    if (contact.status === 'new') contact.status = 'contacted';
    saveContacts(contacts);
    closeModal();
    renderCRM();
    showToast('Follow-up scheduled');
  }
}

// ===== HELPERS =====
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatStatus(status) {
  const labels = {
    'new': 'New',
    'contacted': 'Contacted',
    'interested': 'Interested',
    'not-interested': 'Not Interested',
    'converted': 'Converted'
  };
  return labels[status] || status;
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  } catch { return dateStr; }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== COPY BUTTON =====
document.addEventListener('DOMContentLoaded', function() {
  // Copy message
  const copyBtn = document.getElementById('copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      const msg = document.getElementById('message-text').value;
      if (msg) {
        navigator.clipboard.writeText(msg).then(() => showToast('Message copied!'));
      }
    });
  }

  // CRM nav
  document.querySelector('.crm-nav-link')?.addEventListener('click', function(e) {
    e.preventDefault();
    showCRM();
  });

  // Back to tool
  document.getElementById('back-to-tool-btn')?.addEventListener('click', showTool);

  // CRM search & filter
  document.getElementById('crm-search')?.addEventListener('input', renderCRM);
  document.getElementById('crm-filter')?.addEventListener('change', renderCRM);

  // Form
  document.getElementById('sales-form').addEventListener('submit', handleFormSubmit);

  // Close modal on backdrop click
  document.getElementById('contact-modal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
});
