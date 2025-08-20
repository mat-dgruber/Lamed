import { Routes } from '@angular/router';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Home } from './home/home';
import { About } from './about/about';
import { Videos } from './videos/videos';
import { Artigos } from './artigos/artigos';
import { Apoie } from './apoie/apoie';



export const routes: Routes = [
     {path: '', component: Home},
     {path: 'sobre', component: About},
     {path: 'videos', component: Videos},
     {path: 'artigos', component: Artigos},
     {path: 'apoie', component: Apoie},

];
