
export function portal(el: HTMLElement) {
  document.body.appendChild(el);
  el.hidden = false;

  return {
    destroy() {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }
  }
}
