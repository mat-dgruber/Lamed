import { Routes } from '@angular/router';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Home } from './home/home';
import { About } from './about/about';



export const routes: Routes = [
     {path: '', component: Home},
     {path: 'sobre', component: About},
];
