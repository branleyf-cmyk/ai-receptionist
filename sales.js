// ===== WhatsApp AI Sales Assistant - Complete JavaScript =====
// All functionality works offline with template-based generation

// Global state
let activeContact = null;
let currentFilter = 'all';

// ===== BUSINESS KNOWLEDGE BASE =====
const businessKnowledge = {
  'Dentist': {
    description: 'Dental practices providing oral health care, cosmetic dentistry, and emergency services.',
    challenges: [
      'High rate of missed calls during procedures when staff are busy',
      'Difficulty booking emergency appointments after hours',
      'Patients forgetting scheduled appointments',
      'Time-consuming phone tag for routine inquiries',
      'Lost revenue from unreturned calls'
    ],
    benefits: [
      'Answer patient calls 24/7 even during busy clinic hours',
      'Book emergency appointments instantly via WhatsApp',
      'Send automatic appointment reminders to reduce no-shows',
      'Capture new patient inquiries immediately',
      'Free up reception staff to focus on in-person patients'
    ]
  },
  'Plumber': {
    description: 'Plumbing services for residential and commercial properties, including emergency repairs.',
    challenges: [
      'Missing emergency calls during jobs on-site',
      'Difficulty quoting jobs without site visits',
      'Customers calling multiple plumbers for price comparison',
      'Forgetting follow-up appointments',
      'Lost leads from missed calls'
    ],
    benefits: [
      'Answer emergency calls instantly even when on a job',
      'Capture lead details and schedule site visits automatically',
      'Send quick quotes via WhatsApp to win more jobs',
      'Follow up with past customers for repeat business',
      'Never miss a high-value plumbing opportunity'
    ]
  },
  'Electrician': {
    description: 'Electrical services for installations, repairs, and safety inspections.',
    challenges: [
      'Cannot answer calls while working with live wiring',
      'Difficulty scheduling inspections around client availability',
      'Competition from other electricians for emergency work',
      'Managing routine inquiries vs urgent calls',
      'Lost business from missed after-hours calls'
    ],
    benefits: [
      'Answer calls 24/7 for emergency electrical work',
      'Schedule non-urgent jobs automatically via WhatsApp',
      'Send safety reminders and maintenance prompts',
      'Capture more leads than competitors who miss calls',
      'Build a professional image with instant responses'
    ]
  },
  'Salon / Spa': {
    description: 'Beauty services including hair, nails, massage, and wellness treatments.',
    challenges: [
      'Staff cannot answer phones while treating clients',
      'High no-show rates for appointments',
      'Difficulty filling last-minute cancellations',
      'Clients booking outside business hours',
      'Time-consuming confirmation calls'
    ],
    benefits: [
      'Book appointments 24/7 without interrupting services',
      'Send automatic reminders to reduce no-shows',
      'Fill cancellations instantly via WhatsApp broadcast',
      'Capture bookings outside business hours',
      'Upsell services and products to existing clients'
    ]
  },
  'Gym / Fitness': {
    description: 'Fitness centers, personal training, and group exercise classes.',
    challenges: [
      'Missing membership inquiries during busy hours',
      'Difficulty scheduling tour and trial sessions',
      'Members forgetting to renew subscriptions',
      'Low engagement with personal training offers',
      'Lost leads from missed calls'
    ],
    benefits: [
      'Answer membership calls instantly during peak hours',
      'Book tours and trial sessions automatically',
      'Send renewal reminders and retention offers',
      'Promote personal training and classes via WhatsApp',
      'Capture more leads and convert them to members'
    ]
  },
  'Restaurant': {
    description: 'Food service establishments offering dine-in, takeaway, and catering.',
    challenges: [
      'Staff too busy to answer reservation calls during service',
      'Managing high volume of delivery order calls',
      'Difficulty handling catering inquiry details',
      'Lost bookings from missed after-hours calls',
      'Time-consuming phone orders'
    ],
    benefits: [
      'Take reservations 24/7 without interrupting service',
      'Capture catering inquiries with all details via WhatsApp',
      'Send menu updates and daily specials',
      'Handle delivery inquiries and route to ordering',
      'Build customer loyalty with instant responses'
    ]
  },
  'Real Estate': {
    description: 'Property sales, rentals, and real estate agency services.',
    challenges: [
      'Missing calls from potential buyers during property viewings',
      'Difficulty qualifying leads quickly',
      'Time-consuming property inquiry handling',
      'Follow-up with multiple prospects',
      'Lost commissions from missed calls'
    ],
    benefits: [
      'Answer buyer inquiries instantly during viewings',
      'Qualify leads automatically with qualifying questions',
      'Schedule property viewings via WhatsApp',
      'Send property details and follow-ups to prospects',
      'Capture more leads than competing agents'
    ]
  },
  'Law Firm': {
    description: 'Legal services including consultations, document preparation, and representation.',
    challenges: [
      'Missing calls during client meetings and court',
      'Difficulty scheduling consultations efficiently',
      'Time-consuming intake information gathering',
      'Following up with potential clients',
      'Lost cases from missed calls'
    ],
    benefits: [
      'Answer potential client calls 24/7',
      'Schedule consultations automatically',
      'Gather intake information via WhatsApp',
      'Send appointment reminders to reduce no-shows',
      'Capture more cases than competitors'
    ]
  },
  'Accountant': {
    description: 'Accounting, tax preparation, and financial advisory services.',
    challenges: [
      'Missing calls during tax season consultations',
      'Difficulty scheduling appointments around deadlines',
      'Time-consuming document collection from clients',
      'Following up with prospects during busy periods',
      'Lost clients from missed calls'
    ],
    benefits: [
      'Answer client calls even during peak tax season',
      'Schedule consultations and send reminders',
      'Request documents via WhatsApp automatically',
      'Follow up with prospects without interrupting work',
      'Retain more clients with responsive service'
    ]
  },
  'Retail Store': {
    description: 'Physical retail shops selling products directly to consumers.',
    challenges: [
      'Missing calls while assisting in-store customers',
      'Difficulty handling product inquiries and stock checks',
      'Lost sales from missed after-hours calls',
      'Time-consuming phone order taking',
      'Low customer engagement'
    ],
    benefits: [
      'Answer customer calls 24/7',
      'Check stock and hold items via WhatsApp',
      'Send product updates and promotions',
      'Take phone orders outside business hours',
      'Build customer loyalty with instant responses'
    ]
  },
  'Auto / Workshop': {
    description: 'Vehicle repair, maintenance, and auto service centers.',
    challenges: [
      'Missing calls while working under vehicles',
      'Difficulty scheduling appointments during busy periods',
      'Time-consuming quote requests',
      'Following up on repair approvals',
      'Lost jobs from missed calls'
    ],
    benefits: [
      'Answer calls 24/7 for emergency repairs',
      'Schedule service appointments automatically',
      'Send quotes and get approvals via WhatsApp',
      'Send service reminders to past customers',
      'Capture more business than competitors'
    ]
  },
  'Home Services': {
    description: 'Cleaning, landscaping, pest control, and other home maintenance services.',
    challenges: [
      'Missing calls while on job sites',
      'Difficulty scheduling recurring services',
      'Time-consuming quote requests requiring site visits',
      'Following up with past customers for repeat business',
      'Lost jobs from missed calls'
    ],
    benefits: [
      'Answer calls instantly even on site',
      'Schedule recurring services automatically',
      'Send quotes and appointment confirmations via WhatsApp',
      'Remind customers of upcoming services',
      'Win repeat business with proactive follow-ups'
    ]
  },
  'Healthcare': {
    description: 'Medical practices, clinics, and healthcare providers.',
    challenges: [
      'Missing patient calls during consultations',
      'High no-show rates for appointments',
      'Difficulty handling after-hours inquiries',
      'Time-consuming appointment scheduling',
      'Lost patients from missed calls'
    ],
    benefits: [
      'Answer patient calls 24/7',
      'Send appointment reminders to reduce no-shows',
      'Handle routine inquiries via WhatsApp',
      'Book appointments outside office hours',
      'Improve patient satisfaction with instant responses'
    ]
  },
  'Education': {
    description: 'Tutoring centers, training institutes, and educational services.',
    challenges: [
      'Missing calls during teaching hours',
      'Difficulty scheduling trial classes and consultations',
      'Following up with prospective students',
      'Time-consuming enrollment inquiries',
      'Lost enrollments from missed calls'
    ],
    benefits: [
      'Answer inquiries 24/7 for maximum enrollment',
      'Schedule trial classes automatically',
      'Send course information and enrollment details via WhatsApp',
      'Follow up with prospects without interrupting classes',
      'Capture more enrollments than competitors'
    ]
  },
  'Tech / IT': {
    description: 'IT support, software development, and technology services.',
    challenges: [
      'Missing client calls during focused development work',
      'Difficulty scheduling consultations and support meetings',
      'Time-consuming initial scoping conversations',
      'Following up with leads during busy sprints',
      'Lost projects from missed calls'
    ],
    benefits: [
      'Answer client calls even during deep work sessions',
      'Schedule consultations and support meetings automatically',
      'Gather project requirements via WhatsApp',
      'Follow up with leads without interrupting development',
      'Appear more responsive than competitors'
    ]
  },
  'Marketing Agency': {
    description: 'Digital marketing, advertising, and creative services.',
    challenges: [
      'Missing calls during client meetings and creative sessions',
      'Difficulty qualifying new leads quickly',
      'Time-consuming proposal request handling',
      'Following up with multiple prospects',
      'Lost clients from missed calls'
    ],
    benefits: [
      'Answer prospect calls 24/7',
      'Qualify leads with automated questions',
      'Schedule discovery calls automatically',
      'Send portfolio and proposal information via WhatsApp',
      'Win more clients with instant responses'
    ]
  },
  'Construction': {
    description: 'Building, renovation, and construction contract services.',
    challenges: [
      'Missing calls while on active construction sites',
      'Difficulty scheduling site visits and consultations',
      'Time-consuming quote requests requiring site inspections',
      'Following up on proposals and bids',
      'Lost contracts from missed calls'
    ],
    benefits: [
      'Answer calls instantly even on remote sites',
      'Schedule site visits and consultations automatically',
      'Send quote updates and project information via WhatsApp',
      'Follow up on bids without interrupting work',
      'Win more contracts than competitors'
    ]
  },
  'Other': {
    description: 'Various business types and professional services.',
    challenges: [
      'Missing calls during core business activities',
      'Difficulty handling inquiries outside business hours',
      'Time-consuming phone tag and follow-ups',
      'Lost opportunities from missed calls',
      'Competitors appearing more responsive'
    ],
    benefits: [
      'Answer calls 24/7 without interrupting operations',
      'Capture leads and inquiries outside business hours',
      'Automate routine questions via WhatsApp',
      'Schedule appointments and meetings automatically',
      'Appear more professional and responsive than competitors'
    ]
  }
};


