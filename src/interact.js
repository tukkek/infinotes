import {updatenote} from './note.js';

function dragMoveListener(event) {
  var target = event.target
  while(!target.classList.contains('note')) target=target.parentNode;
  var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
  var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
  target.style.webkitTransform=target.style.transform='translate(' + x + 'px, ' + y + 'px)'
  target.setAttribute('data-x', x)
  target.setAttribute('data-y', y)
}

export function enableinteract(element){
  interact(element)
    .resizable({
      // resize from all edges and corners
      edges: { left: true, right: true, bottom: true, top: true },
      modifiers: [interact.modifiers.restrictSize({min: { width: 50, height: 50 }})],
      //inertia: true,
      onend:updatenote,
    })
    .on('resizemove', function (event) {
      let target = event.target;
      let x = (parseFloat(target.getAttribute('data-x')) || 0);
      let y = (parseFloat(target.getAttribute('data-y')) || 0);
      // update the element's style
      target.style.width=event.rect.width + 'px';
      target.style.height=event.rect.height + 'px';
      // translate when resizing from top or left edges
      x+=event.deltaRect.left;
      y+=event.deltaRect.top;
      target.style.webkitTransform = target.style.transform='translate(' + x + 'px,' + y + 'px)';
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    });
    interact(element.querySelector('.actions .move'))
      .draggable({
          onmove:dragMoveListener,
          onend:updatenote
        })
}
