import { Component } from '@angular/core';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'travelgram';

  // AuthService is injected here, so that we can access in the routing
  constructor(private auth: AuthService) {}
}
