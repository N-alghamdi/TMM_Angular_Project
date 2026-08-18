import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// starts the root module after angular prepares the browser platform
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
