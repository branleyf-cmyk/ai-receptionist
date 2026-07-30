// ===================================================================
// WHATSAPP AI SALES ASSISTANT — MAIN JAVASCRIPT
// Controls: Form handling, Gemini AI calls, message generation,
//           conversation tracking, follow-ups, and CRM dashboard
// ===================================================================

// ===== STATE MANAGEMENT =====
// Active contact being worked on right now
let activeContact = null;

// Current filter for CRM list
let currentFilter = 'all';

// Current AI suggestion text (for "Use This Response" button)
let currentAiSuggestion = '';

// ===== GOOGLE GEMINI API CALLER =====
// Central function that sends prompts to Gemini and returns the text response
async function callGemini(prompt) {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    showToast('error', 'Please set up your free Google Gemini API key first');
    openApiModal();
    throw new Error('No API key');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from AI');
  return text;
}

// ===== ANALYSE THE BUSINESS =====
// Sends business info to Gemini and gets back a detailed analysis
async function analyseBusiness() {
  const data = getFormData();
  if (!data) return null;

  // Try to fetch website content for richer analysis
  let websiteContext = '';
  if (data.website) {
    try {
      const siteText = await fetchWebsiteSummary(data.website);
      if (siteText) {
        websiteContext = `\n\nWebsite content summary:\n${siteText}`;
      }
    } catch (e) {
      websiteContext = ` (Could not fetch website content)`;
    }
  }

  const prompt = `You are an expert B2B sales analyst. Analyse this business and identify how an AI Receptionist service could help them.

BUSINESS DETAILS:
- Name: ${data.businessName}
- Contact Person: ${data.contactPerson}
- Phone: ${data.phone}
- Website: ${data.website || 'None provided'}
- Industry/Type: ${data.businessType}
- Notes: ${data.notes || 'None'}${websiteContext}

Provide a structured analysis with these sections (use **bold** for headings):

**What They Do:**
2-3 sentences about what this business likely does based on their industry.

**Likely Challenges:**
Bullet list of 3-5 challenges common to this industry (missed calls, after-hours inquiries, lead follow-up, admin workload, etc.)

**How AI Receptionist Helps:**
Bullet list of 3-5 specific ways our AI Receptionist (never miss calls, 24/7 availability, auto booking, lead capture, follow-up) solves their specific problems.

**Key Benefits for Them:**
Bullet list of 3-4 measurable benefits (more revenue, saved time, better service, etc.) that would resonate with a ${data.businessType} business owner.`;

  const result = await callGemini(prompt);
  return result;
}

// ===== GENERATE SALES STRATEGY =====
async function generateSalesStrategy(analysis) {
  const data = getFormData();
  if (!data) return null;

  const prompt = `You are a senior sales strategist. Based on this business analysis, create a sales approach:

BUSINESS: ${data.businessName} (${data.businessType})
CONTACT: ${data.contactPerson}

ANALYSIS:
${analysis}

Provide a structured sales strategy with these sections (use **bold** for headings):

**Key Talking Points:**
3-5 bullet points for the opening conversation — specific to this business, not generic.

**Likely Objections & Responses:**
For each of these common objections, write a polite, confident response:
1. "We already have someone handling calls"
2. "We can't afford it right now"
3. "I don't trust AI to represent our business"
4. "Our customers prefer talking to humans"
Format: "Objection:" then "Response:" for each.

**Questions to Ask:**
3-4 open-ended questions that uncover their pain points and build rapport.

**Next Steps:**
How to guide them toward a free demo call with our team (don't push — make it feel natural and low-pressure).`;

  const result = await callGemini(prompt);
  return result;
}

