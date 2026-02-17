const STORAGE_KEY = 'uluk_site_content_v1';
const LEADS_KEY = 'uluk_leads_v1';
const AUTH_KEY = 'uluk_admin_ok';
const DEFAULT_PASSWORD = 'uluk123';

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

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  siteData = data;
}

function checkAuth() {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

function setAuth(value) {
  sessionStorage.setItem(AUTH_KEY, value ? 'true' : 'false');
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

async function init() {
  if (checkAuth()) {
    showAdminPanel();
  } else {
    showLoginScreen();
  }
}

function showLoginScreen() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminPanel').style.display = 'none';

  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const password = document.getElementById('passwordInput').value;

    if (password === DEFAULT_PASSWORD) {
      setAuth(true);
      showAdminPanel();
    } else {
      showToast('Неверный пароль');
    }
  });
}

async function showAdminPanel() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';

  siteData = loadData();
  if (!siteData) {
    siteData = await loadDefaultData();
  }

  loadContentToForm();
  setupTabs();
  setupActions();
  loadLeads();
}

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      this.classList.add('active');
      const targetTab = tabName === 'content' ? document.getElementById('contentTab') : document.getElementById('leadsTab');
      if (targetTab) {
        targetTab.classList.add('active');
      }
    });
  });
}

function loadContentToForm() {
  if (!siteData) return;

  document.getElementById('heroTagline').value = siteData.hero?.tagline || '';
  document.getElementById('heroSubtitle').value = siteData.hero?.subtitle || '';
  document.getElementById('heroCta').value = siteData.hero?.cta || '';

  document.getElementById('aboutHeadline').value = siteData.about?.headline || '';
  document.getElementById('aboutText').value = siteData.about?.text || '';

  document.getElementById('companyName').value = siteData.company?.name || '';
  document.getElementById('companyCity').value = siteData.company?.city || '';
  document.getElementById('companyAddress').value = siteData.company?.address || '';
  document.getElementById('companyPhone').value = siteData.company?.phone || '';
  document.getElementById('companyWhatsapp').value = siteData.company?.whatsapp || '';
  document.getElementById('companyTelegram').value = siteData.company?.telegram || '';
  document.getElementById('companyEmail').value = siteData.company?.email || '';

  renderServicesAdmin();
  renderCasesAdmin();
  renderTestimonialsAdmin();
  renderFaqAdmin();
}

function renderServicesAdmin() {
  const container = document.getElementById('servicesAdmin');
  if (!container) return;

  container.innerHTML = (siteData.services || []).map((service, index) => `
    <div class="admin-item">
      <div class="admin-item-header">
        <div class="admin-item-title">${service.icon} ${service.title}</div>
        <div class="admin-item-actions">
          <button class="btn-secondary" onclick="editService(${index})">Редактировать</button>
          <button class="btn-danger" onclick="deleteService(${index})">Удалить</button>
        </div>
      </div>
    </div>
  `).join('');

  document.getElementById('addServiceBtn').onclick = () => addService();
}

function addService() {
  const icon = prompt('Emoji-иконка:', '🚀');
  const title = prompt('Название услуги:');
  const desc = prompt('Описание:');

  if (title && desc) {
    if (!siteData.services) siteData.services = [];
    siteData.services.push({ icon: icon || '🚀', title, desc });
    renderServicesAdmin();
  }
}

function editService(index) {
  const service = siteData.services[index];
  const icon = prompt('Emoji-иконка:', service.icon);
  const title = prompt('Название услуги:', service.title);
  const desc = prompt('Описание:', service.desc);

  if (title && desc) {
    siteData.services[index] = { icon: icon || service.icon, title, desc };
    renderServicesAdmin();
  }
}

function deleteService(index) {
  if (confirm('Удалить эту услугу?')) {
    siteData.services.splice(index, 1);
    renderServicesAdmin();
  }
}

function renderCasesAdmin() {
  const container = document.getElementById('casesAdmin');
  if (!container) return;

  container.innerHTML = (siteData.cases || []).map((caseItem, index) => `
    <div class="admin-item">
      <div class="admin-item-header">
        <div class="admin-item-title">${caseItem.title}</div>
        <div class="admin-item-actions">
          <button class="btn-secondary" onclick="editCase(${index})">Редактировать</button>
          <button class="btn-danger" onclick="deleteCase(${index})">Удалить</button>
        </div>
      </div>
    </div>
  `).join('');

  document.getElementById('addCaseBtn').onclick = () => addCase();
}

