import { provideZonelessChangeDetection, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { NodeView } from 'prosemirror-view';
import { schema } from '../schema';

import imageResizePlugin from './image-resize';

interface RezieViewLike extends NodeView {
  selectNode: () => void;
  deselectNode: () => void;
  destroy: () => void;
  imageComponentRef: { instance: { selected: (() => boolean) } };
}

// Minimal mock EditorView. ImageRezieView only reads .dom and assigns .view.
const createMockView = (): unknown => ({
  dom: document.createElement('div'),
  state: {
    tr: { setNodeMarkup: () => ({ setSelection: () => undefined }) },
    doc: { resolve: () => ({}) },
  },
});

describe('imageResizePlugin / ImageRezieView', () => {
  let node: ProseMirrorNode;
  let view: unknown;
  let getPos: () => number;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    node = schema.nodes.image.create({ src: 'test.png', alt: '', title: '' });
    view = createMockView();
    getPos = () => 0;
  });

  const buildNodeView = (): RezieViewLike => {
    const injector = TestBed.inject(Injector);
    const plugin: Plugin = imageResizePlugin(injector);
    const nodeViews = plugin.spec.props!.nodeViews!;
    return nodeViews['image'](
      node,
      view as never,
      getPos,
      undefined,
      undefined,
    ) as unknown as RezieViewLike;
  };

  it('should defer selectNode signal write to a microtask', async () => {
    const nodeView = buildNodeView();

    nodeView.selectNode();
    // Signal should NOT be true synchronously — deferred to a microtask.
    expect(nodeView.imageComponentRef.instance.selected()).toBe(false);

    await Promise.resolve();
    expect(nodeView.imageComponentRef.instance.selected()).toBe(true);

    nodeView.destroy();
  });

  it('should defer deselectNode signal write to a microtask', async () => {
    const nodeView = buildNodeView();

    // Select first (deferred), wait for it to land.
    nodeView.selectNode();
    await Promise.resolve();
    expect(nodeView.imageComponentRef.instance.selected()).toBe(true);

    // Deselect — signal write is deferred again.
    nodeView.deselectNode();
    expect(nodeView.imageComponentRef.instance.selected()).toBe(true);

    await Promise.resolve();
    expect(nodeView.imageComponentRef.instance.selected()).toBe(false);

    nodeView.destroy();
  });
});