// ===== GENERATE WHATSAPP MESSAGE =====
async function generateWhatsAppMessage(analysis) {
  const data = getFormData();
  if (!data) return null;

  const prompt = `You are writing a WhatsApp sales message on behalf of an AI Receptionist company. Write the message from the perspective of a friendly WhatsApp AI assistant reaching out to a potential client.

TARGET BUSINESS: ${data.businessName}
CONTACT: ${data.contactPerson}
INDUSTRY: ${data.businessType}
WEBSITE: ${data.website || 'Not provided'}

ANALYSIS:
${analysis}

Write a WhatsApp message that:
1. Opens with a warm, personalised greeting using their name/business
2. Honestly introduces you as a WhatsApp AI assistant reaching out on behalf of AI Receptionist
3. Shows you understand their specific business (mention their industry, what they do)
4. Explains how the AI receptionist could help THEM specifically (2-3 key benefits)
5. Asks a genuine question about their current process
6. Is professional yet warm and conversational
7. Is between 150-250 words
8. Uses line breaks for readability on WhatsApp
9. Uses 1-2 subtle emojis max
10. Does NOT use aggressive sales language or make false claims
11. Ends with a soft call-to-action

The message should sound like a highly experienced, friendly sales rep — not a robot, not pushy.`;

  const result = await callGemini(prompt);
  return result;
}

// ===== GENERATE AI FOLLOW-UP SUGGESTION =====
async function generateFollowUpSuggestion(conversationHistory) {
  const data = getFormData();
  if (!data) return null;

  const historyText = conversationHistory
    .map(m => {
      const label = m.role === 'us' ? 'You' : data.contactPerson || 'Client';
      return `${label}: ${m.text}`;
    })
    .join('\n\n');

  const prompt = `You are a senior sales coach. Here is the conversation so far with ${data.contactPerson} from ${data.businessName} (${data.businessType}):

CONVERSATION HISTORY:
${historyText}

Based on the conversation:
1. What is their current interest level? (High / Medium / Low / Not Interested)
2. What objection or concern did they raise (if any)?
3. Write a suggested follow-up response (80-150 words) that:
   - Acknowledges their point respectfully
   - Addresses their concern with a specific solution or proof
   - Moves toward booking a demo or next step
   - Sounds friendly and professional
   - Uses 0-1 emoji
   - Is suitable for WhatsApp

Format your response as:
**Interest Level:** [High/Medium/Low/Not Interested]
**Objection:** [What they said or "None"]
**Suggested Response:**
[Your response here]`;

  const result = await callGemini(prompt);
  return result;
}

// ===== FETCH WEBSITE CONTENT SUMMARY =====
// Lightweight: use a public service to get text from URLs
async function fetchWebsiteSummary(url) {
  try {
    // Use r.jina.ai as a text extraction proxy (free, no key needed)
    const resp = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'X-Return-Format': 'text' }
    });
    if (!resp.ok) return null;
    const text = await resp.text();
    // Take first 1500 chars to keep the prompt small
    return text.substring(0, 1500).replace(/\s+/g, ' ').trim();
  } catch {
    return null;
  }
}

// ===== FORM HANDLING =====
function getFormData() {
  const businessName = document.getElementById('business-name').value.trim();
  const phone = document.getElementById('phone-number').value.trim();
  const businessType = document.getElementById('business-type').value;

  if (!businessName || !phone || !businessType) {
    showToast('error', 'Please fill in Business Name, Phone Number, and Business Type');
    return null;
  }

  return {
    businessName,
    contactPerson: document.getElementById('contact-person').value.trim(),
    phone: phone.replace(/[\s\-\(\)]/g, ''),
    website: document.getElementById('website-url').value.trim(),
    businessType,
    notes: document.getElementById('notes').value.trim()
  };
}

