/* Protection contre l'intégration du site dans une page tierce (clickjacking).
   GitHub Pages ne permet pas d'envoyer l'en-tête X-Frame-Options / frame-ancestors,
   donc on le fait ici : si le site officiel est affiché dans un cadre (iframe),
   la page est masquée et l'on tente d'ouvrir le site en pleine page.
   Ne s'applique qu'au domaine officiel (pas à l'aperçu Claude). */
(function () {
  var official = /(^|\.)github\.io$/.test(location.hostname);
  if (!official || window.top === window.self) return;
  document.documentElement.style.visibility = 'hidden';
  try { window.top.location.replace(window.self.location.href); } catch (e) { /* bloqué par le cadre : la page reste masquée */ }
})();
