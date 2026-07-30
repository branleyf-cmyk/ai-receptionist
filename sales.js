// ===== WHATSAPP AI SALES ASSISTANT =====
// Main application logic for business analysis, message generation, and CRM management

// ===== STATE =====
let activeContact = null;
let currentFilter = 'all';
let currentAiSuggestion = null;

// ===== BUSINESS TYPE KNOWLEDGE BASE =====
const businessKnowledge = {
  'Dentist': {
    challenges: ['Missing calls from patients in pain who need urgent appointments', 'After-hours inquiries going to voicemail', 'No-shows and last-minute cancellations', 'Difficulty confirming and reminding patients of appointments'],
    benefits: ['24/7 automated appointment booking for emergency and routine visits', 'Instant SMS/WhatsApp reminders to reduce no-shows by 40%', 'Capture leads even when the clinic is closed', 'Handle multiple calls simultaneously during busy periods'],
    painPoints: 'Dental practices lose an average of 30% of new patient calls that come in after hours or during lunch breaks. Patients in pain often call the next practice that answers.',
    valueProposition: 'An AI Receptionist ensures every potential patient gets through, books appointments instantly, and receives confirmation - even at 2 AM.'
  },
  'Plumber': {
    challenges: ['Emergency calls outside business hours', 'Difficulty answering calls while on a job', 'No-shows causing lost revenue', 'Competing with larger companies with 24/7 call centers'],
    benefits: ['Answer emergency calls instantly at any hour', 'Book jobs and send confirmation messages automatically', 'Qualify leads by asking about the problem before dispatching', 'Never miss a high-value emergency job again'],
    painPoints: 'Plumbing emergencies don\'t wait for business hours. A burst pipe at midnight means the customer needs help NOW, and the first plumber to answer gets the R5,000 job.',
    valueProposition: 'Your AI Receptionist answers every emergency call immediately, books the job, and sends confirmation - so you never lose another high-value plumbing call to a competitor.'
  },
  'Electrician': {
    challenges: ['Emergency calls when on-site with another client', 'After-hours inquiries going unanswered', 'Difficulty prioritizing urgent vs routine jobs', 'Missed calls during peak evening hours when most people are home'],
    benefits: ['Answer calls instantly even when you\'re on a job', 'Automatically triage emergency vs routine requests', 'Book appointments and send arrival time confirmations', 'Capture every lead 24/7 without hiring extra staff'],
    painPoints: 'Most electrical issues happen in the evening when homeowners notice problems. If you don\'t answer, they call the next electrician on Google.',
    valueProposition: 'Your AI Receptionist answers every call immediately, asks the right questions to prioritize emergencies, and books jobs while you focus on the work.'
  },
  'Salon / Spa': {
    challenges: ['Double bookings and scheduling conflicts', 'No-shows causing empty chairs and lost revenue', 'Calls during treatments going to voicemail', 'Difficulty managing multiple stylists\' schedules'],
    benefits: ['Real-time appointment scheduling with availability checks', 'Automated reminders reducing no-shows by 50%', 'Book appointments even when all stylists are busy with clients', 'Handle cancellations and rescheduling automatically'],
    painPoints: 'A typical salon loses R15,000-R30,000 per month to no-shows and missed calls during busy periods. Empty chairs cost money every minute.',
    valueProposition: 'Your AI Receptionist books appointments, sends reminders, and fills cancellations automatically - keeping your chairs full and revenue flowing.'
  },
  'Gym / Fitness': {
    challenges: ['Prospective members calling outside staff hours', 'Difficulty managing free trial sign-ups', 'Member inquiries about classes and schedules', 'High competition from chain gyms with 24/7 support'],
    benefits: ['Capture new member sign-ups 24/7 with automated onboarding', 'Answer questions about classes, pricing, and schedules instantly', 'Book free trial sessions and send confirmation details', 'Retain members with automated check-in reminders'],
    painPoints: 'The fitness industry is brutally competitive. Someone researching gyms at 10 PM will join the first one that responds - not the one that takes until morning.',
    valueProposition: 'Your AI Receptionist signs up new members, books trial sessions, and answers member questions around the clock - giving you an unfair advantage over competitors.'
  },
  'Restaurant': {
    challenges: ['Reservation calls during busy service hours', 'After-hours catering and private event inquiries', 'Staff struggling to answer phones during rushes', 'Lost reservations and double-bookings'],
    benefits: ['Take reservations automatically even during the dinner rush', 'Handle catering inquiries with detailed information collection', 'Confirm reservations via WhatsApp with directions and menu links', 'Never miss a large party booking again'],
    painPoints: 'During Friday dinner service, the last thing your staff needs is answering phones. But missing a call from a party of 20 means losing R8,000-R15,000 in revenue.',
    valueProposition: 'Your AI Receptionist handles all reservations, catering inquiries, and customer questions - so your staff focuses on serving guests, not phones.'
  },
  'Real Estate': {
    challenges: ['Lead response time - buyers call multiple agents simultaneously', 'After-hours inquiries from serious buyers', 'Difficulty qualifying leads before scheduling viewings', 'Lost opportunities from slow response times'],
    benefits: ['Respond to new leads within seconds, 24/7', 'Qualify buyers with pre-screening questions about budget and needs', 'Book property viewings automatically on your calendar', 'Follow up with unresponsive leads automatically'],
    painPoints: 'Real estate is a speed game. The first agent to respond gets the client. Studies show 78% of buyers go with the first agent who responds to their inquiry.',
    valueProposition: 'Your AI Receptionist responds to every lead instantly, qualifies them, and books viewings - so you\'re always first to engage with serious buyers.'
  },
  'Law Firm': {
    challenges: ['Potential clients calling after hours during legal emergencies', 'Difficulty screening and qualifying new clients', 'Missed consultations costing high-value retainers', 'Administrative burden of initial client intake'],
    benefits: ['Answer calls 24/7 for legal emergencies and consultations', 'Pre-screen potential clients with relevant intake questions', 'Book consultations on lawyer\'s calendar automatically', 'Collect preliminary case information before first meeting'],
    painPoints: 'Legal emergencies don\'t wait for business hours. A potential client calling at 9 PM about a DUI charge needs immediate help - and will hire the first firm that answers.',
    valueProposition: 'Your AI Receptionist captures every potential client, screens cases, and books consultations - so you never lose a high-value retainer to slow response times.'
  },
  'Accountant': {
    challenges: ['Seasonal call volume spikes during tax season', 'Difficulty scheduling consultations with busy professionals', 'Prospect inquiries outside business hours', 'Time wasted on initial qualification calls'],
    benefits: ['Handle call volume spikes without hiring temporary staff', 'Answer prospect questions about services and pricing 24/7', 'Book tax consultation appointments automatically', 'Pre-qualify leads by asking about their situation'],
    painPoints: 'During tax season (Jan-April), accounting firms experience 300% call volume increases. Missing calls means losing clients to competitors who answer faster.',
    valueProposition: 'Your AI Receptionist handles unlimited calls during peak season, books consultations, and pre-qualifies prospects - so you never turn away a potential client.'
  },
  'Retail Store': {
    challenges: ['Product availability questions when staff is busy', 'After-hours inquiries about store hours and locations', 'Missed opportunities from online shoppers calling for info', 'Difficulty managing multiple store locations'],
    benefits: ['Answer product questions instantly from any location', 'Provide store hours, directions, and inventory information 24/7', 'Handle customer service inquiries without staff time', 'Capture leads for special orders and back-in-stock notifications'],
    painPoints: 'When a customer calls to ask if you have a product in stock and you don\'t answer, they simply drive to your competitor. Every unanswered call is a lost sale.',
    valueProposition: 'Your AI Receptionist answers every product question, provides store info, and handles customer service - keeping customers coming to you instead of competitors.'
  },
  'Auto / Workshop': {
    challenges: ['Emergency breakdown calls outside hours', 'Difficulty answering phones while working on vehicles', 'Appointment scheduling conflicts', 'Lost revenue from missed calls during busy periods'],
    benefits: ['Answer breakdown emergencies 24/7 and dispatch help', 'Book service appointments with automatic availability checks', 'Provide quotes and service information instantly', 'Never lose a R10,000 engine rebuild to a missed call'],
    painPoints: 'When someone\'s car breaks down, they call the first workshop that answers. A missed call could mean losing a R5,000-R50,000 repair job to a competitor.',
    valueProposition: 'Your AI Receptionist answers every call immediately, books services, and provides quotes - so you never lose another high-value repair to a competitor who answered faster.'
  },
  'Home Services': {
    challenges: ['Emergency calls for urgent repairs (locks, plumbing, electrical)', 'Difficulty answering calls while on a job site', 'Competing with national companies with call centers', 'Lost jobs from slow response times'],
    benefits: ['Respond to emergency calls instantly, any time of day', 'Book jobs and send confirmation details automatically', 'Qualify leads by asking about the specific problem', 'Compete with large companies on response speed'],
    painPoints: 'Home service emergencies are won by speed. The first company to answer gets the job. National companies have 24/7 call centers - now you can compete.',
    valueProposition: 'Your AI Receptionist gives you the same 24/7 response capability as national companies, at a fraction of the cost - so you win more emergency jobs.'
  },
  'Healthcare': {
    challenges: ['Patient appointment scheduling outside clinic hours', 'Medication and treatment inquiries', 'Difficulty managing multiple practitioner schedules', 'Missed calls during consultations'],
    benefits: ['Book patient appointments 24/7 with automated reminders', 'Answer common health questions and direct to appropriate resources', 'Handle prescription refill requests and scheduling', 'Reduce no-shows with automated confirmation messages'],
    painPoints: 'Healthcare practices lose patients to clinics that are easier to book with. Patients expect modern, instant scheduling - not voicemail and callbacks.',
    valueProposition: 'Your AI Receptionist books appointments, sends reminders, and handles patient inquiries around the clock - improving patient experience and reducing no-shows.'
  },
  'Education': {
    challenges: ['Enrollment inquiries outside office hours', 'Parent questions about programs and fees', 'Difficulty managing campus tour bookings', 'Prospective student follow-ups falling through cracks'],
    benefits: ['Answer enrollment questions 24/7 with detailed program information', 'Book campus tours and interviews automatically', 'Follow up with prospective students who showed interest', 'Handle parent inquiries about fees, schedules, and requirements'],
    painPoints: 'Education decisions are time-sensitive. A parent researching schools will contact the first institution that responds comprehensively to their questions.',
    valueProposition: 'Your AI Receptionist handles all enrollment inquiries, books tours, and follows up with prospects - so you never lose a student to a faster-responding competitor.'
  },
  'Tech / IT': {
    challenges: ['Support calls from existing clients outside business hours', 'New client inquiries about services and pricing', 'Difficulty qualifying leads before technical consultations', 'Competition from large MSPs with 24/7 support'],
    benefits: ['Provide 24/7 support for common IT issues and password resets', 'Qualify new leads by asking about their tech stack and needs', 'Book technical consultations with appropriate specialists', 'Respond to RFPs and inquiries instantly'],
    painPoints: 'IT support is expected to be available 24/7. If you don\'t answer, clients will find an MSP that does. Every missed call is a potential client churn.',
    valueProposition: 'Your AI Receptionist provides instant 24/7 support, qualifies new leads, and books consultations - giving you enterprise-level responsiveness at small-business cost.'
  },
  'Marketing Agency': {
    challenges: ['New client inquiries about services and case studies', 'Difficulty qualifying leads before pitch meetings', 'Responding to RFPs and proposal requests quickly', 'After-hours inquiries from urgent client needs'],
    benefits: ['Respond to new client inquiries within seconds, any time', 'Qualify leads by asking about budget, timeline, and goals', 'Book pitch meetings and send relevant case studies automatically', 'Never lose a R50,000 monthly retainer to a slow response'],
    painPoints: 'Marketing decisions move fast. A business needing urgent help will hire the first agency that responds with confidence and relevant examples.',
    valueProposition: 'Your AI Receptionist responds to every inquiry instantly, qualifies leads, and books pitch meetings - so you win more clients with faster response times.'
  },
  'Construction': {
    challenges: ['Emergency repair calls for urgent issues', 'Difficulty quoting projects while on-site', 'Subcontractor and supplier coordination calls', 'New project inquiries outside office hours'],
    benefits: ['Answer emergency calls 24/7 and dispatch help immediately', 'Book site visits and consultations on your calendar', 'Handle supplier calls and coordinate deliveries', 'Capture new project leads even when you\'re on a job site'],
    painPoints: 'Construction emergencies and new projects don\'t wait for business hours. A R2 million building project goes to the contractor who responds first.',
    valueProposition: 'Your AI Receptionist handles emergency calls, books site visits, and captures new project leads - so you never miss a high-value construction opportunity.'
  },
  'Other': {
    challenges: ['Missing calls outside business hours', 'Difficulty managing call volume during busy periods', 'Lost opportunities from slow response times', 'Competing with businesses that have dedicated reception staff'],
    benefits: ['Answer every call 24/7 without hiring additional staff', 'Book appointments and send confirmations automatically', 'Qualify leads and capture contact information', 'Never lose a customer to a competitor who answered faster'],
    painPoints: 'Every missed call is a missed opportunity. In today\'s market, customers expect instant responses - not voicemail and callbacks.',
    valueProposition: 'Your AI Receptionist ensures you never miss another customer call, books appointments automatically, and qualifies leads - all at a fraction of the cost of a human receptionist.'
  }
};

