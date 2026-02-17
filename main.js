const STORAGE_KEY = 'uluk_site_content_v1';
const LEADS_KEY = 'uluk_leads_v1';

let siteData = null;

async function loadDefaultData() {
  try {
    const response = await fetch('data.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading default data:', error);
    return null;
  }
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Error parsing saved data:', error);
    }
  }
  return null;
}

async function initData() {
  siteData = loadData();

  if (!siteData) {
    siteData = await loadDefaultData();
  }

  if (siteData) {
    renderContent();
  }
}

function renderContent() {
  document.querySelectorAll('[data-content]').forEach(el => {
    const path = el.getAttribute('data-content');
    const value = getNestedValue(siteData, path);

    if (value) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = value;
      } else if (el.tagName === 'A' && el.href) {
        const hrefBase = el.href.split(':')[0];
        if (hrefBase === 'tel' || hrefBase === 'mailto') {
          el.href = `${hrefBase}:${value}`;
        }
        el.textContent = value;
      } else {
        el.textContent = value;
      }
    }
  });

  if (document.getElementById('servicesGrid')) {
    renderServices();
  }

  if (document.getElementById('servicesGridFull')) {
    renderServicesFull();
  }

  if (document.getElementById('testimonialsGrid')) {
    renderTestimonials();
  }

  if (document.getElementById('faqList')) {
    renderFAQ();
  }

  if (document.getElementById('casesList')) {
    renderCases();
  }
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function renderServices() {
  const container = document.getElementById('servicesGrid');
  if (!container || !siteData?.services) return;

  const services = siteData.services.slice(0, 4);
  container.innerHTML = services.map(service => `
    <div class="service-card">
      <div class="service-icon">${service.icon}</div>
      <h3>${service.title}</h3>
      <p>${service.desc}</p>
    </div>
  `).join('');
}

function renderServicesFull() {
  const container = document.getElementById('servicesGridFull');
  if (!container || !siteData?.services) return;

  container.innerHTML = siteData.services.map(service => `
    <div class="service-card">
      <div class="service-icon">${service.icon}</div>
      <h3>${service.title}</h3>
      <p>${service.desc}</p>
    </div>
  `).join('');
}

function renderTestimonials() {
  const container = document.getElementById('testimonialsGrid');
  if (!container || !siteData?.testimonials) return;

  container.innerHTML = siteData.testimonials.map(testimonial => `
    <div class="testimonial-card">
      <div class="testimonial-name">${testimonial.name}</div>
      <div class="testimonial-text">${testimonial.text}</div>
    </div>
  `).join('');
}

function renderFAQ() {
  const container = document.getElementById('faqList');
  if (!container || !siteData?.faq) return;

  container.innerHTML = siteData.faq.map((item, index) => `
    <div class="faq-item" data-index="${index}">
      <div class="faq-question">
        <span>${item.q}</span>
        <span class="faq-toggle">+</span>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-content">${item.a}</div>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', function() {
      const item = this.parentElement;
      const isActive = item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

function renderCases() {
  const container = document.getElementById('casesList');
  if (!container || !siteData?.cases) return;

  container.innerHTML = siteData.cases.map(caseItem => `
    <div class="case-card">
      <h3>${caseItem.title}</h3>
      <div class="case-section">
        <div class="case-label">Задача:</div>
        <div class="case-text">${caseItem.task}</div>
      </div>
      <div class="case-section">
        <div class="case-label">Решение:</div>
        <div class="case-text">${caseItem.solution}</div>
      </div>
      <div class="case-section">
        <div class="case-label">Результат:</div>
        <div class="case-text">${caseItem.result}</div>
      </div>
    </div>
  `).join('');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function saveLead(leadData) {
  const leads = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');

  const lead = {
    ...leadData,
    id: Date.now(),
    date: new Date().toISOString()
  };

  leads.push(lead);
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));

  return lead;
}

function setupForms() {
  const forms = document.querySelectorAll('.lead-form');

  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const formData = new FormData(this);
      const leadData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        service: formData.get('service'),
        channel: formData.get('channel'),
        comment: formData.get('comment') || ''
      };

      saveLead(leadData);
      showToast('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');

      this.reset();
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await initData();
  setupForms();
});
