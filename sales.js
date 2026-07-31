// =============================================================
// WhatsApp AI Automation — sales.js
// Premium product page with interactive demo chatbot
// =============================================================

// ===== NAVBAR SCROLL EFFECT =====
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }
});

// ===== MOBILE MENU TOGGLE =====
const mobileToggle = document.getElementById('mobile-toggle');
if (mobileToggle) {
  mobileToggle.addEventListener('click', () => {
    const navLinks = document.getElementById('nav-links');
    if (navLinks) {
      navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '100%';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = 'rgba(5,5,16,0.95)';
      navLinks.style.padding = '1.5rem 2rem';
      navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
      navLinks.style.backdropFilter = 'blur(20px)';
    }
  });
}

// ===== REVEAL ON SCROLL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== FAQ TOGGLE =====
function toggleFaq(el) {
  const item = el.closest('.faq-item');
  const wasActive = item.classList.contains('active');
  // Close all
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
  // Open clicked one if it wasn't already open
  if (!wasActive) item.classList.add('active');
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== HERO PHONE CHAT ANIMATION =====
const heroChatMessages = [
  { type: 'incoming', text: 'Hi, do you have availability tomorrow?', delay: 0 },
  { type: 'outgoing', text: 'Hi there! 👋 Yes, we have slots available tomorrow. Would you prefer morning or afternoon?', delay: 2000 },
  { type: 'incoming', text: 'Morning please, around 10am', delay: 4500 },
  { type: 'outgoing', text: 'I have 9:30 and 10:30 available. Which works better for you?', delay: 6500 },
  { type: 'incoming', text: '10:30 is perfect!', delay: 9000 },
  { type: 'outgoing', text: 'Done! ✅ You\'re booked for 10:30 tomorrow. I\'ll send you a reminder tonight. Anything else I can help with?', delay: 11000 },
];

function animateHeroChat() {
  const chat = document.getElementById('hero-chat');
  if (!chat) return;
  chat.innerHTML = '';

  heroChatMessages.forEach((msg, i) => {
    setTimeout(() => {
      // Show typing indicator first for outgoing
      if (msg.type === 'outgoing' && i > 0) {
        const typing = document.createElement('div');
        typing.className = 'chat-typing';
        typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        chat.appendChild(typing);
        chat.scrollTop = chat.scrollHeight;

        setTimeout(() => {
          chat.removeChild(typing);
          addHeroBubble(msg, chat);
        }, 800);
      } else {
        addHeroBubble(msg, chat);
      }
    }, msg.delay);
  });

  // Loop the animation
  const totalDuration = heroChatMessages[heroChatMessages.length - 1].delay + 4000;
  setTimeout(animateHeroChat, totalDuration);
}

function addHeroBubble(msg, chat) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble chat-${msg.type}`;
  bubble.innerHTML = `${msg.text}<div class="chat-time">${new Date().toLocaleTimeString('en-ZA', {hour:'2-digit', minute:'2-digit'})}</div>`;
  chat.appendChild(bubble);
  chat.scrollTop = chat.scrollHeight;
}

// Start hero chat animation
setTimeout(animateHeroChat, 1000);

// ===== DEMO CHATBOT =====
// Knowledge base for the interactive demo
const demoResponses = {
  greetings: {
    patterns: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'sup', 'yo'],
    response: "Hello! 👋 Welcome! I'm the AI WhatsApp assistant. I can help you understand how we automate WhatsApp for businesses. What would you like to know?"
  },
  howItWorks: {
    patterns: ['how does it work', 'how it works', 'how do you do it', 'explain', 'tell me about it', 'what is this'],
    response: "Great question! Here's how it works:\n\n1️⃣ We learn about your business — services, pricing, FAQs\n2️⃣ We build a custom AI chatbot trained on YOUR business\n3️⃣ We connect it to your WhatsApp Business number\n4️⃣ It goes live 24/7 — replying, booking, capturing leads\n\nThe whole setup takes under 24 hours. No coding needed on your side! 🚀"
  },
  automate: {
    patterns: ['what can you automate', 'automate', 'automation', 'features', 'what do you do', 'capabilities'],
    response: "We automate your entire WhatsApp workflow:\n\n🤖 Custom AI chatbot — replies to every message instantly\n💬 Smart conversations — handles complex questions naturally\n🎯 Lead capture — saves every enquiry automatically\n📅 Appointment booking — customers book directly via WhatsApp\n📦 Order updates — automatic confirmations & shipping alerts\n📊 CRM sync — every conversation saved & searchable\n\nAll running 24/7 without you lifting a finger!"
  },
  pricing: {
    patterns: ['how much', 'cost', 'price', 'pricing', 'expensive', 'affordable', 'rates', 'packages', 'plans'],
    response: "We have 3 simple plans:\n\n💚 Starter — R1,499/mo (500 messages, basic chatbot)\n💜 Growth — R2,999/mo (2,000 messages, full automation + CRM)\n💎 Enterprise — Custom pricing (unlimited, multi-agent)\n\nAll plans include setup, training, and support. No contracts — cancel anytime. The Growth plan is our most popular! Would you like to know more about any specific plan?"
  },
  demo: {
    patterns: ['demo', 'demonstration', 'show me', 'see it', 'try it', 'test'],
    response: "You're already trying it! 😄 This conversation IS the demo — you're chatting with the same AI that would run your WhatsApp.\n\nNotice how fast I respond? That's the experience your customers get — instant, professional replies 24/7.\n\nWant to book a full demo where we show you a chatbot customised for YOUR business? Just say the word!"
  },
  leads: {
    patterns: ['lead', 'leads', 'capture', 'enquiries', 'inquiries', 'customers'],
    response: "Lead capture is where we really shine! 🎯\n\nEvery person who messages your WhatsApp gets:\n✅ Instant reply (no more lost leads)\n✅ Their details captured automatically\n✅ Follow-up messages on schedule\n✅ Full conversation history saved\n\nMost businesses see a 3-10x increase in lead conversion because they respond within seconds instead of hours."
  },
  booking: {
    patterns: ['booking', 'appointment', 'schedule', 'calendar', 'book'],
    response: "Our appointment booking is fully automated! 📅\n\nCustomers can:\n• Ask for available times via WhatsApp\n• Get real-time slot suggestions\n• Book instantly — no back-and-forth\n• Receive automatic confirmations & reminders\n\nIt integrates with Google Calendar, Outlook, and most booking systems. No double-bookings, ever!"
  },
  orderUpdates: {
    patterns: ['order', 'orders', 'shipping', 'delivery', 'notification', 'update'],
    response: "Order automation saves hours every day! 📦\n\nAutomatic WhatsApp messages for:\n✅ Order confirmations\n✅ Payment received\n✅ Order being prepared\n✅ Out for delivery\n✅ Delivered\n✅ Review requests\n\nYour customers stay informed without you sending a single manual message."
  },
  crm: {
    patterns: ['crm', 'database', 'history', 'sync', 'integrate', 'integration'],
    response: "Every WhatsApp conversation is synced to your CRM! 📊\n\nYou get:\n• Full chat history per customer\n• Lead status tracking\n• Conversation search\n• Team visibility (everyone sees the same context)\n• Export data anytime\n\nWe integrate with popular CRMs or can set up a simple one for you."
  },
  setup: {
    patterns: ['setup', 'set up', 'how long', 'time', 'quick', 'fast', 'start'],
    response: "Setup is fast and painless! ⚡\n\n1. You tell us about your business (30 min call)\n2. We build your AI bot (12-24 hours)\n3. You test and approve\n4. Go live!\n\nTotal time: usually under 24 hours. We handle ALL the technical stuff — you just start getting results."
  },
  whatsapp: {
    patterns: ['whatsapp business', 'business account', 'do i need', 'requirements'],
    response: "You need a WhatsApp Business number (not the regular WhatsApp). If you don't have one, we'll help you set it up — it's free and takes 10 minutes.\n\nWe use the official WhatsApp Business API, so everything is 100% compliant with WhatsApp's terms. No risk of getting banned! ✅"
  },
  aiPersonality: {
    patterns: ['personality', 'customise', 'customize', 'brand voice', 'tone', 'train'],
    response: "The AI is 100% customised to YOUR brand! 🎨\n\nWe train it on:\n• Your specific services & pricing\n• Your brand voice (formal, casual, fun — your choice)\n• Your FAQs and policies\n• Your industry knowledge\n\nYou can update it anytime — add new products, change pricing, update policies. It adapts instantly."
  },
  competitors: {
    patterns: ['competitor', 'different', 'better', 'why you', 'other', 'compare'],
    response: "What makes us different:\n\n✅ South African focused — we understand local businesses\n✅ Custom-trained AI — not a generic chatbot\n✅ Full setup done FOR you — no DIY\n✅ WhatsApp-native — built specifically for WA, not adapted from something else\n✅ Pay per value — not per seat or per feature\n✅ 24/7 monitoring — we make sure it always works\n\nWe're not just a tool — we're your automation partner."
  },
  safety: {
    patterns: ['safe', 'security', 'privacy', 'data', 'secure', 'safe'],
    response: "Your data is 100% secure! 🔒\n\n• End-to-end encryption on all messages\n• POPIA compliant (South African data protection)\n• WhatsApp Business API (official, verified)\n• Your data is never shared with anyone\n• You own all your data — export anytime\n\nSecurity is our top priority."
  },
  thanks: {
    patterns: ['thank', 'thanks', 'awesome', 'great', 'perfect', 'amazing', 'wonderful'],
    response: "You're welcome! 😊 I'm glad I could help. Ready to get started? You can WhatsApp us directly at +27 71 880 4995 and we'll set up a free consultation for your business. Have a great day! 🚀"
  },
  notInterested: {
    patterns: ['no', 'not interested', 'no thanks', 'pass', 'not now'],
    response: "No problem at all! If you ever change your mind, we're here. You can reach us anytime on WhatsApp at +27 71 880 4995. Have a wonderful day! 👋"
  }
};

// Default fallback responses
const fallbackResponses = [
  "That's a great question! I'd love to give you a detailed answer. For specific queries like that, our team can help — WhatsApp us at +27 71 880 4995 and we'll sort you out! 😊",
  "Interesting! I can help with that. Could you tell me more about what you're looking for? Or if you'd like to speak to our team directly, WhatsApp +27 71 880 4995.",
  "Good question! This is exactly the kind of thing we can discuss in a free consultation. Want me to connect you with our team? Just WhatsApp +27 71 880 4995 📱"
];

function findDemoResponse(input) {
  const lower = input.toLowerCase().trim();

  for (const [key, data] of Object.entries(demoResponses)) {
    for (const pattern of data.patterns) {
      if (lower.includes(pattern)) {
        return data.response;
      }
    }
  }

  // Fallback
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

function sendDemoMessage(text) {
  const input = document.getElementById('demo-input');
  const chat = document.getElementById('demo-chat');
  const quickReplies = document.getElementById('quick-replies');

  const message = text || input.value.trim();
  if (!message) return;

  // Clear input
  if (input) input.value = '';

  // Hide quick replies after first message
  if (quickReplies) quickReplies.style.display = 'none';

  // Add user message
  addDemoMsg(chat, message, 'user');

  // Show typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'demo-msg bot';
  typingDiv.id = 'typing-indicator';
  typingDiv.innerHTML = `
    <div class="demo-msg-avatar">🤖</div>
    <div class="demo-msg-bubble" style="background: rgba(37,211,102,0.05); border-color: rgba(37,211,102,0.1);">
      <div class="chat-typing" style="margin:0; padding:0; background:none;">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  chat.appendChild(typingDiv);
  chat.scrollTop = chat.scrollHeight;

  // Generate response after "thinking" delay
  const delay = 800 + Math.random() * 1200; // 0.8-2s
  setTimeout(() => {
    // Remove typing indicator
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();

    // Add bot response
    const response = findDemoResponse(message);
    addDemoMsg(chat, response, 'bot');
  }, delay);
}

function addDemoMsg(chat, text, type) {
  const msg = document.createElement('div');
  msg.className = `demo-msg ${type}`;

  const avatar = type === 'bot' ? '🤖' : '👤';
  const formattedText = text.replace(/\n/g, '<br>');

  msg.innerHTML = `
    <div class="demo-msg-avatar">${avatar}</div>
    <div class="demo-msg-bubble">${formattedText}</div>
  `;

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== COUNTER ANIMATION =====
function animateCounters() {
  const counters = document.querySelectorAll('.hero-stat-value');
  counters.forEach(counter => {
    const text = counter.textContent;
    // Only animate numeric values
    if (text.includes('/') || text.includes('x') || text.includes('<')) return;
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  animateCounters();
});