// ===== DOM ELEMENT IDS =====
const IDS = {
  businessName: 'businessName',
  contactPerson: 'contactPerson',
  phoneNumber: 'phoneNumber',
  websiteUrl: 'websiteUrl',
  businessType: 'businessType',
  notes: 'notes',
  analyseBtn: 'analyseBtn',
  analysisSection: 'analysis-section',
  analysisOutput: 'analysis-output',
  strategySection: 'strategy-section',
  strategyOutput: 'strategy-output',
  messageSection: 'message-section',
  messageEditor: 'messageEditor',
  sendWhatsappBtn: 'sendWhatsappBtn',
  copyMsgBtn: 'copyMsgBtn',
  regenMsgBtn: 'regenMsgBtn',
  conversationSection: 'conversation-section',
  conversationThread: 'conversationThread',
  responseType: 'responseType',
  customerReply: 'customerReply',
  logResponseBtn: 'logResponseBtn',
  aiSuggestionBox: 'aiSuggestionBox',
  aiSuggestionText: 'aiSuggestionText',
  useSuggestionBtn: 'useSuggestionBtn',
  dismissSuggestionBtn: 'dismissSuggestionBtn',
  followupDate: 'followupDate',
  followupTime: 'followupTime',
  scheduleFollowupBtn: 'scheduleFollowupBtn',
  followupDisplay: 'followupDisplay',
  interestBarContainer: 'interestBarContainer',
  interestFill: 'interestFill',
  interestValue: 'interestValue',
  crmList: 'crmList',
  statTotal: 'stat-total',
  statInterested: 'stat-interested',
  statFollowups: 'stat-followups',
  statClosed: 'stat-closed',
  contactModal: 'contactModal',
  modalBody: 'modalBody',
  modalClose: 'modalClose',
  modalTitle: 'modalTitle',
  toastContainer: 'toastContainer'
};

