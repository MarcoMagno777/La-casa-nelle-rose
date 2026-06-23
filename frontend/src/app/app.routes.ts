import { Routes } from '@angular/router';
import { CatalogComponent } from './features/catalog/catalog.component';
import { AuthComponent } from './features/auth/auth.component';
import { AccountComponent } from './features/account/account.component';
import { AdminComponent } from './features/admin/admin.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: CatalogComponent },
  { path: 'catalogo', component: CatalogComponent },
  { path: 'login', component: AuthComponent },
  { path: 'login/admin-panel', component: AdminComponent },
  { path: 'area-personale', component: AccountComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
