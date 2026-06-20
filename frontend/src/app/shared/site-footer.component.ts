import { Component } from '@angular/core';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  template: `
    <footer class="site-footer">
      <div>
        <p class="footer-brand">La Casa nelle Rose</p>
        <p>Via D. Alighieri, 22 - Sesto Fiorentino (FI)</p>
        <p>Tel. +39 055 444112</p>
      </div>
      <div class="footer-links" aria-label="Contatti e social">
        <a href="mailto:info@lacasanellerose.com">info&#64;lacasanellerose.com</a>
        <a href="http://www.facebook.com/lacasanellerose" target="_blank" rel="noreferrer">Facebook</a>
        <a href="https://www.instagram.com/lacasanellerose/" target="_blank" rel="noreferrer">Instagram</a>
        <span>P.IVA 04857380481</span>
      </div>
    </footer>
  `
})
export class SiteFooterComponent {}
