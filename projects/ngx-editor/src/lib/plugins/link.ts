import { Fragment, Slice, Node as ProseMirrorNode } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

const HTTP_LINK_REGEX = /(?:https?:\/\/)?[\w-]+(?:\.[\w-]+)+\.?(?:\d+)?(?:\/\S*)?$/;

const linkify = (fragment: Fragment): Fragment => {
  const linkified: ProseMirrorNode[] = [];

  fragment.forEach((child: ProseMirrorNode) => {
    if (child.isText) {
      const text = child.text as string;
      let pos = 0;

      const match: RegExpMatchArray | null = HTTP_LINK_REGEX.exec(text);

      if (match) {
        const start = match.index;
        const end = start + match[0].length;
        const { link } = child.type.schema.marks;

        if (start > 0) {
          linkified.push(child.cut(pos, start));
        }

        const urlText = text.slice(start, end);
        linkified.push(
          child.cut(start, end).mark(link.create({ href: urlText }).addToSet(child.marks)),
        );
        pos = end;
      }

      if (pos < text.length) {
        linkified.push(child.cut(pos));
      }
    } else {
      linkified.push(child.copy(linkify(child.content)));
    }
  });

  return Fragment.fromArray(linkified);
};

const linkifyPlugin = (): Plugin => {
  return new Plugin({
    key: new PluginKey('linkify'),
    props: {
      transformPasted: (slice: Slice) => {
        return new Slice(linkify(slice.content), slice.openStart, slice.openEnd);
      },
      handleClick: (view: EditorView, pos: number, event: MouseEvent) => {
        // Only handle Ctrl+Click (Windows/Linux) or Cmd+Click (Mac)
        if (!event.ctrlKey && !event.metaKey) {
          return false;
        }

        const { state } = view;
        const { doc } = state;
        const $pos = doc.resolve(pos);
        
        // Check if there's a link mark at this position
        const linkMark = state.schema.marks['link'];
        if (!linkMark) {
          return false;
        }

        const marks = $pos.marks();
        const link = marks.find((mark) => mark.type === linkMark);
        
        if (link && link.attrs['href']) {
          const href = link.attrs['href'] as string;
          const target = link.attrs['target'] as string | undefined;
          
          // Respect the link's target attribute
          if (target === '_self') {
            window.location.href = href;
          } else {
            // Default to new tab for '_blank' or undefined
            window.open(href, '_blank', 'noopener,noreferrer');
          }
          return true;
        }

        return false;
      },
    },
  });
};

export default linkifyPlugin;
