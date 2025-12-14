import {
  ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Output, signal, viewChild,
} from '@angular/core';
import { EditorView } from 'prosemirror-view';

@Component({
  selector: 'ngx-image-view',
  templateUrl: './image-view.component.html',
  styleUrls: ['./image-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageViewComponent {
  // Use signals for reactive state in zoneless mode
  src = signal('');
  alt = signal('');
  title = signal('');
  outerWidth = signal('');
  selected = signal(false);

  view: EditorView;

  @Output() imageResize = new EventEmitter();

  imgEl = viewChild.required<ElementRef>('imgEl');

  startResizing(e: MouseEvent, direction: string): void {
    e.preventDefault();
    this.resizeImage(e, direction);
  }

  resizeImage(evt: MouseEvent, direction: string): void {
    const startX = evt.pageX;
    const startWidth = this.imgEl().nativeElement.clientWidth;

    const isLeftResize = direction === 'left';

    const { width } = window.getComputedStyle(this.view.dom);
    const editorWidth = parseInt(width, 10);

    const onMouseMove = (e: MouseEvent) => {
      const currentX = e.pageX;
      const diffInPx = currentX - startX;
      const computedWidth = isLeftResize ? startWidth - diffInPx : startWidth + diffInPx;

      // prevent image overflow the editor
      // prevent resizng below 20px
      if (computedWidth > editorWidth || computedWidth < 20) {
        return;
      }

      this.outerWidth.set(`${computedWidth}px`);
    };

    const onMouseUp = (e: MouseEvent) => {
      e.preventDefault();

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      this.imageResize.emit();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}
