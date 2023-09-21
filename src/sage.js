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
let wipRoot = null;
let currentRoot = null;
let deletions = null;

function render(element, container) {
  wipRoot = {
    domNode: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) return;
  const domParent = fiber.parent.domNode;

  if (fiber.effectTag == 'PLACEMENT' && fiber.domNode != null) {
    domParent.appendChild(fiber.domNode);
  } else if (fiber.effectTag == 'DELETION') {
    domParent.removeChild(fiber.domNode);
  } else if (fiber.effectTag == 'UPDATE' && fiber.domNode != null) {
    updateDom(fiber.domNode, fiber.alternate.props, fiber.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function updateDom(domNode, prevProps, nextProps) {
  // Helper functions
  const isEvent = (key) => key.startsWith('on');
  const isProperty = (key) => key !== 'children' && !isEvent(key);
  const isNew = (prev, key) => prev[key] !== next[key];
  const isGone = (prev, next) => (key) => !(key in next);

  // remove old/changed event listeners from domNode
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      domNode.removeEventListener(
        name.toLowerCase().substring(2),
        prevProps[name]
      );
    });

  // add new event listeners to domNode
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      domNode.addEventlistener(
        name.toLowerCase().substring(2),
        nextProps[name]
      );
    });

  // remove old properties from domNode
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => (domNode[name] = ''));

  // set new/changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => (domNode[name] = nextProps[name]));
}

function workLoop(deadLine) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadLine.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) commitRoot();
  requestIdleCallback(workLoop);
}

function performUnitOfWork(fiber) {
  if (!fiber.domNode) fiber.domNode = createDom(fiber);

  const elements = fiber.props.children;

  reconcileChildren(fiber, elements);

  if (fiber.child) return fiber.child;
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
}

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let prevSibling = null;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    const newFiber = null;
    const sameType = oldFiber && element && element.type == oldFiber.type;
    if (sameType) {
      // todo: this is an update
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        domNode: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    }
    if (element && !sameType) {
      // todo: this is an addition
      newFiber = {
        type: element.type,
        props: element.props,
        domNode: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }
    if (oldFiber && !sameType) {
      // todo: delete
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }
    // {
    //   type: element.type,
    //   props: element.props,
    //   parent: fiber,
    //   domNode: null,
    // };
    if (index == 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    prevSibling = newFiber;
    index++;
  }
}

requestIdleCallback(workLoop);

export default Sage;
