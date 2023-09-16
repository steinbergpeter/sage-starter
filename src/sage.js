const Sage = {
  createElement,
  render,
};

/** @jsx Sage.createElement */
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        if (typeof child === 'object') {
          return child;
        } else {
          return createTextElement(child);
        }
      }),
    },
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function render(element, container) {
  // create DOM node
  const domNode =
    element.type == 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type);

  // add all Properties/Attributes (other than children)
  Object.keys(element.props)
    .filter((key) => (key !== 'children' ? true : false))
    .forEach((prop) => (domNode[prop] = element.props[prop]));

  // Add all children
  element.props.children.forEach((child) => render(child, domNode));

  // Render on screen
  container.appendChild(domNode);
}

let nextUnitOfWork = null;

function workLoop(deadLine) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadLine.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}

function performUnitOfWork() {
  //do work
  // return next unit of work
}

requestIdleCallback(workLoop);

export default Sage;
