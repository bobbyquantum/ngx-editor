import { nodes as basicNodes, marks } from '@bobbyquantum/ngx-editor';
import { Schema } from 'prosemirror-model';
import { node as codeMirrorNode } from 'prosemirror-codemirror-6';

const nodes = {
  ...basicNodes,
  code_mirror: codeMirrorNode,
};

const schema = new Schema({
  nodes,
  marks,
});

export default schema;
