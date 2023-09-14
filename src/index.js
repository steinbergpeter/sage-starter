import React from 'react';
import ReactDOM from 'react-dom';

// const element = <h1 title="web dev made simple">DevSage</h1>;
// const element = React.createElement(
//   'h1',
//   { title: 'web dev made simple' },
//   'DevSage'
// );
const element = {
  type: 'h1',
  props: {
    title: 'web dev made simple',
    children: ['DevSage'],
  },
};

// const root = document.getElementById('root');
const container = document.getElementById('root');

const node = document.createElement(element.type);
node['title'] = element.props.title;

const text = document.createTextNode('');
text['nodeValue'] = element.props.children;

node.appendChild(text);
container.appendChild(node);

// ReactDOM.render(element, root);
