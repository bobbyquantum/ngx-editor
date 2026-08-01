import { ApplicationRef, ComponentRef, createComponent, Injector } from '@angular/core';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { NodeSelection, Plugin, PluginKey } from 'prosemirror-state';
import { EditorView, NodeView } from 'prosemirror-view';
import { Subscription } from 'rxjs';

import { ImageViewComponent } from '../components/image-view/image-view.component';

class ImageRezieView implements NodeView {
  dom: HTMLElement;
  view: EditorView;
  getPos: () => number;

  applicationRef: ApplicationRef;
  imageComponentRef: ComponentRef<ImageViewComponent>;
  resizeSubscription: Subscription;

  node: ProseMirrorNode;
  updating = false;

  constructor(node: ProseMirrorNode, view: EditorView, getPos: () => number, injector: Injector) {
    this.applicationRef = injector.get(ApplicationRef);

    // create component ref
    this.imageComponentRef = createComponent(ImageViewComponent, {
      environmentInjector: this.applicationRef.injector,
    });

    // Attach to the view so that the change detector knows to run
    this.applicationRef.attachView(this.imageComponentRef.hostView);

    this.setNodeAttributes(node.attrs);
    this.imageComponentRef.instance.view = view;

    this.dom = this.imageComponentRef.location.nativeElement;
    this.view = view;
    this.node = node;
    this.getPos = getPos;

    this.resizeSubscription = this.imageComponentRef.instance.imageResize.subscribe(() => {
      this.handleResize();
    });
  }

  private computeChanges(prevAttrs: Record<string, unknown>, newAttrs: Record<string, unknown>): boolean {
    return JSON.stringify(prevAttrs) === JSON.stringify(newAttrs);
  }

  private setNodeAttributes(attrs: Record<string, string>): void {
    this.imageComponentRef.instance.src.set(attrs['src']);
    this.imageComponentRef.instance.alt.set(attrs['alt'] ?? '');
    this.imageComponentRef.instance.title.set(attrs['title'] ?? '');
    this.imageComponentRef.instance.outerWidth.set(attrs['width'] ?? '');
  }

  handleResize = (): void => {
    if (this.updating) {
      return;
    }

    const { state, dispatch } = this.view;
    const { tr } = state;

    const transaction = tr.setNodeMarkup(this.getPos(), undefined, {
      ...this.node.attrs,
      width: this.imageComponentRef.instance.outerWidth(),
    });

    const resolvedPos = transaction.doc.resolve(this.getPos());
    const newSelection = new NodeSelection(resolvedPos);

    transaction.setSelection(newSelection);
    dispatch(transaction);
  };

  update(node: ProseMirrorNode): boolean {
    if (node.type !== this.node.type) {
      return false;
    }

    this.node = node;

    const changed = this.computeChanges(this.node.attrs, node.attrs);
    if (changed) {
      this.updating = true;
      this.setNodeAttributes(node.attrs);
      this.updating = false;
    }
    return true;
  }

  ignoreMutation(): boolean {
    return true;
  }

  selectNode(): void {
    // Defer the signal write to a microtask. ProseMirror calls selectNode()
    // synchronously inside dispatchTransaction, which runs during Angular's
    // change detection cycle. Writing to the `selected` signal mid-CD triggers
    // NG0100 ("ExpressionChangedAfterItHasBeenChecked"). Scheduling the write
    // on a microtask lets the current CD cycle finish before the signal update
    // re-renders the ImageViewComponent (OnPush + signal-based).
    queueMicrotask(() => this.imageComponentRef.instance.selected.set(true));
  }

  deselectNode(): void {
    queueMicrotask(() => this.imageComponentRef.instance.selected.set(false));
  }

  destroy(): void {
    this.resizeSubscription.unsubscribe();
    this.applicationRef.detachView(this.imageComponentRef.hostView);
  }
}

const imageResizePlugin = (injector: Injector): Plugin => {
  return new Plugin({
    key: new PluginKey('image-resize'),
    props: {
      nodeViews: {
        image: (node: ProseMirrorNode, view: EditorView, getPos: () => number) => {
          return new ImageRezieView(node, view, getPos, injector);
        },
      },
    },
  });
};

export default imageResizePlugin;
