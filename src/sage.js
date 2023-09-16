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

  // add all Properties/Attributes
  Object.keys(element.props)
    .filter((key) => (key !== 'children' ? true : false))
    .forEach((prop) => (domNode[prop] = element.props[prop]));

  // Add all children
  element.props.children.forEach((child) => render(child, domNode));

  // Render on screen
  container.appendChild(domNode);
}

export default Sage;
