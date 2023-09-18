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

function createDom(fiber) {
  const domNode =
    fiber.type == 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

  Object.keys(fiber.props)
    .filter((key) => (key !== 'children' ? true : false))
    .forEach((prop) => (domNode[prop] = fiber.props[prop]));

  return domNode;
}

let nextUnitOfWork = null;

function render(element, container) {
  nextUnitOfWork = {
    domNode: container,
    props: {
      children: [element],
    },
  };
}

function workLoop(deadLine) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadLine.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}

function performUnitOfWork(fiber) {
  if (!fiber.domNode) fiber.domNode = createDom(fiber);
  if (fiber.parent) fiber.parent.domNode.appendChild(fiber.domNode);
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;
  while (index < elements.length) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      domNode: null,
    };
    index == 0 ? (fiber.child = newFiber) : (prevSibling.sibling = newFiber);
    prevSibling = newFiber;
    index++;
  }
  if (fiber.child) return fiber.child;
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
}

requestIdleCallback(workLoop);

export default Sage;
