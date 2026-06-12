import { PlatformRef } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = ({ platformRef }: { platformRef: PlatformRef }) => {
  return bootstrapApplication(AppComponent, config, { platformRef });
};

export default bootstrap;
