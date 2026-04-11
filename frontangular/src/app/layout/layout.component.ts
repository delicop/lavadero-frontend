import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SesionService } from '../core/services/sesion.service';
import { AuthService } from '../core/services/auth.service';
import { RealtimeService } from '../core/services/realtime.service';
import type { Usuario } from '../shared/types';

interface ItemMenu {
  ruta: string;
  label: string;
  icono: string;
}

// Links directos visibles para todos los roles
const ITEMS_DIRECTOS: ItemMenu[] = [
  { ruta: '/dashboard', label: 'Panel', icono: '⊞' },
];

// Links directos solo para admin (fuera del grupo Administración)
const ITEMS_OPERACION: ItemMenu[] = [
  { ruta: '/turnos',        label: 'Turnos',       icono: '◷' },
  { ruta: '/caja',          label: 'Caja',          icono: '◫' },
  { ruta: '/liquidaciones', label: 'Liquidaciones', icono: '◎' },
  { ruta: '/asistencia',    label: 'Asistencia',    icono: '◑' },
];

// Subitems del grupo Administración
const ITEMS_ADMIN: ItemMenu[] = [
  { ruta: '/clientes',      label: 'Clientes',  icono: '◻' },
  { ruta: '/vehiculos',     label: 'Vehículos', icono: '◈' },
  { ruta: '/servicios',     label: 'Servicios', icono: '◆' },
  { ruta: '/configuracion', label: 'Personal',  icono: '◉' },
  { ruta: '/mi-perfil',     label: 'Mi perfil', icono: '◯' },
];

const RUTAS_GRUPO_ADMIN = new Set(ITEMS_ADMIN.map(i => i.ruta));

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit, OnDestroy {
  private readonly sesion = inject(SesionService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly realtime = inject(RealtimeService);

  usuario: Usuario | null = null;
  esAdmin = false;
  itemsDirectos: ItemMenu[] = [];
  itemsOperacion: ItemMenu[] = [];
  itemsAdmin: ItemMenu[] = [];
  adminAbierto = false;

  ngOnInit(): void {
    this.usuario = this.sesion.obtener();
    this.esAdmin = this.sesion.esAdmin();
    this.itemsDirectos = ITEMS_DIRECTOS;
    if (this.esAdmin) {
      this.itemsOperacion = ITEMS_OPERACION;
      this.itemsAdmin = ITEMS_ADMIN;
      // Auto-abrir si la ruta actual es de administración
      const rutaActual = this.router.url.split('?')[0];
      this.adminAbierto = RUTAS_GRUPO_ADMIN.has(rutaActual);
    }
    this.realtime.conectar();
  }

  ngOnDestroy(): void {
    this.realtime.desconectar();
  }

  toggleAdmin(): void {
    this.adminAbierto = !this.adminAbierto;
  }

  logout(): void {
    this.auth.logout();
  }

  get iniciales(): string {
    if (!this.usuario) return '?';
    return `${this.usuario.nombre.charAt(0)}${this.usuario.apellido.charAt(0)}`.toUpperCase();
  }
}
