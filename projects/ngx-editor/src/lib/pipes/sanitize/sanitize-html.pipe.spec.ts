import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

import { SanitizeHtmlPipe } from './sanitize-html.pipe';

describe('SanitizeHtmlPipe', () => {
  let pipe: SanitizeHtmlPipe;
  let sanitizer: DomSanitizer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        BrowserModule,
        SanitizeHtmlPipe,
      ],
    }).compileComponents();

    pipe = TestBed.inject(SanitizeHtmlPipe);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should sanitize html', () => {
    const html = '<svg></svg>';
    const result = pipe.transform(html);
    const expected = sanitizer.bypassSecurityTrustHtml(html);
    expect(result).toEqual(expected);
  });
});