// ===== FORM VALIDATION =====
function validateForm() {
  const businessName = document.getElementById('business-name').value.trim();
  const phone = document.getElementById('phone-number').value.trim();
  const businessType = document.getElementById('business-type').value;

  if (!businessName) {
    showToast('error', 'Please enter the business name');
    document.getElementById('business-name').focus();
    return null;
  }

  if (!phone) {
    showToast('error', 'Please enter the WhatsApp number');
    document.getElementById('phone-number').focus();
    return null;
  }

  if (!businessType) {
    showToast('error', 'Please select a business type');
    document.getElementById('business-type').focus();
    return null;
  }

  return {
    businessName,
    contactPerson: document.getElementById('contact-person').value.trim(),
    phone,
    website: document.getElementById('website-url').value.trim(),
    businessType,
    notes: document.getElementById('notes').value.trim()
  };
}

function getFormData() {
  return validateForm();
}

// ===== BUSINESS ANALYSIS (TEMPLATE-BASED) =====
async function fetchBusinessInfo(data) {
  const knowledge = businessKnowledge[data.businessType] || businessKnowledge['Other'];
  
  return {
    businessName: data.businessName,
    contactPerson: data.contactPerson,
    phone: data.phone,
    website: data.website,
    businessType: data.businessType,
    notes: data.notes,
    analysis: {
      whatTheyDo: `${data.businessName} is a ${data.businessType.toLowerCase()} business${data.website ? ` with a website at ${data.website}` : ''}.`,
      services: `Core services include standard ${data.businessType.toLowerCase()} offerings. ${data.notes ? `Additional notes: ${data.notes}` : ''}`,
      challenges: knowledge.challenges,
      howAIHelps: knowledge.benefits,
      industryBenefits: knowledge.benefits.slice(0, 3).join(', '),
      painPoints: knowledge.painPoints,
      valueProposition: knowledge.valueProposition,
      competitors: `Other ${data.businessType.toLowerCase()} businesses in the area who may not offer 24/7 call answering`,
      marketPosition: `As a ${data.businessType.toLowerCase()} business, being available 24/7 gives a significant competitive advantage`
    }
  };
}

