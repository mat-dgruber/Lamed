import { Routes } from '@angular/router';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Home } from './home/home';
import { About } from './about/about';
import { Skills } from './skills/skills';
import { Projects } from './projects/projects';




export const routes: Routes = [
     {path: '', component: Home},
     {path: 'sobre', component: About},
     {path: 'habilidades', component: Skills},
     {path: 'projetos', component: Projects},
];