// Helper to get element
function el(id) { return document.getElementById(id); }

// ===== INITIALISE ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', function() {
  // Bind buttons
  el('analyseBtn').addEventListener('click', handleAnalyse);
  el('sendWhatsappBtn').addEventListener('click', sendViaWhatsApp);
  el('copyMsgBtn').addEventListener('click', copyMessage);
  el('regenMsgBtn').addEventListener('click', regenerateMessage);
  el('logResponseBtn').addEventListener('click', logResponse);
  el('useSuggestionBtn').addEventListener('click', useAiSuggestion);
  el('dismissSuggestionBtn').addEventListener('click', function() {
    el('aiSuggestionBox').style.display = 'none';
  });
  el('scheduleFollowupBtn').addEventListener('click', scheduleFollowup);
  el('modalClose').addEventListener('click', closeModal);

  // Auto-resize message editor
  el('messageEditor').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 400) + 'px';
  });

  // Load CRM data
  loadCRMData();

  console.log('WhatsApp AI Sales Assistant loaded successfully');
});

// ===== GET FORM DATA =====
function getFormData() {
  return {
    businessName: el('businessName').value.trim(),
    contactPerson: el('contactPerson').value.trim(),
    phoneNumber: el('phoneNumber').value.trim(),
    websiteUrl: el('websiteUrl').value.trim(),
    businessType: el('businessType').value,
    notes: el('notes').value.trim()
  };
}