function displayAnalysis(analysis) {
  const output = document.getElementById('analysis-output');
  if (!output) return;

  const html = `
    <div class="analysis-section">
      <div class="analysis-header">
        <div class="analysis-icon">ðŸŽ¯</div>
        <h4>${escapeHtml(analysis.businessName)} - Business Analysis</h4>
      </div>
      <div class="analysis-content">
        <div class="analysis-row">
          <div class="analysis-label">Business Type</div>
          <div class="analysis-value">${escapeHtml(analysis.businessType)}</div>
        </div>
        ${analysis.website ? `
        <div class="analysis-row">
          <div class="analysis-label">Website</div>
          <div class="analysis-value"><a href="${escapeHtml(analysis.website)}" target="_blank" style="color:#a5b4fc">${escapeHtml(analysis.website)}</a></div>
        </div>` : ''}
        ${analysis.notes ? `
        <div class="analysis-row">
          <div class="analysis-label">Notes</div>
          <div class="analysis-value">${escapeHtml(analysis.notes)}</div>
        </div>` : ''}
      </div>
    </div>

    <div class="analysis-section">
      <h4>âš¡ Key Challenges</h4>
      <ul class="analysis-list">
        ${analysis.challenges.map(c => `<li>${escapeHtml(c)}</li>`).join('')}
      </ul>
    </div>

    <div class="analysis-section">
      <h4>ðŸŽ¯ How AI Receptionist Helps</h4>
      <ul class="analysis-list">
        ${analysis.benefits.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
      </ul>
    </div>

    <div class="analysis-section">
      <h4>ðŸ’¡ Industry-Specific Benefits</h4>
      <p class="analysis-text">${escapeHtml(analysis.painPoints)}</p>
      <p class="analysis-text" style="color:#a5b4fc;font-weight:500">${escapeHtml(analysis.valueProposition)}</p>
    </div>
  `;

  output.innerHTML = html;
  setOutputStatus('analysis-status', 'active', 'Analysis Complete');
}

