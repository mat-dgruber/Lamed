// File: public/script.js

window.addEventListener('DOMContentLoaded', () => {

  // Active navigation link highlighting

  const currentLocation = window.location.pathname;

  const navLinks = document.querySelectorAll('.main-nav a');



  navLinks.forEach(link => {

    // Normalize paths to ensure comparison works even with trailing slashes or .html extensions

    const linkPath = new URL(link.href).pathname;



    // Handle index.html specifically as it might be represented as '/' or '/index.html'

    if (linkPath === '/' && (currentLocation === '/index.html' || currentLocation === '/')) {

        link.classList.add('active');

    } else if (linkPath !== '/' && currentLocation.includes(linkPath)) {

        // For other links, check if the current location includes the link's path

        // This handles cases where link.href might be absolute and currentLocation relative

        link.classList.add('active');

    }

  });



  // Mobile Navigation Toggle

  const menuToggle = document.querySelector('.menu-toggle');

  const mainNav = document.querySelector('.main-nav');



  if (menuToggle && mainNav) {

    menuToggle.addEventListener('click', () => {

      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;

      menuToggle.setAttribute('aria-expanded', !isExpanded);

      mainNav.classList.toggle('active');

    });



    // Close menu when a link is clicked (optional, good for SPA-like behavior or long pages)

    const navLinksMobile = mainNav.querySelectorAll('a');

    navLinksMobile.forEach(link => {

      link.addEventListener('click', () => {

        if (mainNav.classList.contains('active')) {

          menuToggle.setAttribute('aria-expanded', 'false');

          mainNav.classList.remove('active');

        }

      });

    });



    // Close menu if clicked outside (optional)

    document.addEventListener('click', (event) => {

      if (mainNav.classList.contains('active') && !mainNav.contains(event.target) && !menuToggle.contains(event.target)) {

        menuToggle.setAttribute('aria-expanded', 'false');

        mainNav.classList.remove('active');

      }

    });

  }

  // End Mobile Navigation Toggle



  // --- INÍCIO: LÓGICA PARA CARREGAR ARTIGO EM DESTAQUE NA INDEX ---

  // Verifica se a página atual é a index ("/" ou termina com "index.html")

  const isIndexPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html');








  if (isIndexPage) {

    // Carregar Artigo em Destaque na Index Page

    const featuredArticleImage = document.getElementById('featured-article-image');

    const featuredArticleTitleLink = document.getElementById('featured-article-title-link');

    const featuredArticleTitleSpan = document.getElementById('featured-article-title');

    const featuredArticleSummaryP = document.getElementById('featured-article-summary');

    const featuredArticleReadmoreLink = document.getElementById('featured-article-readmore');



    // Guardar conteúdo original para fallback

    if(featuredArticleTitleSpan) featuredArticleTitleSpan.dataset.originalTitle = featuredArticleTitleSpan.textContent;

    if(featuredArticleSummaryP) featuredArticleSummaryP.dataset.originalSummary = featuredArticleSummaryP.textContent;

    if(featuredArticleImage) featuredArticleImage.dataset.originalSrc = featuredArticleImage.src;

    if(featuredArticleTitleLink) featuredArticleTitleLink.dataset.originalHref = featuredArticleTitleLink.href;

    if(featuredArticleReadmoreLink) featuredArticleReadmoreLink.dataset.originalHref = featuredArticleReadmoreLink.href;





    fetch('articles.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao carregar o arquivo: ${response.statusText}`);
        }
        return response.json();
    })
    .then(articles => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const publishedArticles = articles.filter(article => {
            if (!article.dateISO) return false;
            const articleDate = new Date(article.dateISO);
            articleDate.setHours(0, 0, 0, 0);
            return articleDate <= today;
        });

        if (publishedArticles.length > 0) {

          const latestArticle = publishedArticles[0];



          if (featuredArticleTitleLink) featuredArticleTitleLink.href = latestArticle.link;

          if (featuredArticleTitleSpan) featuredArticleTitleSpan.textContent = latestArticle.title;

          if (featuredArticleSummaryP) featuredArticleSummaryP.textContent = latestArticle.description;

          if (featuredArticleReadmoreLink) featuredArticleReadmoreLink.href = latestArticle.link;

          if (featuredArticleImage) {

            featuredArticleImage.src = latestArticle.bannerImage;

            featuredArticleImage.alt = latestArticle.title;

          }

        } else {

          console.warn('Nenhum artigo publicado encontrado para a página inicial.');

          if(featuredArticleTitleSpan) featuredArticleTitleSpan.textContent = featuredArticleTitleSpan.dataset.originalTitle || 'Artigo não encontrado';

          if(featuredArticleSummaryP) featuredArticleSummaryP.textContent = featuredArticleSummaryP.dataset.originalSummary || 'Não foi possível carregar o resumo.';

          if(featuredArticleImage) {

            featuredArticleImage.src = featuredArticleImage.dataset.originalSrc || 'Assets/placeholder-article-thumb.jpg';

            featuredArticleImage.alt = 'Artigo em destaque';

          }

          if(featuredArticleTitleLink) featuredArticleTitleLink.href = featuredArticleTitleLink.dataset.originalHref || '#';

          if(featuredArticleReadmoreLink) featuredArticleReadmoreLink.href = featuredArticleReadmoreLink.dataset.originalHref || '#';

        }

      })

      .catch(error => {

        console.error('Erro ao carregar e processar artigos para index.html:', error);

        if(featuredArticleTitleSpan) featuredArticleTitleSpan.textContent = featuredArticleTitleSpan.dataset.originalTitle || 'Erro ao carregar';

        if(featuredArticleSummaryP) featuredArticleSummaryP.textContent = featuredArticleSummaryP.dataset.originalSummary || 'Não foi possível carregar o resumo.';

        if(featuredArticleImage) {

            featuredArticleImage.src = featuredArticleImage.dataset.originalSrc || 'Assets/placeholder-article-thumb.jpg';

            featuredArticleImage.alt = 'Placeholder devido a erro';

        }

        if(featuredArticleTitleLink) featuredArticleTitleLink.href = featuredArticleTitleLink.dataset.originalHref || '#';

        if(featuredArticleReadmoreLink) featuredArticleReadmoreLink.href = featuredArticleReadmoreLink.dataset.originalHref || '#';

      });

  }

  // --- FIM: LÓGICA PARA CARREGAR ARTIGO EM DESTAQUE NA INDEX ---



  // Funcionalidade do botão "Voltar ao Topo"

  const backToTopButton = document.getElementById('back-to-top');



  if (backToTopButton) {

      window.addEventListener('scroll', () => {

          if (window.pageYOffset > 300) {

              if (backToTopButton.style.display !== 'flex') { // Check current display to prevent reflow if already visible

                  backToTopButton.style.display = 'flex'; // Use flex as per new CSS

                  // Force a reflow before adding opacity class for transition to work

                  void backToTopButton.offsetWidth;

                  backToTopButton.style.opacity = '1';

                  backToTopButton.style.visibility = 'visible';

              }

          } else {  

              if (backToTopButton.style.opacity === '1') { // Check current opacity to prevent hiding if already hidden

                  backToTopButton.style.opacity = '0';

                  backToTopButton.style.visibility = 'hidden';

                  // Wait for transition to finish before setting display to none

                  setTimeout(() => {

                      if (window.pageYOffset <= 300) { // Re-check condition

                          backToTopButton.style.display = 'none';

                      }

                  }, 500); // Match CSS transition duration for opacity

              }

          }

      });



      backToTopButton.addEventListener('click', () => {

          window.scrollTo({

              top: 0,

              behavior: 'smooth'

          });

      });



      // Initial check

      if (window.pageYOffset > 300) {

          backToTopButton.style.display = 'flex';

          backToTopButton.style.opacity = '1';

          backToTopButton.style.visibility = 'visible';

      } else {

          backToTopButton.style.display = 'none';

          backToTopButton.style.opacity = '0';

          backToTopButton.style.visibility = 'hidden';

      }

  }



  // REMOVED: Carrossel da Equipe na página sobre.html (JavaScript logic)



  // --- INÍCIO: LÓGICA PARA TÍTULOS DE VÍDEOS NA PÁGINA videos.html ---

  const isVideosPageForTitles = window.location.pathname.endsWith('videos.html');



  if (isVideosPageForTitles) {

    fetchYouTubeVideoTitles();

  }



  async function fetchYouTubeVideoTitles() {

    const videoTitlePlaceholders = document.querySelectorAll('.video-title-placeholder');

    if (!videoTitlePlaceholders.length) return;



    console.log(`Found ${videoTitlePlaceholders.length} video title placeholders.`);



    videoTitlePlaceholders.forEach(async (placeholder) => {

      const videoId = placeholder.dataset.videoId;

      if (!videoId || videoId.startsWith('VIDEO_ID_')) {

        placeholder.textContent = 'Vídeo não especificado';

        return;

      }



      const oEmbedUrl = `https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`;



      try {

        // Attempt to fetch title using oEmbed.

        // NOTE: This might be blocked by CORS depending on the browser and YouTube's current policies.

        // A server-side proxy would be a more robust solution.

        const response = await fetch(oEmbedUrl); // Removed mode: 'no-cors' to try and read the response



        if (!response.ok) {

          // If response is not OK, but not a network error (e.g. 404, 403)

          console.warn(`oEmbed request for ${videoId} failed with status: ${response.status}`);

          // Fallback for oEmbed failure (e.g., video not found, or API error)

          const videoItem = placeholder.closest('.video-item');

          const iframe = videoItem ? videoItem.querySelector('iframe') : null;

          const iframeTitle = iframe ? iframe.title : `Vídeo ${videoId}`; // Fallback to iframe title or generic

          placeholder.textContent = iframeTitle || `Título para ${videoId}`;

          return;

        }



        const data = await response.json();

        if (data && data.title) {

          placeholder.textContent = data.title;

          console.log(`Title for ${videoId}: ${data.title}`);

        } else {

          // Fallback if title is not in oEmbed response

          const videoItem = placeholder.closest('.video-item');

          const iframe = videoItem ? videoItem.querySelector('iframe') : null;

          const iframeTitle = iframe ? iframe.title : `Título Indisponível`;

          placeholder.textContent = iframeTitle || `Título para ${videoId}`;

        }

      } catch (error) {

        // Network error or CORS issue

        console.error(`Error fetching oEmbed data for video ${videoId}:`, error);

        // Fallback for network/CORS errors

        const videoItem = placeholder.closest('.video-item');

        const iframe = videoItem ? videoItem.querySelector('iframe') : null;

        // Use the title attribute from the iframe as a fallback if available

        const iframeTitle = iframe ? iframe.getAttribute('title') : '';

        if (iframeTitle && iframeTitle !== 'YouTube video player' && iframeTitle !== `Vídeo do YouTube ${videoId.split('_').pop()}`) {

            placeholder.textContent = iframeTitle;

        } else {

            // Generic fallback if iframe title is not useful

            placeholder.textContent = `Título do vídeo ${videoId}`;

        }

        // Add a comment for the user about API key integration

        if (!placeholder.textContent.includes("Título do vídeo")) { // Avoid duplicate comments

            const comment = document.createComment(" For robust title fetching, integrate with YouTube Data API v3 using an API key. ");

            placeholder.parentNode.insertBefore(comment, placeholder.nextSibling);

        }

      }

    });

  }

  // --- FIM: LÓGICA PARA TÍTULOS DE VÍDEOS ---



  // --- INÍCIO: NOVA LÓGICA PARA PÁGINA DE ARTIGOS (artigos.html) ---
  const isArtigosPage = window.location.pathname.endsWith('artigos.html');

  if (isArtigosPage) {
    const destaqueSection = document.getElementById('destaque');
    const listaArtigosUl = document.getElementById('articles-list-ul');
    const searchInput = document.getElementById('search-input');
    let allArticles = []; // Cache para todos os artigos

    // Função para renderizar a lista de artigos
    const renderArticles = (articlesToRender) => {
      listaArtigosUl.innerHTML = ''; // Limpa a lista
      if (articlesToRender.length === 0) {
        listaArtigosUl.innerHTML = '<li>Nenhum artigo encontrado.</li>';
        return;
      }
      articlesToRender.forEach(articleData => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = articleData.link;

        const strongTitle = document.createElement('strong');
        strongTitle.textContent = articleData.title;
        link.appendChild(strongTitle);

        const metaSpan = document.createElement('span');
        metaSpan.className = 'article-list-item-meta';
        metaSpan.textContent = `Por: ${articleData.author} - Publicado em: ${articleData.displayDate}`;
        link.appendChild(metaSpan);

        listItem.appendChild(link);
        listaArtigosUl.appendChild(listItem);
      });
    };

    // Função para filtrar artigos
    const filterArticles = () => {
      const searchTerm = searchInput.value.toLowerCase().trim();
      if (!searchTerm) {
        renderArticles(allArticles); // Mostra todos se a busca estiver vazia
        return;
      }
      const filteredArticles = allArticles.filter(article => {
        const searchIn = `${article.title} ${article.description} ${article.author} ${article.tags ? article.tags.join(' ') : ''}`.toLowerCase();
        return searchIn.includes(searchTerm);
      });
      renderArticles(filteredArticles);
    };

    // Event listener para o campo de busca
    if (searchInput) {
      searchInput.addEventListener('input', filterArticles);
    }

    // Carrega os dados do articles.json
    fetch('articles.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro ao carregar o arquivo: ${response.statusText}`);
        }
        return response.json();
      })
      .then(articles => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const publishedArticles = articles.filter(article => {
            if (!article.dateISO) return false;
            const articleDate = new Date(article.dateISO);
            articleDate.setHours(0, 0, 0, 0);
            return articleDate <= today;
        });

        allArticles = publishedArticles; // Armazena todos os artigos publicados no cache

        // Popula o artigo em destaque
        const destaqueArticleContainer = destaqueSection ? destaqueSection.querySelector('article') : null;
        if (destaqueArticleContainer && allArticles.length > 0) {
          const maisRecente = allArticles[0];
          destaqueArticleContainer.innerHTML = `
            <div class="last-article">
              <div class="article-banner-image">
                <img src="${maisRecente.bannerImage}" alt="Banner do Artigo ${maisRecente.title}">
              </div>
              <h3><a href="${maisRecente.link}">${maisRecente.title}</a></h3>
              <p>${maisRecente.description}</p>
            </div>
          `;
        } else if (destaqueArticleContainer) {
          destaqueArticleContainer.innerHTML = '<p>Nenhum artigo em destaque disponível.</p>';
        }

        // Renderiza a lista inicial de artigos
        renderArticles(allArticles);
      })
      .catch(error => {
        console.error('Erro ao carregar e processar artigos para artigos.html:', error);
        if (destaqueSection) {
          const container = destaqueSection.querySelector('article') || destaqueSection;
          container.innerHTML = '<p>Erro ao carregar artigo em destaque.</p>';
        }
        if (listaArtigosUl) {
          listaArtigosUl.innerHTML = '<li>Erro ao carregar artigos.</li>';
        }
      });
  }
  // --- FIM: NOVA LÓGICA PARA PÁGINA DE ARTIGOS (artigos.html) ---



  // --- INÍCIO: LÓGICA PARA CARREGAR VÍDEOS DO ARQUIVO LOCAL ---



