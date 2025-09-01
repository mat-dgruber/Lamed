import { Routes } from '@angular/router';
import { Header } from './header/header';
import { Home } from './home/home';
import { Sobre } from './sobre/sobre';
import { Videos } from './videos/videos';
import { Artigos } from './artigos/artigos';
import { Apoie } from './apoie/apoie';
import { Artigo } from './artigo/artigo';
import { Politica } from './politica/politica-de-privacidade';
import { Termos } from './termos/termos-de-uso';
import { Contato } from './contato/contato';
import { GuiaDeEstudos } from './guia-de-estudos/guia-de-estudos';



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
     {path: 'guia-de-estudos', component: GuiaDeEstudos}

];
