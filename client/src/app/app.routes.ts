import { Routes } from '@angular/router';
import { SURFACE_ROUTES } from './surface/surface';

/**
 * En üst iskelet. Hangi arayüzlerin bulunduğu build'in yüzeyine bağlıdır (surface/surface*.ts):
 *   /       public tanıtım sayfası (public)
 *   /user   USER rolünün arayüzü: Mezun Portalı (public)
 *   /admin  yönetim paneli, ADMIN ve SUPERADMIN (internal)
 * Her seviye sadece kendi çocuklarını bilir; klasör ağacı = URL ağacı = menü ağacı (Frontend_Architecture.md §3, §5).
 */
export const routes: Routes = SURFACE_ROUTES;