function addCase() {
  const title = prompt('Название кейса:');
  const task = prompt('Задача:');
  const solution = prompt('Решение:');
  const result = prompt('Результат:');

  if (title && task && solution && result) {
    if (!siteData.cases) siteData.cases = [];
    siteData.cases.push({ title, task, solution, result });
    renderCasesAdmin();
  }
}

function editCase(index) {
  const caseItem = siteData.cases[index];
  const title = prompt('Название кейса:', caseItem.title);
  const task = prompt('Задача:', caseItem.task);
  const solution = prompt('Решение:', caseItem.solution);
  const result = prompt('Результат:', caseItem.result);

  if (title && task && solution && result) {
    siteData.cases[index] = { title, task, solution, result };
    renderCasesAdmin();
  }
}

function deleteCase(index) {
  if (confirm('Удалить этот кейс?')) {
    siteData.cases.splice(index, 1);
    renderCasesAdmin();
  }
}

function renderTestimonialsAdmin() {
  const container = document.getElementById('testimonialsAdmin');
  if (!container) return;

  container.innerHTML = (siteData.testimonials || []).map((testimonial, index) => `
    <div class="admin-item">
      <div class="admin-item-header">
        <div class="admin-item-title">${testimonial.name}</div>
        <div class="admin-item-actions">
          <button class="btn-secondary" onclick="editTestimonial(${index})">Редактировать</button>
          <button class="btn-danger" onclick="deleteTestimonial(${index})">Удалить</button>
        </div>
      </div>
    </div>
  `).join('');

  document.getElementById('addTestimonialBtn').onclick = () => addTestimonial();
}

function addTestimonial() {
  const name = prompt('Имя клиента:');
  const text = prompt('Текст отзыва:');

  if (name && text) {
    if (!siteData.testimonials) siteData.testimonials = [];
    siteData.testimonials.push({ name, text });
    renderTestimonialsAdmin();
  }
}

function editTestimonial(index) {
  const testimonial = siteData.testimonials[index];
  const name = prompt('Имя клиента:', testimonial.name);
  const text = prompt('Текст отзыва:', testimonial.text);

  if (name && text) {
    siteData.testimonials[index] = { name, text };
    renderTestimonialsAdmin();
  }
}

function deleteTestimonial(index) {
  if (confirm('Удалить этот отзыв?')) {
    siteData.testimonials.splice(index, 1);
    renderTestimonialsAdmin();
  }
}

function renderFaqAdmin() {
  const container = document.getElementById('faqAdmin');
  if (!container) return;

  container.innerHTML = (siteData.faq || []).map((item, index) => `
    <div class="admin-item">
      <div class="admin-item-header">
        <div class="admin-item-title">${item.q}</div>
        <div class="admin-item-actions">
          <button class="btn-secondary" onclick="editFaq(${index})">Редактировать</button>
          <button class="btn-danger" onclick="deleteFaq(${index})">Удалить</button>
        </div>
      </div>
    </div>
  `).join('');

  document.getElementById('addFaqBtn').onclick = () => addFaq();
}

function addFaq() {
  const q = prompt('Вопрос:');
  const a = prompt('Ответ:');

  if (q && a) {
    if (!siteData.faq) siteData.faq = [];
    siteData.faq.push({ q, a });
    renderFaqAdmin();
  }
}

function editFaq(index) {
  const item = siteData.faq[index];
  const q = prompt('Вопрос:', item.q);
  const a = prompt('Ответ:', item.a);

  if (q && a) {
    siteData.faq[index] = { q, a };
    renderFaqAdmin();
  }
}

function deleteFaq(index) {
  if (confirm('Удалить этот вопрос?')) {
    siteData.faq.splice(index, 1);
    renderFaqAdmin();
  }
}

