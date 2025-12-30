import { Routes } from '@angular/router';
import { Header } from './components/header/header';
import { Home } from './components/home/home';
import { Sobre } from './components/sobre/sobre';
import { Videos } from './components/videos/videos';
import { Artigos } from './components/artigos/artigos';
import { Apoie } from './components/apoie/apoie';
import { Artigo } from './components/artigo/artigo';
import { Politica } from './components/politica/politica-de-privacidade';
import { Termos } from './components/termos/termos-de-uso';
import { Contato } from './components/contato/contato';
import { GuiaDeEstudos } from './components/guia-de-estudos/guia-de-estudos';
import { SigaNos } from './components/siga-nos/siga-nos';



export const routes: Routes = [
     {path: '', component: Home},
     {path: 'sobre', component: Sobre},
     {path: 'videos', component: Videos},
     {path: 'artigos', component: Artigos},
     {path: 'artigo/:id', component: Artigo},
     {path: 'apoie', component: Apoie},
     {path: 'politica-de-privacidade', component: Politica},
     {path: 'termos-de-uso', component: Termos},
     {path: 'contato', component: Contato},
     {path: 'guia-de-estudos', component: GuiaDeEstudos},
     {path: 'siga-nos', component: SigaNos}

];
