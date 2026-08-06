/**
 * Tema claro/oscuro.
 *
 * La clave de almacenamiento y el script de arranque viven acá para que no se
 * dupliquen entre el layout (que lo inyecta) y el selector (que lo escribe).
 */

export const THEME_STORAGE_KEY = "rw-theme";

/**
 * Script que se inyecta en el <head>, antes de que se pinte el body.
 *
 * Sin esto el sitio pintaría en claro y saltaría a oscuro apenas hidrata React:
 * un fogonazo blanco en cada carga, que es justo lo que alguien que eligió modo
 * oscuro no quiere ver. Tiene que ser bloqueante y estar antes del contenido;
 * un useEffect llega tarde por definición.
 *
 * Se mantiene mínimo a propósito, porque bloquea el pintado. La CSP del
 * proyecto permite scripts inline del propio documento ('unsafe-inline'), así
 * que no requiere cambios en next.config.
 *
 * Orden de precedencia: lo que el usuario eligió antes gana; si nunca eligió,
 * se sigue la preferencia del sistema operativo; si nada de eso está
 * disponible, queda en claro, que es el modo por defecto del sitio.
 */
export const THEME_INIT_SCRIPT = `
(function(){
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var theme = stored === 'dark' || stored === 'light'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();
`.trim();