// ===== VALIDATE FORM =====
function validateForm() {
  var data = getFormData();
  if (!data.businessName) { showToast('Please enter a business name', 'error'); return null; }
  if (!data.phoneNumber) { showToast('Please enter a phone number', 'error'); return null; }
  if (!data.businessType) { showToast('Please select a business type', 'error'); return null; }
  return data;
}

// ===== ANALYSE BUTTON HANDLER =====
function handleAnalyse() {
  var data = validateForm();
  if (!data) return;

  // Create or update contact
  createOrUpdateContact(data);

  // Generate analysis
  generateAnalysis(data);

  // Generate strategy
  generateStrategy(data);

  // Generate message
  generateWhatsAppMessage(data);

  // Show sections
  el('analysisSection').style.display = 'block';
  el('strategySection').style.display = 'block';
  el('messageSection').style.display = 'block';
  el('conversationSection').style.display = 'block';

  // Scroll to analysis
  el('analysisSection').scrollIntoView({ behavior: 'smooth', block: 'start' });

  showToast('Analysis complete! Review the strategy and send your message.', 'success');
}

// ===== CREATE OR UPDATE CONTACT =====
function createOrUpdateContact(data) {
  var contacts = getAllContacts();

  // Check if contact already exists by phone
  var existing = contacts.find(function(c) { return c.phone === data.phoneNumber; });

  if (existing) {
    // Update existing
    existing.businessName = data.businessName;
    existing.contactPerson = data.contactPerson;
    existing.website = data.websiteUrl;
    existing.businessType = data.businessType;
    existing.notes = data.notes;
    existing.updatedAt = new Date().toISOString();
    activeContact = existing;
  } else {
    // Create new
    activeContact = {
      id: Date.now(),
      businessName: data.businessName,
      contactPerson: data.contactPerson,
      phone: data.phoneNumber,
      website: data.websiteUrl,
      businessType: data.businessType,
      notes: data.notes,
      status: 'new',
      interestLevel: 25,
      conversations: [],
      followUps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    contacts.push(activeContact);
  }

  saveAllContacts(contacts);
  loadCRMData();
}

// ===== GET ALL CONTACTS =====
function getAllContacts() {
  try {
    var data = localStorage.getItem('ai_receptionist_contacts');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// ===== SAVE ALL CONTACTS =====
function saveAllContacts(contacts) {
  localStorage.setItem('ai_receptionist_contacts', JSON.stringify(contacts));
}

// ===== GENERATE ANALYSIS =====
function generateAnalysis(data) {
  var knowledge = businessKnowledge[data.businessType] || businessKnowledge['Other'];
  var html = '';

  html += '<div class="analysis-block">';
  html += '<h3>' + escapeHtml(data.businessName) + ' - Business Overview</h3>';
  html += '<div class="analysis-item">' + knowledge.description + '</div>';
  html += '</div>';

  html += '<div class="analysis-block">';
  html += '<h3>Key Challenges</h3>';
  knowledge.challenges.forEach(function(challenge) {
    html += '<div class="analysis-item">' + escapeHtml(challenge) + '</div>';
  });
  html += '</div>';

  html += '<div class="analysis-block">';
  html += '<h3>How AI Receptionist Helps</h3>';
  knowledge.benefits.forEach(function(benefit) {
    html += '<div class="analysis-item" style="border-left-color: var(--accent-green)">' + escapeHtml(benefit) + '</div>';
  });
  html += '</div>';

  el('analysisOutput').innerHTML = html;
}

// ===== GENERATE STRATEGY =====
function generateStrategy(data) {
  var knowledge = businessKnowledge[data.businessType] || businessKnowledge['Other'];
  var html = '';

  // Value Proposition
  html += '<div class="strategy-block">';
  html += '<h3>Your Value Proposition</h3>';
  html += '<div class="strategy-item benefit">';
  html += 'Help ' + escapeHtml(data.businessName) + ' capture more leads, book more appointments, ';
  html += 'and never miss a customer call - even when they\'re busy serving customers.';
  html += '</div>';
  html += '</div>';

  // Key Selling Points
  html += '<div class="strategy-block">';
  html += '<h3>Key Selling Points</h3>';
  html += '<div class="strategy-item benefit">Never miss a customer call - answer 24/7</div>';
  html += '<div class="strategy-item benefit">Book appointments and capture leads automatically</div>';
  html += '<div class="strategy-item benefit">Reduce no-shows with instant WhatsApp reminders</div>';
  html += '<div class="strategy-item benefit">Free up staff time for core work</div>';
  html += '<div class="strategy-item benefit">Win more business than competitors who miss calls</div>';
  html += '</div>';

  // Common Objections & Responses
  html += '<div class="strategy-block">';
  html += '<h3>Handle Common Objections</h3>';
  html += '<div class="strategy-item objection"><strong>Objection:</strong> "It\'s too expensive"</div>';
  html += '<div class="strategy-item benefit"><strong>Response:</strong> Compare the cost to one missed high-value customer call. ';
  html += 'Most businesses recover the investment within the first week.</div>';

  html += '<div class="strategy-item objection"><strong>Objection:</strong> "We already have a receptionist"</div>';
  html += '<div class="strategy-item benefit"><strong>Response:</strong> Perfect - the AI handles overflow calls, after-hours inquiries, ';
  html += 'and routine questions so your receptionist can focus on in-person customers.</div>';

  html += '<div class="strategy-item objection"><strong>Objection:</strong> "I\'m not sure it will work for my business"</div>';
  html += '<div class="strategy-item benefit"><strong>Response:</strong> Let\'s do a quick 15-minute demo. I\'ll show you exactly how it would ';
  html += 'handle your specific customer inquiries. No commitment needed.</div>';

  html += '<div class="strategy-item objection"><strong>Objection:</strong> "Send me more information"</div>';
  html += '<div class="strategy-item benefit"><strong>Response:</strong> I\'d be happy to. What specific questions do you have so I can send ';
  html += 'you the most relevant details? (This keeps the conversation going.)</div>';
  html += '</div>';

  // Closing Questions
  html += '<div class="strategy-block">';
  html += '<h3>Qualifying Questions</h3>';
  html += '<div class="strategy-item">How many customer calls do you typically get per day?</div>';
  html += '<div class="strategy-item">What percentage of calls do you think you\'re currently missing?</div>';
  html += '<div class="strategy-item">How much is one missed customer call worth to your business?</div>';
  html += '<div class="strategy-item">What would it mean to capture 20% more leads this month?</div>';
  html += '</div>';

  // Next Steps
  html += '<div class="strategy-block">';
  html += '<h3>Next Steps</h3>';
  html += '<div class="strategy-item benefit">1. Send initial WhatsApp message (below)</div>';
  html += '<div class="strategy-item benefit">2. Wait for response, log their reply here</div>';
  html += '<div class="strategy-item benefit">3. If interested, offer a 15-minute demo</div>';
  html += '<div class="strategy-item benefit">4. Show them a live example handling their specific use case</div>';
  html += '<div class="strategy-item benefit">5. Close the deal and start onboarding</div>';
  html += '</div>';

  el('strategyOutput').innerHTML = html;
}

// ===== GENERATE WHATSAPP MESSAGE =====
function generateWhatsAppMessage(data) {
  var knowledge = businessKnowledge[data.businessType] || businessKnowledge['Other'];

  var message = 'Hi ' + (data.contactPerson || 'there') + ',\n\n';
  message += 'I\'m reaching out from [Your Company Name]. We help ' + data.businessType.toLowerCase() + 's like ' + escapeHtml(data.businessName) + ' capture more leads and never miss a customer call.\n\n';
  message += 'Quick question: How many calls do you think you miss during busy periods or after hours?\n\n';
  message += 'Our AI Receptionist answers calls 24/7, books appointments instantly via WhatsApp, and sends automatic reminders - so you never lose a customer to voicemail again.\n\n';
  message += 'Would you be open to a quick 15-minute demo to see how it would work for ' + escapeHtml(data.businessName) + '?\n\n';
  message += 'Best regards,\n[Your Name]';

  el('messageEditor').value = message;
  el('sendWhatsappBtn').disabled = false;
  el('copyMsgBtn').disabled = false;
  el('regenMsgBtn').disabled = false;
}

// ===== SEND VIA WHATSAPP =====
function sendViaWhatsApp() {
  if (!activeContact) {
    showToast('Please generate a message first', 'error');
    return;
  }

  var message = el('messageEditor').value.trim();
  if (!message) {
    showToast('Message is empty', 'error');
    return;
  }

  // Format phone number for WhatsApp
  var phone = activeContact.phone.replace(/\s+/g, '').replace(/[-()]/g, '');
  if (phone.startsWith('0')) {
    phone = '27' + phone.substring(1); // South Africa
  }
  if (!phone.startsWith('+')) {
    phone = '+' + phone;
  }

  // Log outgoing message
  addConversation(activeContact.id, 'ai', message);

  // Update contact status
  var contacts = getAllContacts();
  var contact = contacts.find(function(c) { return c.id === activeContact.id; });
  if (contact && contact.status === 'new') {
    contact.status = 'contacted';
    saveAllContacts(contacts);
  }

  // Open WhatsApp
  var whatsappUrl = 'https://wa.me/' + phone.replace('+', '') + '?text=' + encodeURIComponent(message);
  window.open(whatsappUrl, '_blank');

  loadCRMData();
  showToast('WhatsApp opened! Message logged in conversation history.', 'success');

  // Scroll to conversation
  el('conversationSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}


// ===== COPY MESSAGE =====
function copyMessage() {
  var message = el('messageEditor').value;
  navigator.clipboard.writeText(message).then(function() {
    showToast('Message copied to clipboard!', 'success');
  }).catch(function() {
    // Fallback for older browsers
    var textarea = el('messageEditor');
    textarea.select();
    document.execCommand('copy');
    showToast('Message copied!', 'success');
  });
}

// ===== REGENERATE MESSAGE =====
function regenerateMessage() {
  if (!activeContact) {
    showToast('Please analyse a business first', 'error');
    return;
  }
  var data = getFormData();
  generateWhatsAppMessage(data);
  showToast('New message generated!', 'success');
}

// ===== ADD CONVERSATION =====
function addConversation(contactId, role, message) {
  var contacts = getAllContacts();
  var contact = contacts.find(function(c) { return c.id === contactId; });
  if (!contact) return;

  if (!contact.conversations) contact.conversations = [];
  contact.conversations.push({
    role: role,
    message: message,
    timestamp: new Date().toISOString()
  });

  saveAllContacts(contacts);
  loadCRMData();
  renderConversation(contact);
}

// ===== LOG RESPONSE =====
function logResponse() {
  if (!activeContact) {
    showToast('No active contact', 'error');
    return;
  }

  var responseText = el('customerReply').value.trim();
  var responseType = el('responseType').value;

  if (!responseText) {
    showToast('Please enter a response', 'error');
    return;
  }

  // Add conversation
  addConversation(activeContact.id, 'customer', responseText);

  // Update interest level based on response type
  var contacts = getAllContacts();
  var contact = contacts.find(function(c) { return c.id === activeContact.id; });
  if (contact) {
    var interestChange = 0;
    switch(responseType) {
      case 'interested': interestChange = 20; break;
      case 'objection': interestChange = 0; break;
      case 'not-interested': interestChange = -15; break;
      case 'meeting': interestChange = 30; break;
      case 'closed': interestChange = 100; break;
      default: interestChange = 5;
    }
    contact.interestLevel = Math.max(0, Math.min(100, contact.interestLevel + interestChange));
    saveAllContacts(contacts);
  }

  // Clear input
  el('customerReply').value = '';

  showToast('Response logged!', 'success');
}

// ===== RENDER CONVERSATION =====
function renderConversation(contact) {
  var thread = el('conversationThread');
  if (!contact.conversations || contact.conversations.length === 0) {
    thread.innerHTML = '<div class="conv-placeholder"><div class="placeholder-icon">💬</div><p>No messages yet. Generate a message and send it via WhatsApp.</p></div>';
    return;
  }

  var html = '';
  contact.conversations.forEach(function(conv) {
    var isAI = conv.role === 'ai';
    var avatarClass = isAI ? 'ai' : 'customer';
    var avatarText = isAI ? '🤖' : '👤';
    var label = isAI ? 'You' : (contact.contactPerson || 'Customer');
    var time = new Date(conv.timestamp).toLocaleString();

    html += '<div class="conv-msg ' + (isAI ? 'us' : '') + '">';
    html += '<div class="conv-avatar ' + avatarClass + '">' + avatarText + '</div>';
    html += '<div class="conv-bubble">';
    html += '<div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.5rem">' + label + ' · ' + time + '</div>';
    html += '<div style="white-space:pre-wrap">' + escapeHtml(conv.message) + '</div>';
    html += '</div>';
    html += '</div>';
  });

  thread.innerHTML = html;
  thread.scrollTop = thread.scrollHeight;
}

// ===== USE AI SUGGESTION =====
function useAiSuggestion() {
  showToast('AI suggestions coming soon!', 'info');
}

// ===== SCHEDULE FOLLOW-UP =====
function scheduleFollowup() {
  if (!activeContact) {
    showToast('No active contact', 'error');
    return;
  }

  var date = el('followupDate').value;
  var time = el('followupTime').value;

  if (!date) {
    showToast('Please select a date', 'error');
    return;
  }

  var contacts = getAllContacts();
  var contact = contacts.find(function(c) { return c.id === activeContact.id; });
  if (!contact) return;

  if (!contact.followUps) contact.followUps = [];
  contact.followUps.push({
    date: date,
    time: time || '09:00',
    created: new Date().toISOString()
  });

  saveAllContacts(contacts);

  // Display follow-up
  var display = el('followupDisplay');
  var displayDate = new Date(date + 'T' + (time || '09:00'));
  display.textContent = '📅 Follow-up scheduled for ' + displayDate.toLocaleString();
  display.style.display = 'block';

  showToast('Follow-up scheduled!', 'success');
  loadCRMData();
}

// ===== LOAD CRM DATA =====
function loadCRMData() {
  var contacts = getAllContacts();

  // Update stats
  el('statTotal').textContent = contacts.length;
  el('statInterested').textContent = contacts.filter(function(c) { return c.interestLevel >= 50; }).length;
  el('statFollowups').textContent = contacts.filter(function(c) { return c.followUps && c.followUps.length > 0; }).length;
  el('statClosed').textContent = contacts.filter(function(c) { return c.interestLevel === 100; }).length;

  // Render contact list
  renderContactList(contacts);
}

// ===== RENDER CONTACT LIST =====
function renderContactList(contacts) {
  var list = el('crmList');

  if (contacts.length === 0) {
    list.innerHTML = '<div class="crm-empty"><div class="placeholder-icon">📂</div><h3>No contacts yet</h3><p>Enter a business contact above to get started.</p></div>';
    return;
  }

  // Sort by most recent
  contacts.sort(function(a, b) {
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  var html = '';
  contacts.forEach(function(contact) {
    var initials = contact.businessName.substring(0, 2).toUpperCase();
    var statusClass = contact.status || 'new';
    var statusLabel = {
      'new': 'New',
      'contacted': 'Contacted',
      'interested': 'Interested',
      'followup': 'Follow-up',
      'customer': 'Customer',
      'lost': 'Lost'
    }[statusClass] || statusClass;

    html += '<div class="crm-contact" data-id="' + contact.id + '">';
    html += '<div class="crm-avatar">' + initials + '</div>';
    html += '<div class="crm-info">';
    html += '<div class="crm-name">' + escapeHtml(contact.businessName) + '</div>';
    html += '<div class="crm-meta">';
    html += '<span>' + escapeHtml(contact.businessType) + '</span>';
    html += '<span>' + contact.phone + '</span>';
    if (contact.conversations && contact.conversations.length > 0) {
      html += '<span>' + contact.conversations.length + ' msgs</span>';
    }
    html += '</div>';
    html += '</div>';
    html += '<div class="crm-status ' + statusClass + '">' + statusLabel + '</div>';
    html += '</div>';
  });

  list.innerHTML = html;

  // Add click handlers
  list.querySelectorAll('.crm-contact').forEach(function(elem) {
    elem.addEventListener('click', function() {
      var id = parseInt(this.getAttribute('data-id'));
      openContactModal(id);
    });
  });
}

// ===== FILTER CRM =====
function filterCRM(filter) {
  currentFilter = filter;

  // Update button states
  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.classList.remove('active');
    if (btn.getAttribute('data-filter') === filter) {
      btn.classList.add('active');
    }
  });

  var contacts = getAllContacts();
  var filtered = contacts;

  switch(filter) {
    case 'interested':
      filtered = contacts.filter(function(c) { return c.interestLevel >= 50; });
      break;
    case 'followup':
      filtered = contacts.filter(function(c) { return c.followUps && c.followUps.length > 0; });
      break;
    case 'customer':
      filtered = contacts.filter(function(c) { return c.interestLevel === 100; });
      break;
    case 'lost':
      filtered = contacts.filter(function(c) { return c.interestLevel < 25; });
      break;
    case 'contacted':
      filtered = contacts.filter(function(c) { return c.status === 'contacted'; });
      break;
  }

  renderContactList(filtered);
}

// ===== OPEN CONTACT MODAL =====
function openContactModal(contactId) {
  var contacts = getAllContacts();
  var contact = contacts.find(function(c) { return c.id === contactId; });
  if (!contact) return;

  activeContact = contact;

  // Fill form with contact data
  el('businessName').value = contact.businessName || '';
  el('contactPerson').value = contact.contactPerson || '';
  el('phoneNumber').value = contact.phone || '';
  el('websiteUrl').value = contact.website || '';
  el('businessType').value = contact.businessType || '';
  el('notes').value = contact.notes || '';

  // Show modal
  el('modalTitle').textContent = contact.businessName;
  var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">';
  html += '<div><strong>Contact:</strong><br>' + escapeHtml(contact.contactPerson || 'Not provided') + '</div>';
  html += '<div><strong>Phone:</strong><br>' + escapeHtml(contact.phone) + '</div>';
  html += '<div><strong>Business Type:</strong><br>' + escapeHtml(contact.businessType) + '</div>';
  html += '<div><strong>Interest Level:</strong><br>' + contact.interestLevel + '%</div>';
  if (contact.website) {
    html += '<div style="grid-column:span 2"><strong>Website:</strong><br><a href="' + escapeHtml(contact.website) + '" target="_blank" style="color:var(--accent-primary)">' + escapeHtml(contact.website) + '</a></div>';
  }
  if (contact.notes) {
    html += '<div style="grid-column:span 2"><strong>Notes:</strong><br>' + escapeHtml(contact.notes) + '</div>';
  }
  if (contact.followUps && contact.followUps.length > 0) {
    html += '<div style="grid-column:span 2"><strong>Follow-ups:</strong><br>';
    contact.followUps.forEach(function(fu) {
      html += '📅 ' + fu.date + ' at ' + (fu.time || '09:00') + '<br>';
    });
    html += '</div>';
  }
  html += '</div>';

  el('modalBody').innerHTML = html;
  el('contactModal').style.display = 'flex';

  // Load conversation
  renderConversation(contact);
}

// ===== CLOSE MODAL =====
function closeModal() {
  el('contactModal').style.display = 'none';
}

// ===== SHOW TOAST =====
function showToast(message, type) {
  type = type || 'info';
  var container = el('toastContainer');
  var toast = document.createElement('div');
  toast.className = 'toast ' + type;

  var icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  toast.innerHTML = '<span class="toast-icon">' + (icons[type] || 'ℹ️') + '</span>';
  toast.innerHTML += '<span class="toast-text">' + escapeHtml(message) + '</span>';
  toast.innerHTML += '<button class="toast-close" onclick="this.parentElement.remove()">×</button>';

  container.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(function() {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 4000);
}

// ===== ESCAPE HTML =====
function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

console.log('WhatsApp AI Sales Assistant - All features loaded!');