// ===== MAIN: ANALYSE & GENERATE (called from "Analyse" button) =====
async function analyseAndGenerate() {
  const data = getFormData();
  if (!data) return;

  // Check API key
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    showToast('error', 'Please set up your free Google Gemini API key first');
    openApiModal();
    return;
  }

  // Show loading states
  setOutputStatus('analysis-status', 'loading', 'Analysing...');
  setOutputStatus('strategy-status', 'loading', 'Waiting...');

  const analyseBtn = document.getElementById('analyse-btn');
  analyseBtn.disabled = true;
  analyseBtn.innerHTML = '<span class="spinner"></span> Analysing Business...';

  try {
    // Step 1: Analyse the business
    const analysis = await analyseBusiness();
    if (analysis) {
      displayAnalysis(analysis);
      setOutputStatus('analysis-status', 'active', 'Complete');
    }

    // Step 2: Generate sales strategy
    setOutputStatus('strategy-status', 'loading', 'Generating...');
    const strategy = await generateSalesStrategy(analysis);
    if (strategy) {
      displayStrategy(strategy);
      setOutputStatus('strategy-status', 'active', 'Complete');
    }

    // Step 3: Generate WhatsApp message
    const message = await generateWhatsAppMessage(analysis);
    if (message) {
      displayWhatsAppMessage(message);
      document.getElementById('send-whatsapp-btn').disabled = false;
    }

    // Save/update contact in CRM
    saveOrUpdateContact();

    showToast('success', 'Analysis complete! Review the message and send when ready.');

  } catch (err) {
    console.error('Generate error:', err);
    showToast('error', 'Error generating analysis: ' + err.message);
  } finally {
    analyseBtn.disabled = false;
    analyseBtn.innerHTML = '🧠 Analyse Business & Generate Message';
  }
}

// ===== DISPLAY FUNCTIONS =====
function displayAnalysis(text) {
  const output = document.getElementById('analysis-output');
  output.innerHTML = `<div class="analysis-content">${formatMarkdown(text)}</div>`;
}

function displayStrategy(text) {
  const output = document.getElementById('strategy-output');
  output.innerHTML = `<div class="strategy-content">${formatMarkdown(text)}</div>`;
}

function displayWhatsAppMessage(text) {
  const preview = document.getElementById('whatsapp-message-preview');
  preview.innerHTML = `<div class="wa-message-text">${escapeHtml(text)}</div>`;

  const textarea = document.getElementById('message-editor-textarea');
  textarea.value = text;
  autoResizeTextarea(textarea);
}

// ===== MARKDOWN FORMATTER (lightweight) =====
function formatMarkdown(text) {
  let html = escapeHtml(text);
  // Bold **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Headings ### and ##
  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h4>$1</h4>');
  // Bullets
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  // Wrap list items
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
  // Clean up nested <ul>
  html = html.replace(/<\/ul>\s*<ul>/g, '');
  return `<p>${html}</p>`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== STATUS INDICATORS =====
function setOutputStatus(id, status, text) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'output-status' + (status === 'loading' ? ' loading' : status === 'active' ? ' active' : status === 'error' ? ' error' : '');
}

