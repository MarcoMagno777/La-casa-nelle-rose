import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = req.url.includes('/api/admin/')
    ? sessionStorage.getItem('mdr_admin_token')
    : localStorage.getItem('mdr_token') || sessionStorage.getItem('mdr_session_token');
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
