# @bobbyquantum/ngx-editor

<p align="center">
  <a href="https://github.com/bobbyquantum/ngx-editor">
   <img src="./sketch/ngx-editor.svg" alt="ngxEditor">
  </a>
</p>
<p align="center">The Rich Text Editor for Angular 21+ (Zoneless), Built on ProseMirror</p>

> ⚠️ **This is a fork of [sibiraj-s/ngx-editor](https://github.com/sibiraj-s/ngx-editor)**
>
> The original project appears to be inactive. This fork has been updated to support **Angular 21** with **zoneless change detection** and modern Angular patterns. It is published under a scoped npm package for independent distribution.

## What's Different

- ✅ **Angular 21** support
- ✅ **Zoneless change detection** (`provideZonelessChangeDetection()`)
- ✅ **OnPush change detection** for all components
- ✅ **Angular Signals** for reactive state
- ✅ **Modern control flow** (`@if`, `@for` instead of `*ngIf`, `*ngFor`)
- ✅ **`inject()` pattern** instead of constructor injection
- ✅ **Ctrl/Cmd+Click** to open links in editor

## Getting Started

### Installation

```bash
npm install @bobbyquantum/ngx-editor
```

### Usage

**Note**: By default the editor comes with minimal features.

```ts
import {
  NgxEditorComponent,
  NgxEditorMenuComponent,
  Editor,
} from '@bobbyquantum/ngx-editor';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'editor-component',
  templateUrl: 'editor.component.html',
  styleUrls: ['editor.component.scss'],
  standalone: true,
  imports: [NgxEditorComponent, NgxEditorMenuComponent, FormsModule],
})
export class MyEditorComponent implements OnInit, OnDestroy {
  html = '';
  editor: Editor;

  ngOnInit(): void {
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }
}
```

Then in HTML

```html
<div class="NgxEditor__Wrapper">
  <ngx-editor-menu [editor]="editor"></ngx-editor-menu>
  <ngx-editor
    [editor]="editor"
    [ngModel]="html"
    [disabled]="false"
    [placeholder]="'Type here...'"
  ></ngx-editor>
</div>
```

### Zoneless Setup

In your app config:

```ts
import { provideZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection()],
};
```

## Browser Compatibility

Works on all Evergreen browsers:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari
- Opera

## Icons

Icons are from https://fonts.google.com/icons

## Original Project

This is a fork of [sibiraj-s/ngx-editor](https://github.com/sibiraj-s/ngx-editor). Full credit to the original author for the excellent foundation.

## License

MIT - See [LICENSE](./LICENSE)
