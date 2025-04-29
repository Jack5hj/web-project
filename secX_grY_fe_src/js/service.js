document.addEventListener('DOMContentLoaded', async () => {
    try {
      const resp = await fetch('/api/services');
      if (!resp.ok) throw new Error('Failed to fetch services');
      const services = await resp.json();
  
      const grid = document.querySelector('.services-grid');
      grid.innerHTML = '';  
  
      services.forEach(svc => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
          <img src="${svc.img_url}" alt="${svc.name}">
          <div class="service-info">
            <a href="appointment_date.html?serviceId=${svc.service_id}
              &serviceName=${encodeURIComponent(svc.name)}
              &duration=${svc.duration}
              &price=${svc.price}">
              ${svc.name}
            </a>
            <div class="price">${svc.price} Baht</div>
          </div>
        `.replace(/\s+/g, ' ').trim();
        grid.appendChild(card);
      });
    } catch (err) {
      console.error('err：', err);
    }
  });
  