function setupActions() {
  document.getElementById('saveBtn').onclick = () => {
    siteData.hero = {
      tagline: document.getElementById('heroTagline').value,
      subtitle: document.getElementById('heroSubtitle').value,
      cta: document.getElementById('heroCta').value
    };

    siteData.about = {
      headline: document.getElementById('aboutHeadline').value,
      text: document.getElementById('aboutText').value
    };

    siteData.company = {
      name: document.getElementById('companyName').value,
      city: document.getElementById('companyCity').value,
      address: document.getElementById('companyAddress').value,
      phone: document.getElementById('companyPhone').value,
      whatsapp: document.getElementById('companyWhatsapp').value,
      telegram: document.getElementById('companyTelegram').value,
      email: document.getElementById('companyEmail').value
    };

    saveData(siteData);
    showToast('Изменения сохранены!');
  };

  document.getElementById('resetBtn').onclick = async () => {
    if (confirm('Сбросить все данные к значениям по умолчанию? Это действие нельзя отменить.')) {
      localStorage.removeItem(STORAGE_KEY);
      siteData = await loadDefaultData();
      loadContentToForm();
      showToast('Данные сброшены к default');
    }
  };

  document.getElementById('exportBtn').onclick = () => {
    const dataStr = JSON.stringify(siteData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content.export.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON экспортирован');
  };

  document.getElementById('importBtn').onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          siteData = importedData;
          saveData(siteData);
          loadContentToForm();
          showToast('JSON импортирован');
        } catch (error) {
          showToast('Ошибка при импорте JSON');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  document.getElementById('showJsonBtn').onclick = () => {
    const jsonWindow = window.open('', '_blank');
    jsonWindow.document.write(`
      <html>
        <head>
          <title>JSON Content</title>
          <style>
            body { background: #1e1e1e; color: #d4d4d4; font-family: monospace; padding: 20px; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <pre>${JSON.stringify(siteData, null, 2)}</pre>
        </body>
      </html>
    `);
  };

  document.getElementById('logoutBtn').onclick = () => {
    setAuth(false);
    location.reload();
  };
}

function loadLeads() {
  const leads = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
  renderLeads(leads);

  document.getElementById('leadsCount').textContent = leads.length;

  document.getElementById('exportLeadsBtn').onclick = () => exportLeads(leads);
  document.getElementById('clearLeadsBtn').onclick = () => clearAllLeads();
}

function renderLeads(leads) {
  const container = document.getElementById('leadsList');
  if (!container) return;

  if (leads.length === 0) {
    container.innerHTML = '<p style="color: var(--color-text-muted); text-align: center; padding: 40px;">Заявок пока нет</p>';
    return;
  }

  const sortedLeads = [...leads].reverse();

  container.innerHTML = sortedLeads.map(lead => {
    const date = new Date(lead.date);
    const dateStr = date.toLocaleString('ru-RU');

    return `
      <div class="lead-card">
        <div class="lead-card-header">
          <div class="lead-info">
            <div class="lead-name">${lead.name}</div>
            <div class="lead-date">${dateStr}</div>
          </div>
          <button class="btn-danger" onclick="deleteLead(${lead.id})">Удалить</button>
        </div>
        <div class="lead-details">
          <div class="lead-field">
            <div class="lead-field-label">Телефон</div>
            <div class="lead-field-value">${lead.phone}</div>
          </div>
          <div class="lead-field">
            <div class="lead-field-label">Услуга</div>
            <div class="lead-field-value">${lead.service}</div>
          </div>
          <div class="lead-field">
            <div class="lead-field-label">Канал связи</div>
            <div class="lead-field-value">${lead.channel}</div>
          </div>
        </div>
        ${lead.comment ? `
          <div class="lead-comment">
            <div class="lead-comment-label">Комментарий:</div>
            <div class="lead-comment-text">${lead.comment}</div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function deleteLead(id) {
  if (confirm('Удалить эту заявку?')) {
    let leads = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
    leads = leads.filter(lead => lead.id !== id);
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    loadLeads();
    showToast('Заявка удалена');
  }
}

function exportLeads(leads) {
  const dataStr = JSON.stringify(leads, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leads.export.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Заявки экспортированы');
}

function clearAllLeads() {
  if (confirm('Удалить все заявки? Это действие нельзя отменить.')) {
    localStorage.removeItem(LEADS_KEY);
    loadLeads();
    showToast('Все заявки удалены');
  }
}

document.addEventListener('DOMContentLoaded', init);
