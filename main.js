document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // SELECCIÓN DE ELEMENTOS DEL DOM
  // ==========================================================================
  const snapContainer = document.getElementById('snapContainer');
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-link');
  const dotLinks = document.querySelectorAll('.dot-link');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const mainHeader = document.getElementById('mainHeader');

  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  const customCursor = document.getElementById('customCursor');

  const portfolioTabs = document.querySelectorAll('.portfolio-tab');
  const portfolioPanes = document.querySelectorAll('.portfolio-pane');
  const portfolioBgs = document.querySelectorAll('.portfolio-background');

  const accordionHeaders = document.querySelectorAll('.accordion-header');
  const accordionItems = document.querySelectorAll('.accordion-item');

  // ==========================================================================
  // CURSOR PERSONALIZADO (Seguimiento líquido de un solo punto)
  // ==========================================================================
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;

    if (customCursor) {
      customCursor.style.left = `${cursorX}px`;
      customCursor.style.top = `${cursorY}px`;
    }

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.addEventListener('mouseleave', () => {
    if (customCursor) customCursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    if (customCursor) customCursor.style.opacity = '1';
  });

  // ==========================================================================
  // MENÚ MÓVIL (Abrir / Cerrar)
  // ==========================================================================
  const toggleMobileMenu = () => {
    mobileNavToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  };

  mobileNavToggle.addEventListener('click', toggleMobileMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNavToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.classList.remove('no-scroll');
    });
  });

  // ==========================================================================
  // NAVEGACIÓN Y SCROLL SUAVE (Soporte para secciones de 150vh)
  // ==========================================================================
  const scrollToSection = (targetId) => {
    const targetSection = document.querySelector(targetId);
    if (targetSection) {
      if (window.innerWidth <= 768) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const allNavLinks = [
    ...navLinks,
    ...dotLinks,
    ...mobileLinks,
    document.getElementById('logoLink'),
    document.getElementById('btnHeroExplore'),
    document.getElementById('btnHeroContact')
  ];

  allNavLinks.forEach(link => {
    if (!link) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      scrollToSection(targetId);
    });
  });

  // ==========================================================================
  // INTERSECTION OBSERVER (Activar secciones y actualizar navegación)
  // ==========================================================================
  const updateNavigation = (index) => {
    const currentId = sections[index]?.id;
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });

    dotLinks.forEach((dot, i) => {
      if (i === index) dot.classList.add('active');
      else dot.classList.remove('active');
    });

    if (index > 0) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
  };

  const observerOptions = {
    root: window.innerWidth <= 768 ? null : snapContainer,
    rootMargin: '0px',
    threshold: 0.3 // Sensibilidad adaptada a secciones más grandes de 150vh
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.getAttribute('data-index'));

        sections.forEach(sec => sec.classList.remove('active'));
        entry.target.classList.add('active');

        updateNavigation(index);
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // ==========================================================================
  // EFECTO DE SCROLL EN DOS ETAPAS (Filtro Liquid Glass & Opacidad)
  // ==========================================================================
  const handleScrollEffects = () => {
    if (window.innerWidth <= 768) return; // Desactivar en móvil para mantener rendimiento

    const vh = window.innerHeight;
    const scrollTop = snapContainer.scrollTop;

    sections.forEach((section, index) => {
      const sectionScrollStart = index * vh * 1.5; // Cada sección mide 150vh (1.5 * vh)
      const scrollInsideSection = scrollTop - sectionScrollStart;

      const glassCard = section.querySelector('.glass-card');
      const overlay = section.querySelector('.background-overlay');

      if (glassCard) {
        if (scrollInsideSection >= 0 && scrollInsideSection <= vh * 0.5) {
          const progress = scrollInsideSection / (vh * 0.5); // Rango de 0 a 1

          // Desvanecer la tarjeta e incorporar un paralaje ascendente sutil
          glassCard.style.opacity = 1 - progress;
          glassCard.style.transform = `translateY(${-progress * 50}px)`;
          glassCard.style.pointerEvents = progress > 0.8 ? 'none' : 'auto';

          // Aclarar el overlay para revelar la imagen con mayor contraste
          if (overlay) {
            overlay.style.background = `linear-gradient(135deg, rgba(5, 8, 7, ${0.4 - progress * 0.25}) 0%, rgba(5, 8, 7, ${0.75 - progress * 0.4}) 100%)`;
          }
        } else if (scrollInsideSection > vh * 0.5) {
          // Totalmente desvanecida
          glassCard.style.opacity = 0;
          glassCard.style.transform = `translateY(-50px)`;
          glassCard.style.pointerEvents = 'none';
          if (overlay) {
            overlay.style.background = `linear-gradient(135deg, rgba(5, 8, 7, 0.15) 0%, rgba(5, 8, 7, 0.35) 100%)`;
          }
        } else {
          // Estado inicial restablecido
          glassCard.style.opacity = 1;
          glassCard.style.transform = `translateY(0)`;
          glassCard.style.pointerEvents = 'auto';
          if (overlay) {
            overlay.style.background = `linear-gradient(135deg, rgba(5, 8, 7, 0.4) 0%, rgba(5, 8, 7, 0.75) 100%)`;
          }
        }
      }
    });
  };

  // En escritorio, cada sección revela primero la información y después la imagen completa.
  if (snapContainer) {
    snapContainer.addEventListener('scroll', handleScrollEffects, { passive: true });
  }

  // ==========================================================================
  // PORTAFOLIO INTERACTIVO (Cambio de Pestañas y Fondos)
  // ==========================================================================
  portfolioTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');

      portfolioTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      portfolioPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === `pane-${target}`) {
          pane.classList.add('active');
        }
      });

      portfolioBgs.forEach(bg => {
        bg.classList.remove('active');
        if (bg.id === `bg-${target}`) {
          bg.classList.add('active');
        }
      });
    });
  });

  // ==========================================================================
  // GALERÍA EN COLLAGE INTERACTIVO & LIGHTBOX MODAL
  // ==========================================================================
  const collageItems = document.querySelectorAll('.collage-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  if (collageItems.length > 0 && lightboxModal && lightboxImg) {
    collageItems.forEach(item => {
      item.addEventListener('click', () => {
        const imgNum = item.getAttribute('data-img');

        // Cargar la imagen en alta resolución en el lightbox
        lightboxImg.src = `images/img-${imgNum}.jpg`;

        // Mostrar el modal y activar la transición
        lightboxModal.style.display = 'flex';
        setTimeout(() => {
          lightboxModal.classList.add('active');
        }, 10);
      });
    });

    const closeLightbox = () => {
      lightboxModal.classList.remove('active');
      setTimeout(() => {
        lightboxModal.style.display = 'none';
        lightboxImg.src = ''; // Vaciar src para evitar parpadeos
      }, 400);
    };

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    lightboxModal.addEventListener('click', (e) => {
      // Cerrar solo si se hace clic en el fondo difuminado, no en la imagen
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });

    // Cerrar al pulsar la tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  // ==========================================================================
  // ACORDEÓN DE SERVICIOS
  // ==========================================================================
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const parentItem = header.parentElement;
      const isActive = parentItem.classList.contains('active');

      accordionItems.forEach(item => {
        item.classList.remove('active');
        item.querySelector('.accordion-content').style.maxHeight = null;
      });

      if (!isActive) {
        parentItem.classList.add('active');
        const content = parentItem.querySelector('.accordion-content');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  const initialActiveContent = document.querySelector('.accordion-item.active .accordion-content');
  if (initialActiveContent) {
    initialActiveContent.style.maxHeight = initialActiveContent.scrollHeight + 'px';
  }

  // Convierte el formulario en una conversación real, sin confirmaciones falsas.
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = document.getElementById('inputName').value.trim();
      const email = document.getElementById('inputEmail').value.trim();
      const company = document.getElementById('inputCompany').value.trim();
      const message = document.getElementById('inputMessage').value.trim();
      const text = `Hola Boskes, soy ${name}${company ? ` de ${company}` : ''}. Mi email es ${email}. Quiero contarles sobre este proyecto: ${message}`;
      window.open(`https://wa.me/573008235309?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    });
  }

});
