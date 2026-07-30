
    // ===== PARTICLE NETWORK CANVAS =====
    (function() {
      const canvas = document.getElementById('hero-canvas');
      const ctx = canvas.getContext('2d');
      let particles = [];
      let mouse = { x: null, y: null };
      let w, h;

      function resize() {
        w = canvas.width = canvas.parentElement.offsetWidth;
        h = canvas.height = canvas.parentElement.offsetHeight;
      }

      class Particle {
        constructor() {
          this.x = Math.random() * w;
          this.y = Math.random() * h;
          this.vx = (Math.random() - 0.5) * 0.5;
          this.vy = (Math.random() - 0.5) * 0.5;
          this.radius = Math.random() * 1.5 + 0.5;
        }
        update() {
          this.x += this.vx;
          this.y += this.vy;
          if (this.x < 0 || this.x > w) this.vx *= -1;
          if (this.y < 0 || this.y > h) this.vy *= -1;
        }
        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
          ctx.fill();
        }
      }

      function init() {
        particles = [];
        const count = Math.min(Math.floor((w * h) / 12000), 120);
        for (let i = 0; i < count; i++) particles.push(new Particle());
      }

      function drawLines() {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist / 120)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
          // Mouse connection
          if (mouse.x !== null) {
            const dx = particles[i].x - mouse.x;
            const dy = particles[i].y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = `rgba(6, 182, 212, ${0.3 * (1 - dist / 150)})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
      }

      function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(); p.draw(); });
        drawLines();
        requestAnimationFrame(animate);
      }

      canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });

      canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

      window.addEventListener('resize', () => { resize(); init(); });
      resize();
      init();
      animate();
    })();

    // ===== SCROLL REVEAL =====
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(el => observer.observe(el));

    // ===== NAVBAR SCROLL =====
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ===== MOBILE MENU =====
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });

    // ===== ANIMATED COUNTERS =====
    function animateCounters() {
      const counters = document.querySelectorAll('.stat-number[data-target]');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(start + (target - start) * eased);
          counter.textContent = current + '%';
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
      });
    }

    const statsSection = document.querySelector('.stats-section');
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounters();
        statsObserver.disconnect();
      }
    }, { threshold: 0.3 });

    if (statsSection) statsObserver.observe(statsSection);

    // ===== FAQ TOGGLE =====
    function toggleFAQ(el) {
      const item = el.parentElement;
      const isActive = item.classList.contains("active");
      document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("active"));
      if (!isActive) item.classList.add("active");
    }

    // ===== PHONE CALL DEMO =====
    const demoScripts = {
      dental: {
        callerName: "Sarah Mitchell",
        callerBusiness: "Calling: Bright Smile Dental",
        messages: [
          { from: "caller", text: "Hi, I have a terrible toothache and need to see a dentist as soon as possible." },
          { from: "ai", text: "I am so sorry to hear you are in pain, Sarah. Let me help you get in right away. Are you a current patient or would this be your first visit?" },
          { from: "caller", text: "First visit. I have never been there before." },
          { from: "ai", text: "Not a problem at all. I can fit you in for an emergency appointment today at 2:30 PM or tomorrow at 9:00 AM. Which works better for you?" },
          { from: "caller", text: "Today if possible. 2:30 works great." },
          { from: "ai", text: "Perfect. You are booked for today at 2:30 PM with Dr. Jacobs. I will send you a confirmation on WhatsApp with our address. Is there anything else I can help with?" },
          { from: "caller", text: "No, that is all. Thank you so much!" },
          { from: "ai", text: "You are very welcome, Sarah. We will see you at 2:30. Feel better soon. Goodbye!" }
        ]
      },
      plumber: {
        callerName: "David Khumalo",
        callerBusiness: "Calling: Khumalo Plumbing",
        messages: [
          { from: "caller", text: "Hello, my geyser just burst and water is flooding everywhere. I need someone urgently." },
          { from: "ai", text: "David, that sounds urgent. I am going to get this sorted for you right now. Can you confirm your address?" },
          { from: "caller", text: "42 Van Riebeeck Street, Centurion." },
          { from: "ai", text: "Got it. I have a technician in your area. He can be there within 45 minutes. Your emergency call-out is R350, and he will assess and quote before any work. Shall I dispatch him?" },
          { from: "caller", text: "Yes please, as fast as possible." },
          { from: "ai", text: "Done. Jacob is on his way to you right now. I will send you his details and the quote on WhatsApp. Stay safe and turn off your main water valve while you wait." },
          { from: "caller", text: "Thank you. Appreciate it." },
          { from: "ai", text: "Absolutely, David. Jacob will call you when he is 5 minutes away. Take care." }
        ]
      },
      salon: {
        callerName: "Nomsa Dlamini",
        callerBusiness: "Calling: Glow Beauty Lounge",
        messages: [
          { from: "caller", text: "Hi, I want to book a hair and nails appointment for this Saturday." },
          { from: "ai", text: "Hi Nomsa, lovely to hear from you. Let me check availability for you. What time on Saturday works best?" },
          { from: "caller", text: "Around 10 AM if possible." },
          { from: "ai", text: "You are in luck. I have Thandi available at 10:00 AM for a blowout and gel nails. The full package is R650. Shall I book it?" },
          { from: "caller", text: "Yes please!" },
          { from: "ai", text: "All done. Saturday at 10:00 AM with Thandi. I will send you a reminder on Friday. Anything else?" },
          { from: "caller", text: "No that is great. See you Saturday." },
          { from: "ai", text: "Wonderful. See you Saturday at 10, Nomsa. Have a beautiful day." }
        ]
      }
    };

    let demoTimeout = null;
    let demoInterval = null;

    function playDemo(scenario) {
      // Cancel any running demo
      if (demoTimeout) clearTimeout(demoTimeout);
      if (demoInterval) clearInterval(demoInterval);

      // Update active button
      document.querySelectorAll(".demo-btn").forEach(b => b.classList.remove("active"));
      event.target.classList.add("active");

      const data = demoScripts[scenario];
      document.getElementById("demoCallerName").textContent = data.callerName;
      document.getElementById("demoCallerBusiness").textContent = data.callerBusiness;
      const area = document.getElementById("conversationArea");
      area.innerHTML = "";

      document.getElementById("demoStatus").textContent = "AI Active ÔÇö Listening";
      document.querySelector(".status-dot").style.animationPlayState = "running";

      loadAndPlayScenario(scenario, area, data);
    }

    function loadAndPlayScenario(scenario, area, data) {
      let idx = 0;
      function showNext() {
        if (idx >= data.messages.length) {
          document.getElementById("demoStatus").textContent = "Call Complete Ô£ô";
          return;
        }
        const msg = data.messages[idx];
        const div = document.createElement("div");
        div.className = "chat-bubble " + (msg.from === "ai" ? "ai-bubble" : "caller-bubble");
        div.textContent = msg.text;
        div.style.opacity = "0";
        div.style.transform = "translateY(10px)";
        area.appendChild(div);
        area.scrollTop = area.scrollHeight;

        // Animate in
        requestAnimationFrame(() => {
          div.style.transition = "opacity 0.4s ease, transform 0.4s ease";
          div.style.opacity = "1";
          div.style.transform = "translateY(0)";
        });

        idx++;
        const delay = msg.from === "caller" ? 1800 : 2200;
        demoTimeout = setTimeout(showNext, delay);
      }
      showNext();
    }

    // Auto-launch dental demo on page load if in view
    const demoSection = document.getElementById("demo");
    if (demoSection) {
      const demoObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          demoObserver.disconnect();
          setTimeout(() => {
            const dentalBtn = document.querySelector(".demo-btn");
            if (dentalBtn) dentalBtn.click();
          }, 500);
        }
      }, { threshold: 0.3 });
      demoObserver.observe(demoSection);
    }

    // ===== YEAR =====
    document.getElementById('year').textContent = new Date().getFullYear();
  
    // ===== GEMINI AI CHATBOT =====
    let GEMINI_API_KEY = localStorage.getItem('gemini_api_key') || '';
    let chatbotOpen = false;

    function openChatbot() {
      document.getElementById('chatbot-widget').style.display = 'flex';
      document.getElementById('chatbot-toggle').style.display = 'none';
      chatbotOpen = true;
      updateApiKeyStatus();
    }

    function closeChatbot() {
      document.getElementById('chatbot-widget').style.display = 'none';
      document.getElementById('chatbot-toggle').style.display = 'flex';
      chatbotOpen = false;
    }

    function updateApiKeyStatus() {
      const status = document.getElementById('apiKeyStatus');
      if (GEMINI_API_KEY) {
        status.innerHTML = '✓ Gemini AI connected';
        status.style.color = '#6ee7b7';
      } else {
        status.innerHTML = '<a href="#" onclick="showApiKeyModal()" style="color: #c7d2fe; text-decoration: underline;">Set up your free AI key</a>';
      }
    }

    function showApiKeyModal() {
      const key = prompt('Enter your Gemini API key (get one free at https://aistudio.google.com/apikey):');
      if (key && key.trim()) {
        GEMINI_API_KEY = key.trim();
        localStorage.setItem('gemini_api_key', GEMINI_API_KEY);
        updateApiKeyStatus();
        addBotMessage('Perfect! I\'m now powered by Gemini AI. Ask me anything!');
      }
    }

    function askSuggestion(question) {
      document.getElementById('chatbot-input').value = question;
      sendChatbotMessage();
    }

    async function sendChatbotMessage() {
      const input = document.getElementById('chatbot-input');
      const message = input.value.trim();
      if (!message) return;

      // Add user message
      addUserMessage(message);
      input.value = '';

      // Show typing indicator
      showTyping();

      try {
        if (!GEMINI_API_KEY) {
          await new Promise(resolve => setTimeout(resolve, 800));
          hideTyping();
          addBotMessage('I\'m currently in demo mode! To unlock my full AI capabilities, click "Set up your free AI key" below. But I can still tell you: we never miss calls, we\'re available 24/7, and we cost less than hiring staff. What would you like to know?');
          return;
        }

        const response = await callGeminiAPI(message);
        hideTyping();
        addBotMessage(response);
      } catch (error) {
        console.error('Chatbot error:', error);
        hideTyping();
        addBotMessage('Sorry, I had trouble thinking of a response. Could you try asking that differently?');
      }
    }

    async function callGeminiAPI(message) {
      const systemPrompt = `You are an AI Receptionist demo for a South African business automation service. You are friendly, professional, and helpful. You help visitors understand:
- What the AI receptionist does (answers calls 24/7, books appointments, never misses a lead)
- Key features (calls leads automatically, answers every call, books appointments, follows up via WhatsApp/SMS, handles multiple languages)
- Pricing model (pay per answered call only, no monthly fees, 7-day free trial)
- Industries served (dentists, plumbers, electricians, salons, gyms, restaurants, workshops)
- How it works (AI answers, books into calendar, sends confirmations)
- Benefits (never miss a customer, lower costs, better service, 24/7 availability)

Keep responses concise (2-3 sentences max), conversational, and enthusiastic. Use appropriate emojis occasionally. If you don't know something specific, guide them to contact via WhatsApp or book a demo.`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    }

    function addUserMessage(text) {
      const messagesDiv = document.getElementById('chatbot-messages');
      const msgDiv = document.createElement('div');
      msgDiv.style.cssText = 'display: flex; justify-content: flex-end; animation: fadeInUp 0.3s ease;';
      msgDiv.innerHTML = `
        <div style="max-width: 80%; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; padding: 0.75rem 1rem; border-radius: 16px 16px 4px 16px; font-size: 0.9rem; line-height: 1.5; white-space: pre-wrap;">${text}</div>
      `;
      messagesDiv.appendChild(msgDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function addBotMessage(text) {
      const messagesDiv = document.getElementById('chatbot-messages');
      const msgDiv = document.createElement('div');
      msgDiv.style.cssText = 'display: flex; gap: 0.5rem; animation: fadeInUp 0.3s ease;';
      msgDiv.innerHTML = `
        <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">🤖</div>
        <div style="max-width: 80%; background: rgba(255,255,255,0.05); color: #e0e7ff; padding: 0.75rem 1rem; border-radius: 16px 16px 16px 4px; font-size: 0.9rem; line-height: 1.5; white-space: pre-wrap;">${text}</div>
      `;
      messagesDiv.appendChild(msgDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function showTyping() {
      const messagesDiv = document.getElementById('chatbot-messages');
      const typingDiv = document.createElement('div');
      typingDiv.id = 'typing-indicator';
      typingDiv.style.cssText = 'display: flex; gap: 0.5rem; animation: fadeInUp 0.3s ease;';
      typingDiv.innerHTML = `
        <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">🤖</div>
        <div style="background: rgba(255,255,255,0.05); padding: 0.75rem 1rem; border-radius: 16px 16px 16px 4px; display: flex; gap: 0.3rem; align-items: center;">
          <div style="width: 6px; height: 6px; background: rgba(255,255,255,0.4); border-radius: 50%; animation: typing 1.4s infinite;"></div>
          <div style="width: 6px; height: 6px; background: rgba(255,255,255,0.4); border-radius: 50%; animation: typing 1.4s infinite 0.2s;"></div>
          <div style="width: 6px; height: 6px; background: rgba(255,255,255,0.4); border-radius: 50%; animation: typing 1.4s infinite 0.4s;"></div>
        </div>
      `;
      messagesDiv.appendChild(typingDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function hideTyping() {
      const typing = document.getElementById('typing-indicator');
      if (typing) typing.remove();
    }

    // Enter key to send
    document.getElementById('chatbot-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendChatbotMessage();
      }
    });

    // Initialize chatbot status on load
    if (typeof window !== 'undefined') {
      window.addEventListener('DOMContentLoaded', () => {
        updateApiKeyStatus();
      });
    }