// Função que exibe os vídeos na página (pode ser a sua função existente)

function displayYouTubeVideos(videos, container) {

  if (!container) return;

  container.innerHTML = '';



  if (!videos || videos.length === 0) {

    container.innerHTML = '<p style="text-align: center;">Não foram encontrados vídeos para exibir.</p>';

    return;

  }



  videos.forEach((video, index) => {

    const videoId = video.id.videoId;

    const title = video.snippet.title;

    const videoItemDiv = document.createElement('div');

    videoItemDiv.classList.add('video-item');

    if (index === 0) {

      videoItemDiv.classList.add('video-item-highlighted');

    }

    videoItemDiv.innerHTML = `

      <iframe

        src="https://www.youtube-nocookie.com/embed/${videoId}"

        title="${title}"

        frameborder="0"

        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"

        allowfullscreen>

      </iframe>

      <p>${title}</p>

    `;

    container.appendChild(videoItemDiv);

  });

}



// Lógica específica para a página de VÍDEOS, agora lendo o JSON

const isVideosPageForYouTubeAPI = window.location.pathname.endsWith('videos.html');

if (isVideosPageForYouTubeAPI) {

  const videosContainer = document.getElementById('youtube-videos-container');

  if (videosContainer) {

    videosContainer.innerHTML = '<p style="text-align: center;">Carregando vídeos...</p>';



    fetch('videos.json') // Lê o arquivo local gerado pelo robô

      .then(response => {

        if (!response.ok) throw new Error(`Erro ao carregar o arquivo: ${response.statusText}`);

        return response.json();

      })

      .then(videos => {

        displayYouTubeVideos(videos, videosContainer);

      })

      .catch(error => {

        console.error('Falha ao carregar vídeos do arquivo local:', error);

        videosContainer.innerHTML = '<p style="color: red; text-align: center;">Não foi possível carregar a galeria de vídeos.</p>';

      });

  }

}

