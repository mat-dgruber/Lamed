import { Routes } from '@angular/router';
import { Home } from './componentes/home/home';
import { Videos } from './componentes/videos/videos';
import { BundleDetailComponent } from './pages/bundle-detail/bundle-detail.component';

export const routes: Routes = [
    { 
        path: '', 
        component: Home,
        data: { 
            title: 'Início', 
            description: 'Lamed - Explore estudos bíblicos profundos, artigos teológicos e recursos para seu crescimento espiritual.' 
        }
    },
    { 
        path: 'videos', 
        component: Videos,
        data: { 
            title: 'Vídeos', 
            description: 'Assista a pregações e estudos bíblicos em vídeo.' 
        }
    },
    { 
        path: 'artigos', 
        loadComponent: () => import('./componentes/artigos/artigos').then(m => m.Artigos),
        data: { 
            title: 'Artigos', 
            description: 'Leia artigos inspiradores sobre fé, teologia e vida cristã.' 
        }
    },
    { 
        path: 'materiais-extras', 
        loadComponent: () => import('./componentes/bundle-list/bundle-list').then(m => m.BundleList),
        data: { 
            title: 'Materiais Extras', 
            description: 'Recursos adicionais e materiais de apoio para seus estudos.' 
        }
    },
    { 
        path: 'sobre', 
        loadComponent: () => import('./componentes/sobre/sobre').then(m => m.Sobre),
        data: { 
            title: 'Sobre Nós', 
            description: 'Conheça a história e o propósito do ministério Lamed.' 
        }
    },
    { 
        path: 'apoie', 
        loadComponent: () => import('./componentes/apoie/apoie').then(m => m.Apoie),
        data: { 
            title: 'Apoie o Ministério', 
            description: 'Saiba como contribuir e apoiar o crescimento deste ministério.' 
        }
    },
    { 
        path: 'contato', 
        loadComponent: () => import('./componentes/contato/contato').then(m => m.Contato),
        data: { 
            title: 'Contato', 
            description: 'Entre em contato conosco para dúvidas, sugestões ou pedidos de oração.' 
        }
    },
    { 
        path: 'siga-nos', 
        loadComponent: () => import('./componentes/siga-nos/siga-nos').then(m => m.SigaNos),
        data: { 
            title: 'Siga-nos', 
            description: 'Acompanhe o Lamed nas redes sociais e fique por dentro das novidades.' 
        }
    },
    {
        path: 'guia-de-estudos',
        redirectTo: 'materiais-extras',
        pathMatch: 'full'
    },
    { 
        path: 'termos-de-uso', 
        loadComponent: () => import('./componentes/legal/termos/termos').then(m => m.Termos),
        data: { 
            title: 'Termos de Uso',
            description: 'Termos e condições de uso do site Lamed.'
        }
    },
    { 
        path: 'politica-de-privacidade', 
        loadComponent: () => import('./componentes/legal/politica/politica').then(m => m.Politica),
        data: { 
            title: 'Política de Privacidade',
            description: 'Nossa política sobre coleta e uso de dados pessoais.'
        }
    },
    { 
        path: 'bundle/:id', 
        component: BundleDetailComponent,
        // Title handled dynamically in component
    },
    { 
      path: 'article/:id', 
      loadComponent: () => import('./pages/article-detail/article-detail.component').then(m => m.ArticleDetailComponent),
      // Title handled dynamically in component
    },
    { 
        path: 'admin', 
        loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
        data: { title: 'Área Administrativa', noindex: true } // No description needed mainly
    },
    // 404 dedicated
    {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
        data: { title: 'Página não encontrada' }
    }
];
