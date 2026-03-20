import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  host: {
    class: 'block min-h-screen surface-ground',
  },
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {}
