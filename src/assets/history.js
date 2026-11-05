(() => {
  const track = document.getElementById('history-track');
  if (!track) return;
  const cards = [...track.querySelectorAll('.history-card')];
  const timeline = document.querySelector('.history-timeline');
  const buttons = [...timeline.querySelectorAll('[data-history-index]')];
  const previous = document.getElementById('history-prev');
  const next = document.getElementById('history-next');
  const status = document.getElementById('history-status');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0, requested = null, frame, settle, dragging = null, suppressClick = false;
  const behavior = () => reduce.matches ? 'auto' : 'smooth';
  function update(index) {
    active = Math.max(0, Math.min(cards.length - 1, index));
    buttons.forEach((button, i) => button.setAttribute('aria-current', String(i === active)));
    previous.disabled = active === 0;
    next.disabled = active === cards.length - 1;
    status.textContent = `${String(active + 1).padStart(2, '0')} / ${cards.length}`;
    const button = buttons[active];
    if (button.offsetLeft < timeline.scrollLeft || button.offsetLeft + button.offsetWidth > timeline.scrollLeft + timeline.clientWidth)
      timeline.scrollTo({left:button.offsetLeft - 15, behavior:behavior()});
  }
  function closest() {
    return cards.reduce((best, card, i) => Math.abs(card.offsetLeft - track.scrollLeft) < Math.abs(cards[best].offsetLeft - track.scrollLeft) ? i : best, 0);
  }
  function go(index) {
    const target = Math.max(0, Math.min(cards.length - 1, index));
    requested = target;
    update(target);
    track.scrollTo({left:cards[target].offsetLeft, behavior:behavior()});
  }
  previous.addEventListener('click', () => go((requested ?? active) - 1));
  next.addEventListener('click', () => go((requested ?? active) + 1));
  buttons.forEach((button, i) => button.addEventListener('click', () => go(i)));
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => update(closest()));
    clearTimeout(settle);
    settle = setTimeout(() => {update(closest()); requested = null;}, 150);
  }, {passive:true});
  function keyboard(event) {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    go(event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : (requested ?? active) + (event.key === 'ArrowRight' ? 1 : -1));
    if (event.currentTarget === timeline) buttons[active].focus({preventScroll:true});
  }
  track.addEventListener('keydown', keyboard);
  timeline.addEventListener('keydown', keyboard);
  track.querySelectorAll('img').forEach(image => image.draggable = false);
  track.addEventListener('dragstart', event => event.preventDefault());
  track.addEventListener('pointerdown', event => {
    requested = null;
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    requested = null;
    suppressClick = false;
    dragging = {x:event.clientX, y:event.clientY, left:track.scrollLeft, pointer:event.pointerId, moved:false};
  });
  track.addEventListener('pointermove', event => {
    if (!dragging) return;
    const dx = event.clientX - dragging.x;
    if (!dragging.moved && Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(event.clientY - dragging.y)) {
      dragging.moved = true;
      track.setPointerCapture(event.pointerId);
      track.classList.add('is-dragging');
    }
    if (dragging.moved) { event.preventDefault(); track.scrollLeft = dragging.left - dx; }
  });
  function finishDrag() {
    if (!dragging) return;
    const {pointer, moved} = dragging;
    dragging = null;
    track.classList.remove('is-dragging');
    if (track.hasPointerCapture(pointer)) track.releasePointerCapture(pointer);
    if (moved) { suppressClick = true; go(closest()); }
  }
  track.addEventListener('pointerup', finishDrag);
  track.addEventListener('pointercancel', finishDrag);
  track.addEventListener('lostpointercapture', finishDrag);
  track.addEventListener('click', event => {
    if (suppressClick && event.detail > 0) {event.preventDefault(); event.stopPropagation();}
  }, true);
  new ResizeObserver(() => track.scrollTo({left:cards[active].offsetLeft, behavior:'auto'})).observe(track);
  update(0);
})();
