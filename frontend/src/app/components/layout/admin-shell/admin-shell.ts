import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // <--- Importă asta
import { Sidebar } from '../sidebar/sidebar'; // Importă și Sidebar-ul ca să-l poți folosi în HTML

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, Sidebar], // <--- Adaugă-le aici
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css'
})
export class AdminShell {}