// ===== WHATSAPP SEND =====
function sendViaWhatsApp() {
  const textarea = document.getElementById('message-editor-textarea');
  const message = textarea.value.trim();
  if (!message) {
    showToast('error', 'No message to send');
    return;
  }

  const data = getFormData();
  if (!data) return;

  // Format phone for wa.me (strip non-digits, handle SA numbers)
  let phone = data.phone;
  phone = phone.replace(/\D/g, '');
  if (phone.startsWith('0')) phone = '27' + phone.substring(1);
  if (phone.startsWith('+')) phone = phone.substring(1);

  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${phone}?text=${encoded}`;

  // Log the outgoing message
  addConversationEntry('us', message);

  // Open WhatsApp
  window.open(url, '_blank');

  // Update contact status
  if (activeContact) {
    activeContact.status = 'contacted';
    saveContactToStorage(activeContact);
    refreshCRMStats();
    renderCRMList();
  }

  showToast('success', 'WhatsApp opened! Review and send the message.');
}

// ===== REGENERATE MESSAGE =====
async function regenerateMessage() {
  const data = getFormData();
  if (!data) return;

  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) { openApiModal(); return; }

  showToast('info', 'Generating new message...');

  try {
    const analysis = document.getElementById('analysis-output').innerText;
    const message = await generateWhatsAppMessage(analysis);
    if (message) {
      displayWhatsAppMessage(message);
      showToast('success', 'New message generated!');
    }
  } catch (err) {
    showToast('error', 'Error: ' + err.message);
  }
}

// ===== COPY MESSAGE =====
function copyMessage() {
  const textarea = document.getElementById('message-editor-textarea');
  const message = textarea.value.trim();
  if (!message) return;

  navigator.clipboard.writeText(message).then(() => {
    showToast('success', 'Message copied to clipboard!');
  }).catch(() => {
    // Fallback
    textarea.select();
    document.execCommand('copy');
    showToast('success', 'Message copied!');
  });
}

// ===== CONVERSATION MANAGEMENT =====
function addConversationEntry(role, text) {
  if (!activeContact) {
    // Create a new contact from the form
    activeContact = createContactFromForm();
  }

  if (!activeContact.conversations) activeContact.conversations = [];
  activeContact.conversations.push({
    role: role,
    text: text,
    time: new Date().toISOString()
  });

  saveContactToStorage(activeContact);
  renderConversationThread();
}

function renderConversationThread() {
  const container = document.getElementById('conversation-thread');
  const countEl = document.getElementById('conv-count');

  if (!activeContact || !activeContact.conversations || activeContact.conversations.length === 0) {
    container.innerHTML = `
      <div class="conv-placeholder">
        <div class="placeholder-icon">💬</div>
        <p>Once you send a WhatsApp message, log the customer's response here. The AI will suggest follow-ups and help handle objections.</p>
      </div>`;
    countEl.textContent = '0 messages';
    return;
  }

  const msgs = activeContact.conversations;
  countEl.textContent = `${msgs.length} message${msgs.length !== 1 ? 's' : ''}`;

  container.innerHTML = msgs.map(m => {
    const isUs = m.role === 'us';
    const avatarClass = isUs ? 'ai' : 'customer';
    const avatarText = isUs ? '🤖' : '👤';
    const time = new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tag = m.category ? `<span class="conv-msg-tag ${m.category}">${m.categoryLabel || m.category}</span>` : '';

    return `
      <div class="conv-msg">
        <div class="conv-msg-avatar ${avatarClass}">${avatarText}</div>
        <div class="conv-msg-content">
          ${tag}
          <div class="conv-msg-text">${escapeHtml(m.text)}</div>
          <div class="conv-msg-time">${time}</div>
        </div>
      </div>`;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

// ===== LOG CUSTOMER RESPONSE =====
function logResponse() {
  const replyInput = document.getElementById('customer-reply');
  const typeSelect = document.getElementById('response-type');
  const text = replyInput.value.trim();

  if (!text) {
    showToast('error', 'Please enter the customer\'s reply');
    return;
  }

  if (!activeContact) {
    showToast('error', 'Generate a message first before logging responses');
    return;
  }

  const type = typeSelect.value;
  const categoryLabels = {
    'customer': 'Customer Reply',
    'interested': 'Interested',
    'objection': 'Objection',
    'not-interested': 'Not Interested',
    'meeting': 'Meeting Booked',
    'closed': 'Deal Closed'
  };

  addConversationEntry('them', text, type, categoryLabels[type]);
  replyInput.value = '';

  // Update interest level and contact status
  updateInterestFromType(type);

  showToast('success', 'Response logged');
}

// Overload addConversationEntry to accept category
const _origAddEntry = addConversationEntry;
addConversationEntry = function(role, text, category, categoryLabel) {
  if (!activeContact) activeContact = createContactFromForm();
  if (!activeContact.conversations) activeContact.conversations = [];
  activeContact.conversations.push({
    role, text, category: category || null, categoryLabel: categoryLabel || null,
    time: new Date().toISOString()
  });
  saveContactToStorage(activeContact);
  renderConversationThread();
};

// ===== INTEREST LEVEL TRACKING =====
function updateInterestFromType(type) {
  const points = {
    'customer': 5,
    'interested': 25,
    'objection': -5,
    'not-interested': -30,
    'meeting': 40,
    'closed': 50
  };

  let level = activeContact.interestLevel || 0;
  level = Math.max(0, Math.min(100, level + (points[type] || 0)));
  activeContact.interestLevel = level;

  // Update status
  if (type === 'closed') activeContact.status = 'customer';
  else if (type === 'meeting') activeContact.status = 'interested';
  else if (type === 'not-interested') activeContact.status = 'lost';
  else if (type === 'interested' && activeContact.status === 'contacted') activeContact.status = 'interested';

  saveContactToStorage(activeContact);
  updateInterestBar(level);
  refreshCRMStats();
  renderCRMList();
}

function updateInterestBar(level) {
  const fill = document.getElementById('interest-fill');
  const value = document.getElementById('interest-value');
  if (!fill || !value) return;

  fill.style.width = level + '%';
  if (level >= 80) value.textContent = '🔥 Hot';
  else if (level >= 50) value.textContent = '✅ Warm';
  else if (level >= 25) value.textContent = '🤔 Cool';
  else if (level > 0) value.textContent = '❄️ Cold';
  else value.textContent = '—';
}

// ===== AI FOLLOW-UP SUGGESTION =====
async function getAiSuggestion() {
  if (!activeContact || !activeContact.conversations || activeContact.conversations.length === 0) {
    showToast('error', 'Log a customer response first, then ask for AI suggestions');
    return;
  }

  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) { openApiModal(); return; }

  const box = document.getElementById('ai-suggestion-box');
  const textEl = document.getElementById('ai-suggestion-text');
  box.classList.remove('hidden');
  textEl.innerHTML = '<span class="spinner"></span> Thinking...';

  try {
    const suggestion = await generateFollowUpSuggestion(activeContact.conversations);
    currentAiSuggestion = suggestion;

    // Parse the structured response
    const interestMatch = suggestion.match(/\*\*Interest Level:\*\*\s*(.+)/i);
    const responseMatch = suggestion.match(/\*\*Suggested Response:\*\*\s*([\s\S]*)/i);

    let display = '';
    if (interestMatch) display += `<div style="margin-bottom:0.5rem"><strong>${escapeHtml(interestMatch[1].trim())}</strong></div>`;
    if (responseMatch) {
      display += `<div style="white-space:pre-wrap">${escapeHtml(responseMatch[1].trim())}</div>`;
    } else {
      display += `<div style="white-space:pre-wrap">${escapeHtml(suggestion)}</div>`;
    }

    textEl.innerHTML = display;
  } catch (err) {
    textEl.textContent = 'Error: ' + err.message;
  }
}

function useAiSuggestion() {
  if (!currentAiSuggestion) return;

  const responseMatch = currentAiSuggestion.match(/\*\*Suggested Response:\*\*\s*([\s\S]*)/i);
  const text = responseMatch ? responseMatch[1].trim() : currentAiSuggestion.trim();

  // Put it in the textarea so user can edit before sending
  const textarea = document.getElementById('message-editor-textarea');
  textarea.value = text;
  autoResizeTextarea(textarea);

  // Log as our response
  addConversationEntry('us', text);

  box_hide();
  showToast('success', 'AI response added! Edit if needed, then send via WhatsApp.');
}

function box_hide() {
  document.getElementById('ai-suggestion-box').classList.add('hidden');
}

// ===== FOLLOW-UP SCHEDULER =====
function scheduleFollowup() {
  const date = document.getElementById('followup-date').value;
  const time = document.getElementById('followup-time').value;

  if (!date) {
    showToast('error', 'Please pick a date for the follow-up');
    return;
  }

  if (!activeContact) {
    showToast('error', 'Generate a message first before scheduling follow-ups');
    return;
  }

  if (!activeContact.followUps) activeContact.followUps = [];
  activeContact.followUps.push({ date, time: time || '09:00', created: new Date().toISOString() });

  if (activeContact.status === 'contacted' || activeContact.status === 'new') {
    activeContact.status = 'followup';
  }

  saveContactToStorage(activeContact);

  // Show confirmation
  const display = document.getElementById('followup-display');
  const text = document.getElementById('followup-text');
  const d = new Date(date + 'T' + (time || '09:00'));
  text.textContent = d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  display.classList.remove('hidden');

  refreshCRMStats();
  renderCRMList();
  showToast('success', 'Follow-up scheduled!');
}

// ===== CRM DATA MANAGEMENT =====
function createContactFromForm() {
  const data = getFormData();
  return {
    id: Date.now(),
    businessName: data.businessName,
    contactPerson: data.contactPerson,
    phone: data.phone,
    website: data.website,
    businessType: data.businessType,
    notes: data.notes,
    status: 'new',
    interestLevel: 0,
    conversations: [],
    followUps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function saveContactToStorage(contact) {
  contact.updatedAt = new Date().toISOString();
  const all = getAllContacts();
  const idx = all.findIndex(c => c.id === contact.id);
  if (idx >= 0) {
    all[idx] = contact;
  } else {
    all.push(contact);
  }
  localStorage.setItem('ai_receptionist_crm', JSON.stringify(all));
}

function getAllContacts() {
  try {
    return JSON.parse(localStorage.getItem('ai_receptionist_crm') || '[]');
  } catch {
    return [];
  }
}

function saveOrUpdateContact() {
  if (!activeContact) activeContact = createContactFromForm();
  activeContact.updatedAt = new Date().toISOString();
  saveContactToStorage(activeContact);
  refreshCRMStats();
  renderCRMList();
}

function deleteContact(id) {
  let all = getAllContacts();
  all = all.filter(c => c.id !== id);
  localStorage.setItem('ai_receptionist_crm', JSON.stringify(all));
  if (activeContact && activeContact.id === id) activeContact = null;
  refreshCRMStats();
  renderCRMList();
  showToast('info', 'Contact deleted');
}

// ===== CRM RENDERING =====
function refreshCRMStats() {
  const all = getAllContacts();
  document.getElementById('stat-total').textContent = all.length;
  document.getElementById('stat-interested').textContent = all.filter(c => c.status === 'interested' || c.interestLevel >= 50).length;
  document.getElementById('stat-followups').textContent = all.filter(c => c.status === 'followup').length;
  document.getElementById('stat-closed').textContent = all.filter(c => c.status === 'customer').length;
}

function loadCRMData() {
  refreshCRMStats();
  renderCRMList();
}

function filterCRM(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderCRMList();
}

function renderCRMList() {
  const container = document.getElementById('crm-list');
  let contacts = getAllContacts();

  // Sort by most recently updated
  contacts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  // Apply filter
  if (currentFilter !== 'all') {
    if (currentFilter === 'followup') {
      contacts = contacts.filter(c => c.status === 'followup');
    } else {
      contacts = contacts.filter(c => c.status === currentFilter);
    }
  }

  if (contacts.length === 0) {
    container.innerHTML = `
      <div class="crm-empty glass-card">
        <div class="placeholder-icon">📂</div>
        <h3>${currentFilter === 'all' ? 'No contacts yet' : 'No ' + currentFilter + ' contacts'}</h3>
        <p>${currentFilter === 'all' ? 'Start by entering a business contact above and sending your first WhatsApp message.' : 'No contacts match this filter.'}</p>
      </div>`;
    return;
  }

  container.innerHTML = contacts.map(c => {
    const initials = (c.businessName || '??').substring(0, 2).toUpperCase();
    const statusLabel = {
      'new': 'New',
      'contacted': 'Contacted',
      'interested': 'Interested',
      'followup': 'Follow-up',
      'customer': 'Customer',
      'lost': 'Lost'
    }[c.status] || c.status;

    const nextFollowup = c.followUps && c.followUps.length > 0
      ? c.followUps[c.followUps.length - 1]
      : null;
    const followupStr = nextFollowup
      ? new Date(nextFollowup.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
      : '';

    const isActive = activeContact && activeContact.id === c.id;

    return `
      <div class="crm-contact ${isActive ? 'active-contact' : ''}" onclick="loadContact(${c.id})">
        <div class="crm-avatar ${c.status}">${initials}</div>
        <div class="crm-info">
          <div class="crm-name">${escapeHtml(c.businessName)}</div>
          <div class="crm-meta">
            <span>${escapeHtml(c.businessType)}</span>
            ${followupStr ? `<span>📅 ${followupStr}</span>` : ''}
            <span>${c.conversations?.length || 0} msgs</span>
          </div>
        </div>
        <span class="crm-status-badge ${c.status}">${statusLabel}</span>
        <div class="crm-actions-col">
          <button class="crm-action-btn" onclick="event.stopPropagation(); openContactDetail(${c.id})" title="View details">🔍</button>
          <button class="crm-action-btn delete" onclick="event.stopPropagation(); confirmDeleteContact(${c.id})" title="Delete">🗑️</button>
        </div>
      </div>`;
  }).join('');
}

// ===== LOAD CONTACT INTO ACTIVE WORKSPACE =====
function loadContact(id) {
  const all = getAllContacts();
  const contact = all.find(c => c.id === id);
  if (!contact) return;

  activeContact = contact;

  // Fill in the form
  document.getElementById('business-name').value = contact.businessName || '';
  document.getElementById('contact-person').value = contact.contactPerson || '';
  document.getElementById('phone-number').value = contact.phone || '';
  document.getElementById('website-url').value = contact.website || '';
  document.getElementById('business-type').value = contact.businessType || '';
  document.getElementById('notes').value = contact.notes || '';

  // Render conversation
  renderConversationThread();
  updateInterestBar(contact.interestLevel || 0);

  // Show follow-up if exists
  if (contact.followUps && contact.followUps.length > 0) {
    const last = contact.followUps[contact.followUps.length - 0 - 1];
    const display = document.getElementById('followup-display');
    const text = document.getElementById('followup-text');
    const d = new Date(last.date + 'T' + (last.time || '09:00'));
    text.textContent = d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    display.classList.remove('hidden');
  }

  // Scroll to conversation section
  document.getElementById('conversation-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });

  renderCRMList();
  showToast('info', `Loaded: ${contact.businessName}`);
}

// ===== CONTACT DETAIL MODAL =====
function openContactDetail(id) {
  const all = getAllContacts();
  const c = all.find(x => x.id === id);
  if (!c) return;

  const statusLabel = {
    'new': 'New', 'contacted': 'Contacted', 'interested': 'Interested',
    'followup': 'Follow-up', 'customer': 'Customer', 'lost': 'Lost'
  }[c.status] || c.status;

  const initials = (c.businessName || '??').substring(0, 2).toUpperCase();

  let convHtml = '';
  if (c.conversations && c.conversations.length > 0) {
    convHtml = c.conversations.map(m => {
      const label = m.role === 'us' ? '🤖 You' : `👤 ${c.contactPerson || 'Client'}`;
      const time = new Date(m.time).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      return `<div style="margin-bottom:0.75rem;padding:0.6rem;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid var(--border-glass)">
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.3rem">${label} · ${time}</div>
        <div style="font-size:0.85rem;color:var(--text-secondary);white-space:pre-wrap">${escapeHtml(m.text)}</div>
      </div>`;
    }).join('');
  } else {
    convHtml = '<p style="color:var(--text-muted);font-size:0.85rem">No conversations yet</p>';
  }

  let followupHtml = '';
  if (c.followUps && c.followUps.length > 0) {
    followupHtml = c.followUps.map(f => {
      const d = new Date(f.date + 'T' + (f.time || '09:00'));
      return `<div style="font-size:0.85rem">📅 ${d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>`;
    }).join('');
  } else {
    followupHtml = '<p style="color:var(--text-muted);font-size:0.85rem">No follow-ups scheduled</p>';
  }

  const modalBody = document.getElementById('contact-modal-body');
  modalBody.innerHTML = `
    <div class="detail-header">
      <div class="detail-avatar ${c.status}">${initials}</div>
      <div class="detail-title">
        <h3>${escapeHtml(c.businessName)}</h3>
        <p>${escapeHtml(c.businessType)} · ${escapeHtml(c.phone)}</p>
      </div>
    </div>

    <div class="detail-grid">
      <div class="detail-section">
        <h4>👤 Contact Person</h4>
        <p>${escapeHtml(c.contactPerson || 'Not provided')}</p>
      </div>
      <div class="detail-section">
        <h4>🌐 Website</h4>
        <p>${c.website ? `<a href="${escapeHtml(c.website)}" target="_blank" style="color:#a5b4fc">${escapeHtml(c.website)}</a>` : 'Not provided'}</p>
      </div>
      <div class="detail-section">
        <h4>📊 Status</h4>
        <p><span class="crm-status-badge ${c.status}">${statusLabel}</span></p>
      </div>
      <div class="detail-section">
        <h4>💡 Interest Level</h4>
        <p>${c.interestLevel || 0}%</p>
      </div>
    </div>

    ${c.notes ? `<div class="detail-section"><h4>📝 Notes</h4><p>${escapeHtml(c.notes)}</p></div>` : ''}

    <div class="detail-section">
      <h4>💬 Conversation History</h4>
      ${convHtml}
    </div>

    <div class="detail-section">
      <h4>📅 Follow-ups</h4>
      ${followupHtml}
    </div>

    <div class="detail-section">
      <h4>⚡ Update Status</h4>
      <div class="detail-status-control">
        ${['new','contacted','interested','followup','customer','lost'].map(s => `
          <button class="status-btn ${c.status === s ? 'active-status' : ''}" onclick="updateContactStatus(${c.id}, '${s}')">${s.charAt(0).toUpperCase() + s.slice(1)}</button>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('contact-modal').classList.remove('hidden');
}

function closeContactModal() {
  document.getElementById('contact-modal').classList.add('hidden');
}

function updateContactStatus(id, newStatus) {
  const all = getAllContacts();
  const contact = all.find(c => c.id === id);
  if (!contact) return;

  contact.status = newStatus;
  saveContactToStorage(contact);
  refreshCRMStats();
  renderCRMList();
  openContactDetail(id); // Re-render modal
  showToast('success', `Status updated to ${newStatus}`);
}

// ===== DELETE CONFIRMATION =====
function confirmDeleteContact(id) {
  const all = getAllContacts();
  const c = all.find(x => x.id === id);
  if (!c) return;

  if (confirm(`Delete "${c.businessName}"? This cannot be undone.`)) {
    deleteContact(id);
  }
}

// ===== TEXTAREA AUTO-RESIZE =====
function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 200) + 'px';
}

// Listen for textarea input
document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('message-editor-textarea');
  if (textarea) {
    textarea.addEventListener('input', () => autoResizeTextarea(textarea));
  }
});

// ===== TOAST NOTIFICATIONS =====
function showToast(type, message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span class="toast-text">${escapeHtml(message)}</span>
    <button class="toast-close" onclick="this.parentElement.style.animation='toastOut 0.3s ease forwards'; setTimeout(() => this.parentElement.remove(), 300)">×</button>
  `;

  container.appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

// ===== API KEY MODAL =====
function openApiModal() {
  const modal = document.getElementById('api-modal');
  if (modal) {
    modal.classList.remove('hidden');
    const input = document.getElementById('api-key-input');
    if (input) {
      const existing = localStorage.getItem('gemini_api_key');
      if (existing && existing !== 'YOUR_GEMINI_API_KEY_HERE') {
        input.value = existing;
      }
    }
  }
}

function closeApiModal() {
  document.getElementById('api-modal')?.classList.add('hidden');
}

function toggleApiKeyVisibility() {
  const input = document.getElementById('api-key-input');
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

function saveApiKey() {
  const input = document.getElementById('api-key-input');
  if (!input) return;

  const key = input.value.trim();
  if (!key) {
    showToast('error', 'Please enter an API key');
    return;
  }

  if (!key.startsWith('AIza')) {
    showToast('error', 'API key should start with "AIza". Please check your key.');
    return;
  }

  localStorage.setItem('gemini_api_key', key);
  closeApiModal();
  updateApiKeyStatus();
  showToast('success', 'API key saved! You can now use AI features.');
}

function updateApiKeyStatus() {
  const key = localStorage.getItem('gemini_api_key');
  const connected = document.getElementById('api-status-banner');
  const needed = document.getElementById('api-needed-banner');

  if (key && key !== 'YOUR_GEMINI_API_KEY_HERE') {
    connected?.classList.remove('hidden');
    needed?.classList.add('hidden');
  } else {
    connected?.classList.add('hidden');
    needed?.classList.remove('hidden');
  }
}

// ===== NAVBAR SCROLL EFFECT =====
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }
});

// ===== MOBILE MENU =====
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }
});

// ===== INITIALISE ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
  updateApiKeyStatus();
  loadCRMData();
});