// --- FIM: LÓGICA PARA CARREGAR VÍDEOS DO ARQUIVO LOCAL ---





  // --- AJUSTE NA LÓGICA DE CARREGAMENTO DE VÍDEO EM DESTAQUE NA INDEX.HTML ---

if (isIndexPage) {

  const featuredVideoIframe = document.getElementById('featured-video-iframe');



  if (featuredVideoIframe) {

    // 1. Busca o mesmo arquivo local que a página de vídeos usa.

    fetch('videos.json')

      .then(response => {

        if (!response.ok) {

          throw new Error('Não foi possível carregar videos.json');

        }

        return response.json();

      })

      .then(videos => {

        // 2. Pega apenas o primeiro vídeo da lista (o mais recente).

        if (videos && videos.length > 0) {

          const latestVideo = videos[0];

          const videoId = latestVideo.id.videoId;

          // 3. Atualiza o 'src' do iframe com o ID do vídeo mais recente.

          featuredVideoIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`;

        } else {

          console.warn('Nenhum vídeo encontrado no videos.json para destacar na index.html.');

        }

      })

      .catch(error => {

        console.error('Erro ao carregar vídeo em destaque para index.html a partir do JSON:', error);

      });

  }

}

// --- FIM AJUSTE INDEX.HTML ---



  // --- INÍCIO: LÓGICA DO CARROSSEL DA EQUIPE (SOBRE.HTML) ---

  const isSobrePage = window.location.pathname.endsWith('sobre.html');

  if (isSobrePage) {

    const teamGrid = document.querySelector('.team-grid');

    const prevButton = document.getElementById('team-carousel-prev');

    const nextButton = document.getElementById('team-carousel-next');



    if (teamGrid && prevButton && nextButton) {

      const cardScrollAmount = () => {

        const firstCard = teamGrid.querySelector('.team-member-card');

        if (firstCard) {

          // Usar a largura do card mais o gap. O gap foi definido como 15px no CSS.

          // getComputedStyle pode ser usado para pegar o gap exato se ele variar.

          const cardStyle = getComputedStyle(firstCard);

          const cardWidth = firstCard.offsetWidth;

          // O 'gap' no flex container é aplicado entre os itens.

          // Para scrollBy, precisamos da largura do card + o gap.

          // Se o gap não for consistente ou difícil de obter, uma aproximação pode ser usada

          // ou um valor fixo se a largura dos cards for consistente.

          // Vamos assumir que o gap de 15px é o principal espaçador.

          const gap = parseFloat(getComputedStyle(teamGrid).gap) || 15; // Pega o gap do container ou usa 15

          return cardWidth + gap;

        }

        return 300; // Fallback

      };



      prevButton.addEventListener('click', () => {

        const amount = cardScrollAmount();

        // Verifica se está no início (ou muito próximo)

        if (teamGrid.scrollLeft < amount / 2) { // Usar uma tolerância, como metade do card

          // Se no início, rolar para o fim

          teamGrid.scrollTo({ left: teamGrid.scrollWidth, behavior: 'smooth' });

        } else {

          teamGrid.scrollBy({ left: -amount, behavior: 'smooth' });

        }

      });



      nextButton.addEventListener('click', () => {

        const amount = cardScrollAmount();

        // Verifica se está no fim (ou muito próximo)

        // Tolerância: se o espaço restante for menor que metade de um card, consideramos que está no fim.

        if (teamGrid.scrollLeft + teamGrid.clientWidth + (amount / 2) >= teamGrid.scrollWidth) {

          // Se no fim, rolar para o início

          teamGrid.scrollTo({ left: 0, behavior: 'smooth' });

        } else {

          teamGrid.scrollBy({ left: amount, behavior: 'smooth' });

        }

      });



      // Opcional: Esconder/mostrar botões se no início/fim (simplificado)

      // Para uma lógica mais robusta de habilitar/desabilitar botões,

      // seria necessário verificar scrollLeft, scrollWidth, clientWidth após cada rolagem.

      // Por simplicidade, os botões permanecerão sempre ativos.

      // Se quiser adicionar essa lógica:

      // teamGrid.addEventListener('scroll', () => {

      //   prevButton.disabled = teamGrid.scrollLeft < 10; // Pequena tolerância

      //   nextButton.disabled = teamGrid.scrollLeft >= (teamGrid.scrollWidth - teamGrid.clientWidth - 10);

      // });

      // // Chamar uma vez para estado inicial

      // if (teamGrid.scrollWidth <= teamGrid.clientWidth) { // Se não houver scroll

      //     prevButton.style.display = 'none';

      //     nextButton.style.display = 'none';

      //     document.querySelector('.team-carousel-controls').style.display = 'none';

      // }

    }

  }

  // --- FIM: LÓGICA DO CARROSSEL DA EQUIPE ---



  // --- INÍCIO: LÓGICA PARA "LER MAIS" NA SEÇÃO NOSSA HISTÓRIA (SOBRE.HTML) ---

  if (isSobrePage) { // isSobrePage já definido

    const expandableContent = document.querySelector('#history .expandable-content');

    const readMoreButton = document.getElementById('read-more-history');



    if (expandableContent && readMoreButton) {

      // Verificar o estado inicial (se o conteúdo está realmente transbordando)

      // Esta verificação pode ser complexa devido ao max-height e ao conteúdo dinâmico.

      // Por simplicidade, vamos assumir que se o botão existe, a funcionalidade é necessária.

      // Poderíamos verificar scrollHeight > clientHeight, mas isso só funciona se overflow não for hidden.

      // Com max-height e overflow:hidden, a melhor maneira é testar visualmente e ajustar o max-height no CSS.



      readMoreButton.addEventListener('click', () => {

        const isExpanded = expandableContent.classList.contains('expanded');

        expandableContent.classList.toggle('expanded');

        if (!isExpanded) {

          readMoreButton.textContent = 'Ler menos';

            // Opcional: rolar para o início do conteúdo expandido ou para o botão

            expandableContent.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } else {

          readMoreButton.textContent = 'Ler mais';

          // Rolar de volta para o topo da seção de história ao recolher

          const historySection = document.getElementById('history');

          if (historySection) {

        historySection.scrollIntoView({ behavior: 'smooth', block: 'start' });

          }

        }

      });

    }

  }

  // --- FIM: LÓGICA PARA "LER MAIS" NA SEÇÃO NOSSA HISTÓRIA ---



  // --- REMOVIDO: LÓGICA PARA MOVER ÍCONES SOCIAIS PARA O MENU TOGGLE ---

  // A lógica anterior que clonava .header-social-icons para .main-nav ul foi removida

  // pois os ícones foram completamente removidos do cabeçalho.



  // --- INÍCIO: GRÁFICOS DE DOAÇÃO (DOACAO.HTML) ---

  // --- INÍCIO: GRÁFICOS DE DOAÇÃO COM CORREÇÃO DE ANIMAÇÃO ---

const isDoacaoPageForCharts = window.location.pathname.endsWith('doacao.html');



if (isDoacaoPageForCharts) {

  const geralChartCanvas = document.getElementById('geralDonationChart');

  const socialChartCanvas = document.getElementById('socialProjectsChart');



  // Função que cria o primeiro gráfico (Distribuição Geral)

  const createGeralChart = () => {

    new Chart(geralChartCanvas, {

      type: 'pie',

      data: {

        labels: ['LAMED (Operacional, Novos Projetos)', 'Projetos Sociais e Missionários'],

        datasets: [{

          label: 'Distribuição Geral',

          data: [45, 55],

          backgroundColor: ['rgb(248, 149, 27)', 'rgb(148, 3, 17)'],

          borderColor: ['rgba(248, 148, 27, 1)', 'rgba(148, 3, 18, 1)'],

          borderWidth: 1

        }]

      },

      options: {

        responsive: true,

        // REMOVIDO: maintainAspectRatio: false

        aspectRatio: 1.5, // NOVO: Define uma proporção (largura / altura). 1.5 é um bom valor visual.

        animation: {

          duration: 2000,

          easing: 'easeInOutQuart'

        },

        plugins: {

          legend: { position: 'top' },

          tooltip: {

            callbacks: {

              label: function(context) {

                return `${context.label || ''}: ${context.parsed || 0}%`;

              }

            }

          }

        }

      }

    });

    console.log('Gráfico Geral criado e animado.');

  };



  // Função que cria o segundo gráfico (Projetos Sociais)

  const createSocialChart = () => {

    new Chart(socialChartCanvas, {

      type: 'pie',

      data: {

        labels: ['Missão Global', 'Projetos Sociais (ADRA)', 'Dízimo', 'Oferta (IASD)'],

        datasets: [{

          label: 'Distribuição em Projetos Sociais e Missionários',

          data: [20, 20, 10, 5],

          backgroundColor: ['rgba(250, 184, 31, 1)', 'rgb(250, 119, 31)', 'rgb(148, 3, 17)', 'rgb(92, 36, 3)'],

          borderColor: ['rgba(250, 184, 31, 1)', 'rgb(250, 119, 31)', 'rgba(148, 3, 17)', 'rgb(92, 36, 3)'],

          borderWidth: 1

        }]

      },

      options: {

        responsive: true,

        // REMOVIDO: maintainAspectRatio: false

        aspectRatio: 1.5, // NOVO: Define uma proporção (largura / altura) para consistência.

        animation: {

          duration: 4000,

          easing: 'easeInOutQuart'

        },

        plugins: {

          legend: { position: 'top' },

          tooltip: {

            callbacks: {

              label: function(context) {

                return `${context.label || ''}: ${context.parsed || 0}% (de 55%)`;

              }

            }

          }

        }

      }

    });

    console.log('Gráfico Social criado e animado.');

  };



  // --- Lógica do Intersection Observer (permanece a mesma) ---

  const observerOptions = {

    root: null,

    threshold: 0.5

  };



  const observerCallback = (entries, observer) => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {

        if (entry.target.id === 'geralDonationChart') {

          createGeralChart();

        } else if (entry.target.id === 'socialProjectsChart') {

          createSocialChart();

        }

        observer.unobserve(entry.target);

      }

    });

  };



  const chartObserver = new IntersectionObserver(observerCallback, observerOptions);



  if (geralChartCanvas) chartObserver.observe(geralChartCanvas);

  if (socialChartCanvas) chartObserver.observe(socialChartCanvas);

}

// --- FIM: GRÁFICOS DE DOAÇÃO ---

}); // Fim do DOMContentLoaded principal



// const header = document.querySelector('.site-header'); // Esta linha é comentada no original, mas a lógica abaixo a utiliza. Vamos descomentar.

// Theme toggle logic
const themeToggleButton = document.getElementById('theme-toggle');

if (themeToggleButton) {
  themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    let theme = 'light';
    if (document.body.classList.contains('dark-mode')) {
      theme = 'dark';
    }
    localStorage.setItem('theme', theme);
  });
}

// Apply saved theme on page load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
}


const header = document.querySelector('.site-header');

let isHidden = false;



// Determine scroll threshold based on page

const path = window.location.pathname;

const isVideosPage = path.endsWith('videos.html');

const isArtigosPage = path.endsWith('artigos.html');

const isDoacaoPage = path.endsWith('doacao.html');

const isSobrePage = path.endsWith('sobre.html');

const isPoliticaPage = path.endsWith('politica.html') || path.endsWith('politica-de-privacidade.html');

const isTermosPage = path.endsWith('termos-de-uso.html') || path.endsWith('termos-de-uso-e-condicoes-gerais.html');

const isIndexPage = path.endsWith('index.html') || path === '/'; // Considera a raiz como index.html

let scrollThreshold = 400;



if (isVideosPage) {

  scrollThreshold = 90;

} else if (isDoacaoPage) {

  scrollThreshold = 80;

} else if (isArtigosPage) {

  scrollThreshold = 50;

} else if (isSobrePage) {

  scrollThreshold = 100;

} else if (isPoliticaPage || isTermosPage) {

  scrollThreshold = 150;

} else if (isIndexPage) {

  scrollThreshold = 200; // Ajuste para a página inicial

}



window.addEventListener('scroll', () => {

  if (window.scrollY > scrollThreshold) {

    if (!isHidden && header) {

      header.classList.remove('sticky'); // Restaurado: A lógica original removia, pode ser importante para o efeito desejado

      header.style.transition = 'opacity 0.5s, visibility 0.5s linear 0.5s';

      header.style.opacity = '0';

      header.style.pointerEvents = 'none';

      header.style.visibility = 'hidden';

      isHidden = true;

    }

  } else {

    if (isHidden && header) {

      header.classList.add('sticky'); // Restaurado

      header.style.transition = 'opacity 0.5s, visibility 0s linear 0s';

      header.style.opacity = '1';

      header.style.pointerEvents = 'auto';

      header.style.visibility = 'visible';

      isHidden = false;

    }

  }

});







// O ouvinte de evento principal que engloba toda a lógica

document.addEventListener('DOMContentLoaded', () => {



  // --- INÍCIO: LÓGICA PARA BOTÃO FLUTUANTE 'VOLTAR PARA ARTIGOS' (SEU CÓDIGO ORIGINAL) ---

  const backToArticlesButton = document.getElementById('back-to-articles-button');

  const siteHeader = document.querySelector('.site-header');



  if (backToArticlesButton && siteHeader) {

    let headerInitialVisible = true;

    let buttonVisible = false;

    let showButtonTimeoutId = null;

    let currentHeaderHeight = 0;



    function updateHeaderHeight() {

      if (siteHeader) {

        currentHeaderHeight = siteHeader.getBoundingClientRect().height;

      }

    }



    updateHeaderHeight();

    window.addEventListener('resize', updateHeaderHeight);



    window.addEventListener('scroll', () => {

      const scrollPosition = window.pageYOffset;



      if (scrollPosition <= currentHeaderHeight) {

        if (!headerInitialVisible) {

          headerInitialVisible = true;

          if (buttonVisible) {

            backToArticlesButton.classList.remove('visible');

            buttonVisible = false;

          }

          if (showButtonTimeoutId) {

            clearTimeout(showButtonTimeoutId);

            showButtonTimeoutId = null;

          }

        }

      } else {

        if (headerInitialVisible) {

          headerInitialVisible = false;

          if (!buttonVisible && !showButtonTimeoutId) {

            showButtonTimeoutId = setTimeout(() => {

              if (window.pageYOffset > currentHeaderHeight) {

                backToArticlesButton.classList.add('visible');

                buttonVisible = true;

              }

              showButtonTimeoutId = null;

            }, 700);

          }

        }

      }

    }, { passive: true });



    if (window.pageYOffset > currentHeaderHeight) {

      headerInitialVisible = false;

      showButtonTimeoutId = setTimeout(() => {

        if (window.pageYOffset > currentHeaderHeight) {

          backToArticlesButton.classList.add('visible');

          buttonVisible = true;

        }

        showButtonTimeoutId = null;

      }, 700);

    } else {

      headerInitialVisible = true;

      backToArticlesButton.classList.remove('visible');

      buttonVisible = false;

    }

  }

  // --- FIM: LÓGICA PARA BOTÃO FLUTUANTE 'VOLTAR PARA ARTIGOS' ---





  // --- INÍCIO: LÓGICA PARA ANIMAÇÃO SUAVE DOS ÍCONES NO CARD (VERSÃO CORRIGIDA) ---

const animatedCards = document.querySelectorAll('.lamed-symbolism-card');



animatedCards.forEach(card => {

    // CORREÇÃO: Adicionados os pontos (.) antes de lucide-heart e lucide-move-right

    const icon = card.querySelector('.lucide-trending-up, .lucide-signpost-big-icon, .lucide-heart, .lucide-move-right');

    

    if (icon) {

        card.addEventListener('mouseenter', () => {

            icon.classList.add('is-animating');

        });



        card.addEventListener('mouseleave', () => {

            icon.addEventListener('animationiteration', () => {

                icon.classList.remove('is-animating');

            }, { once: true });

        });

    }

});

// --- FIM: LÓGICA PARA ANIMAÇÃO SUAVE DOS ÍCONES NO CARD (VERSÃO CORRIGIDA) ---



}); // <-- Fim do addEventListener de DOMContentLoaded