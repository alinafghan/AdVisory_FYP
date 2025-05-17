import { Component } from '@angular/core';
import { LucideAngularModule, Home, SquareDashedMousePointer, User, Settings, ArrowLeft, Globe , LogOut, FileLock2, FileCheck2} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  imports: [LucideAngularModule],
  templateUrl: './sidebar.component.html',
})

export class SidebarComponent {
  readonly User = User;
  readonly Settings = Settings;
  readonly Home = Home;
  readonly SquareDashedMousePointer = SquareDashedMousePointer;
  readonly Logout = LogOut;
  readonly ArrowLeft = ArrowLeft;
  readonly Globe = Globe;
  readonly FileLock2 = FileLock2;
  readonly FileCheck2 = FileCheck2;

}