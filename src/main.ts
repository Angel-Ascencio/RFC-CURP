import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';
import 'zone.js'; // Añade esta línea para importar Zone.js

bootstrapApplication(AppComponent, appConfig)
  .catch((err: unknown) => console.error(err));
