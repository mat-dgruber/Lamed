document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id');

    if (!articleId) {
        displayArticleNotFound();
        return;
    }

    // First, fetch the articles.json to find the article's metadata
    fetch('articles.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load articles.json');
            }
            return response.json();
        })
        .then(articles => {
            const article = articles.find(a => a.id === articleId);

            if (!article) {
                throw new Error('Article not found in JSON');
            }

            // Update metadata first
            updateMeta(article);

            // Fetch the original HTML content
            return fetch(article.contentPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load article content from ${article.contentPath}`);
                    }
                    return response.text();
                })
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const articleContent = doc.querySelector('.article-content');

                    if (!articleContent) {
                        throw new Error('Could not find .article-content in the fetched HTML.');
                    }

                    // Now populate the template with the full article details
                    populateTemplate(article, articleContent.innerHTML);
                });
        })
        .catch(error => {
            console.error('Error loading article:', error);
            displayArticleNotFound();
        });
});

function updateMeta(article) {
    document.title = `Lamed | ${article.title}`;
    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
        descriptionTag.setAttribute('content', article.description);
    }
    const keywordsTag = document.querySelector('meta[name="keywords"]');
    if (keywordsTag && article.tags) {
        keywordsTag.setAttribute('content', article.tags.join(', '));
    }
}

function populateTemplate(article, contentHtml) {
    const banner = document.getElementById('article-banner');
    const title = document.getElementById('article-title');
    const author = document.getElementById('article-author');
    const date = document.getElementById('article-date');
    const body = document.getElementById('article-body');

    if (banner) {
        banner.src = article.bannerImage;
        banner.alt = article.title;
    }
    if (title) {
        title.textContent = article.title;
    }
    if (author) {
        author.textContent = article.author;
    }
    if (date) {
        date.textContent = article.displayDate;
        date.setAttribute('datetime', article.dateISO);
    }
    if (body) {
        // Create a temporary container to parse the HTML and correct paths
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = contentHtml;

        // Find all images and correct their paths
        const images = tempContainer.querySelectorAll('img');
        images.forEach(img => {
            const currentSrc = img.getAttribute('src');
            if (currentSrc) {
                if (currentSrc.startsWith('../')) {
                    // Handles paths like ../Imagens/foo.png -> Imagens/foo.png
                    img.setAttribute('src', currentSrc.substring(3));
                } else if (!currentSrc.startsWith('http') && !currentSrc.startsWith('/')) {
                    // Handles paths like Imagens-artigos/bar.png -> Artigos/Imagens-artigos/bar.png
                    img.setAttribute('src', 'Artigos/' + currentSrc);
                }
            }
        });

        // Inject the corrected HTML
        body.innerHTML = tempContainer.innerHTML;
    }
}

function displayArticleNotFound() {
    document.title = "Lamed | Artigo Não Encontrado";
    const title = document.getElementById('article-title');
    const body = document.getElementById('article-body');
    if (title) {
        title.textContent = "Artigo Não Encontrado";
    }
    if (body) {
        body.innerHTML = '<p>O artigo que você está procurando não foi encontrado. Por favor, verifique o link ou <a href="artigos.html">volte para a lista de artigos</a>.</p>';
    }
    // Hide meta info for not found articles
    const metaAuthor = document.querySelector('#article-author').parentElement;
    const metaDate = document.querySelector('#article-date').parentElement;
    if (metaAuthor) metaAuthor.style.display = 'none';
    if (metaDate) metaDate.style.display = 'none';
}