// ===== SALES STRATEGY GENERATION =====
async function generateSalesStrategy(analysis, formData) {
  const talkingPoints = [
    `"Every call you miss is money left on the table. How many calls do you miss each week?"`,
    `"What happens when a potential customer calls at 10 PM and gets voicemail?"`,
    `"Your competitors are answering calls 24/7 - are you?"`,
    `"How much revenue do you lose to no-shows and missed appointments?"`,
    `"What's the lifetime value of a customer you never got to speak with?"`
  ];

  const objections = [
    { objection: '"I already have reception staff"', response: '"That\'s great for during business hours. But what about after 5 PM? Weekends? Emergencies? AI handles the overflow so your staff can focus on in-person customers."' },
    { objection: '"It\'s too expensive"', response: '"An AI Receptionist costs less than R1000/month - less than one day of a part-time receptionist. And it works 24/7/365."' },
    { objection: '"I\'m not sure it will work for my industry"', response: `"'${escapeHtml(formData.businessType)}' is actually one of our most successful industries. [Industry-specific example]. Can I show you a quick demo?"' },
    { objection: '"I\'m happy with how things are"', response: '"That\'s understandable. Quick question - how many calls go to voicemail each week? Even 5 missed calls could be worth R10,000+ in lost business."' },
    { objection: '"I need to think about it"', response: '"Of course! No pressure at all. Can I send you a quick 2-minute demo showing exactly how it works for ${escapeHtml(formData.businessType)}s?"' }
  ];

  const closingQuestions = [
    `"Would you like me to arrange a free 15-minute demo showing exactly how this works for ${escapeHtml(formData.businessType)}s?"`,
    `"What would it be worth to never miss another customer call again?"`,
    `"Can I show you a quick example of how the AI handles a typical ${escapeHtml(formData.businessType)} call?"`,
    `"Would next Tuesday or Thursday work better for a quick demo call?"`
  ];

  return {
    talkingPoints,
    objections,
    closingQuestions,
    approach: `Focus on the cost of missed calls in the ${formData.businessType} industry. Emphasize 24/7 availability and instant response times. Use industry-specific examples to build credibility.`,
    nextSteps: `If interested: Offer to send a voice demo or schedule a live 15-minute demo call. If hesitant: Offer a 30-day trial or money-back guarantee to reduce risk.`
  };
}

function displaySalesStrategy(strategy) {
  const output = document.getElementById('sales-strategy-output');
  if (!output) return;

  const html = `
    <div class="strategy-section">
      <div class="strategy-header">
        <div class="strategy-icon">ðŸ’¼</div>
        <h4>Sales Strategy</h4>
      </div>
      <div class="strategy-content">
        <p style="color:var(--text-secondary);margin-bottom:1rem">${escapeHtml(strategy.approach)}</p>
      </div>
    </div>

    <div class="strategy-section">
      <h4>ðŸŽ¤ Opening Questions</h4>
      <ul class="strategy-list">
        ${strategy.talkingPoints.map(tp => `<li>${escapeHtml(tp)}</li>`).join('')}
      </ul>
    </div>

    <div class="strategy-section">
      <h4>ï¸ Common Objections & Responses</h4>
      <div class="objection-list">
        ${strategy.objections.map(o => `
          <div class="objection-item">
            <div class="objection-text">${escapeHtml(o.objection)}</div>
            <div class="objection-response">${escapeHtml(o.response)}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="strategy-section">
      <h4> Closing Questions</h4>
      <ul class="strategy-list">
        ${strategy.closingQuestions.map(cq => `<li>${escapeHtml(cq)}</li>`).join('')}
      </ul>
    </div>

    <div class="strategy-section">
      <h4>ðŸ“‹ Next Steps</h4>
      <p style="color:var(--text-secondary)">${escapeHtml(strategy.nextSteps)}</p>
    </div>
  `;

  output.innerHTML = html;
  setOutputStatus('sales-strategy-status', 'active', 'Strategy Generated');
}

// ===== WHATSAPP MESSAGE GENERATION =====
async function generateWhatsAppMessage(analysisText) {
  const data = getFormData();
  if (!data) return null;

  const knowledge = businessKnowledge[data.businessType] || businessKnowledge['Other'];
  const contactName = data.contactPerson ? data.contactPerson : 'there';

  const messages = {
    'Dentist': `Hi ${contactName}, this is [Your Name] from [Your Company]. I noticed you run ${data.businessName}, and I wanted to reach out about something that could really help your practice.

We help dental clinics like yours answer every patient call instantly - even at 2 AM when someone's in pain and needs an emergency appointment. Our AI Receptionist books appointments, sends reminders (reducing no-shows by 40%), and captures every lead that would otherwise go to voicemail.

Quick question - how many calls do you typically miss during lunch breaks or after hours each week?

Would you be open to a quick 2-minute voice demo showing exactly how it sounds? No pressure at all.`,

    'Plumber': `Hi ${contactName}, this is [Your Name] from [Your Company]. I'm reaching out because I help plumbing businesses like ${data.businessName} capture every emergency call - even at midnight.

When a pipe bursts at 11 PM, the customer calls the first plumber who answers. Our AI Receptionist answers instantly, books the job, and sends you all the details - so you never lose another R5,000 emergency call to a competitor.

How many calls would you say go to voicemail each week, especially during busy jobs?

I can send you a quick 2-minute demo showing how it handles emergency calls. Interested?`,

    'Electrician': `Hi ${contactName}, [Your Name] here from [Your Company]. I help electricians like you answer every call immediately - even when you're on-site with another client.

Most electrical emergencies happen in the evening when homeowners are home. If you don't answer, they call the next electrician on Google. Our AI Receptionist answers instantly, asks the right questions to triage emergencies, and books jobs automatically.

How many calls would you estimate you miss during peak evening hours?

Would you like to hear a 2-minute demo of how it handles emergency calls?`,

    'Salon / Spa': `Hi ${contactName}, this is [Your Name] from [Your Company]. I help salons and spas like ${data.businessName} keep their chairs full by eliminating no-shows and capturing every booking call.

Our AI Receptionist handles all appointment bookings, sends automated reminders (reducing no-shows by 50%), and fills last-minute cancellations - even when all your stylists are busy with clients.

How much revenue would you say you lose to no-shows and missed calls each month?

I can show you a quick demo of how it books appointments and reduces no-shows. Would that be helpful?`,

    'default': `Hi ${contactName}, this is [Your Name] from [Your Company]. I'm reaching out because I help ${data.businessType.toLowerCase()} businesses like ${data.businessName} never miss another customer call.

Our AI Receptionist answers every call 24/7, books appointments, and qualifies leads - so you never lose another opportunity to a competitor who answered faster.

${knowledge.painPoints}

Quick question - how many calls would you say go to voicemail each week?

I'd love to show you a quick 2-minute demo of how it works for ${data.businessType.toLowerCase()} businesses. Would you be open to that?`
  };

  return messages[data.businessType] || messages['default'];
}

function displayWhatsAppMessage(message) {
  const textarea = document.getElementById('message-editor-textarea');
  if (!textarea) return;

  textarea.value = message;
  autoResizeTextarea(textarea);
  setOutputStatus('message-status', 'active', 'Message Ready');
}

// ===== FOLLOW-UP SUGGESTION =====
async function generateFollowUpSuggestion(conversations) {
  const lastCustomerMsg = conversations.filter(c => c.role === 'them').slice(-1)[0];
  
  if (!lastCustomerMsg) {
    return `This is a new prospect from ${getFormData()?.businessName || 'the business'}. Start with a friendly introduction and ask about their biggest challenge with missed calls.`;
  }

  const msg = lastCustomerMsg.text.toLowerCase();
  
  if (msg.includes('interested') || msg.includes('yes') || msg.includes('tell me more')) {
    return `**Interest Level: High - They're showing interest**

**Suggested Response:**
"Great! I'd love to show you exactly how it works. Can I send you a 2-minute voice demo so you can hear how naturally the AI handles ${getFormData()?.businessType || ''} calls? And would Tuesday or Thursday work better for a quick 15-minute demo call?"`;
  }
  
  if (msg.includes('price') || msg.includes('cost') || msg.includes('expensive') || msg.includes('how much')) {
    return `**Interest Level: Medium - They're asking about pricing**

**Suggested Response:**
"Fair question! Our Starter plan is R499/month - that's less than one day of a part-time receptionist, and it works 24/7/365. Most businesses see ROI from capturing just 2-3 missed calls per month. Can I show you a quick breakdown of what you'd get?"`;
  }
  
  if (msg.includes('no') || msg.includes('not interested') || msg.includes('don\'t need') || msg.includes('busy')) {
    return `**Interest Level: Low - They're not interested right now**

**Suggested Response:**
"No worries at all, I completely understand! If things change down the road or you start noticing missed calls costing you business, feel free to reach out. I'll send you our info just in case. Have a great day!"`;
  }
  
  if (msg.includes('maybe') || msg.includes('think about') || msg.includes('later')) {
    return `**Interest Level: Medium - They want to think about it**

**Suggested Response:**
"Of course! No pressure at all. To help you decide, can I send you a quick 2-minute voice demo so you can hear how it sounds? And I'll check back next week - would that be okay?"`;
  }

  // Default follow-up for unclear responses
  return `**Interest Level: Unclear - Need more information**

**Suggested Response:**
"I understand! Quick question - how many calls would you estimate go to voicemail each week? Even getting a sense of that number might help determine if this could be valuable for ${getFormData()?.businessName || 'the business'}."`;
}

// ===== ANALYSE BUTTON HANDLER =====

async function analyseAndGenerate()() {
  const data = validateForm();
  if (!data) return;

  // Show loading state
  setOutputStatus('analysis-status', 'loading', 'Analysing business...');
  setOutputStatus('sales-strategy-status', 'loading', 'Generating strategy...');
  setOutputStatus('message-status', 'loading', 'Crafting message...');

  // Disable button
  const btn = document.getElementById('analyse-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Analysing...';

  try {
    // Step 1: Business Analysis (instant)
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing
    const analysis = await fetchBusinessInfo(data);
    displayAnalysis(analysis.analysis);

    // Step 2: Sales Strategy (instant)
    await new Promise(resolve => setTimeout(resolve, 600));
    const strategy = await generateSalesStrategy(analysis.analysis, data);
    displaySalesStrategy(strategy);

    // Step 3: WhatsApp Message (instant)
    await new Promise(resolve => setTimeout(resolve, 500));
    const message = await generateWhatsAppMessage();
    displayWhatsAppMessage(message);

    // Create contact and save to CRM
    if (!activeContact) {
      activeContact = createContactFromForm();
      saveContactToStorage(activeContact);
      refreshCRMStats();
      renderCRMList();
    }

    showToast('success', 'Business analysed and message generated!');
    
    // Scroll to message section
    document.getElementById('message-section').scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    showToast('error', 'Error: ' + err.message);
    setOutputStatus('analysis-status', 'error', 'Error: ' + err.message);
    setOutputStatus('sales-strategy-status', 'error', 'Error: ' + err.message);
    setOutputStatus('message-status', 'error', 'Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'ðŸ§  Analyse Business & Generate Message';
  }
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

  showToast('info', 'Generating new message...');

  try {
    const message = await generateWhatsAppMessage();
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
    textarea.select();
    document.execCommand('copy');
    showToast('success', 'Message copied!');
  });
}

// ===== CONVERSATION MANAGEMENT =====
function addConversationEntry(role, text) {
  if (!activeContact) {
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
        <div class="placeholder-icon">ðŸ’¬</div>
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
    const avatarText = isUs ? 'ðŸ¤–' : 'ðŸ‘¤';
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
  if (level >= 80) value.textContent = 'ðŸ”¥ Hot';
  else if (level >= 50) value.textContent = 'âœ… Warm';
  else if (level >= 25) value.textContent = 'ðŸ¤” Cool';
  else if (level > 0) value.textContent = 'â„ï¸ Cold';
  else value.textContent = 'â€”';
}

// ===== AI FOLLOW-UP SUGGESTION (TEMPLATE-BASED) =====
async function getAiSuggestion() {
  if (!activeContact || !activeContact.conversations || activeContact.conversations.length === 0) {
    showToast('error', 'Log a customer response first, then ask for AI suggestions');
    return;
  }

  const box = document.getElementById('ai-suggestion-box');
  const textEl = document.getElementById('ai-suggestion-text');
  box.classList.remove('hidden');
  textEl.innerHTML = '<span class="spinner"></span> Thinking...';

  try {
    const suggestion = await generateFollowUpSuggestion(activeContact.conversations);
    currentAiSuggestion = suggestion;

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

  const textarea = document.getElementById('message-editor-textarea');
  textarea.value = text;
  autoResizeTextarea(textarea);
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

  contacts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

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
        <div class="placeholder-icon">ðŸ“‚</div>
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
            ${followupStr ? `<span> ${followupStr}</span>` : ''}
            <span>${c.conversations?.length || 0} msgs</span>
          </div>
        </div>
        <span class="crm-status-badge ${c.status}">${statusLabel}</span>
        <div class="crm-actions-col">
          <button class="crm-action-btn" onclick="event.stopPropagation(); openContactDetail(${c.id})" title="View details">ðŸ”</button>
          <button class="crm-action-btn delete" onclick="event.stopPropagation(); confirmDeleteContact(${c.id})" title="Delete">ï¸</button>
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

  document.getElementById('business-name').value = contact.businessName || '';
  document.getElementById('contact-person').value = contact.contactPerson || '';
  document.getElementById('phone-number').value = contact.phone || '';
  document.getElementById('website-url').value = contact.website || '';
  document.getElementById('business-type').value = contact.businessType || '';
  document.getElementById('notes').value = contact.notes || '';

  renderConversationThread();
  updateInterestBar(contact.interestLevel || 0);

  if (contact.followUps && contact.followUps.length > 0) {
    const last = contact.followUps[contact.followUps.length - 1];
    const display = document.getElementById('followup-display');
    const text = document.getElementById('followup-text');
    const d = new Date(last.date + 'T' + (last.time || '09:00'));
    text.textContent = d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    display.classList.remove('hidden');
  }

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
      const label = m.role === 'us' ? 'ðŸ¤– You' : `ðŸ‘¤ ${c.contactPerson || 'Client'}`;
      const time = new Date(m.time).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      return `<div style="margin-bottom:0.75rem;padding:0.6rem;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid var(--border-glass)">
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.3rem">${label} Â· ${time}</div>
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
      return `<div style="font-size:0.85rem">ðŸ“… ${d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>`;
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
        <p>${escapeHtml(c.businessType)} Â· ${escapeHtml(c.phone)}</p>
      </div>
    </div>

    <div class="detail-grid">
      <div class="detail-section">
        <h4>ðŸ‘¤ Contact Person</h4>
        <p>${escapeHtml(c.contactPerson || 'Not provided')}</p>
      </div>
      <div class="detail-section">
        <h4>ðŸŒ Website</h4>
        <p>${c.website ? `<a href="${escapeHtml(c.website)}" target="_blank" style="color:#a5b4fc">${escapeHtml(c.website)}</a>` : 'Not provided'}</p>
      </div>
      <div class="detail-section">
        <h4>ðŸ“Š Status</h4>
        <p><span class="crm-status-badge ${c.status}">${statusLabel}</span></p>
      </div>
      <div class="detail-section">
        <h4> Interest Level</h4>
        <p>${c.interestLevel || 0}%</p>
      </div>
    </div>

    ${c.notes ? `<div class="detail-section"><h4>ðŸ“ Notes</h4><p>${escapeHtml(c.notes)}</p></div>` : ''}

    <div class="detail-section">
      <h4>ðŸ’¬ Conversation History</h4>
      ${convHtml}
    </div>

    <div class="detail-section">
      <h4>ðŸ“… Follow-ups</h4>
      ${followupHtml}
    </div>

    <div class="detail-section">
      <h4>âš¡ Update Status</h4>
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
  openContactDetail(id);
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

// ===== TOAST NOTIFICATIONS =====
function showToast(type, message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: 'âœ…', error: '', info: 'â„¹ï¸', warning: 'âš ï¸' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ï¸'}</span>
    <span class="toast-text">${escapeHtml(message)}</span>
    <button class="toast-close" onclick="this.parentElement.style.animation='toastOut 0.3s ease forwards'; setTimeout(() => this.parentElement.remove(), 300)">Ã—</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

// ===== HTML ESCAPE =====
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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

// ===== INITIALIZE ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
  // Attach analyse button handler
  const analyseBtn = document.getElementById('analyse-btn');
  if (analyseBtn) {
    analyseBtn.onclick = handleAnalyse;
  }

  // Attach send WhatsApp button
  const sendBtn = document.getElementById('send-whatsapp-btn');
  if (sendBtn) {
    sendBtn.onclick = sendViaWhatsApp;
  }

  // Load CRM data
  loadCRMData();
});