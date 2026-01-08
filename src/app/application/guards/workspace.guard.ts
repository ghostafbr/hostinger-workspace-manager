import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { WorkspaceContextService } from '../services/workspace-context.service';
import { WorkspaceService } from '../services/workspace.service';
import { map, catchError, of } from 'rxjs';

/**
 * WorkspaceGuard
 *
 * Protege rutas contextuales que requieren un workspace seleccionado válido.
 * Verifica que:
 * 1. El workspaceId en la ruta exista en Firestore
 * 2. El usuario tenga permisos para acceder a ese workspace
 * 3. Actualiza el contexto con el workspace cargado
 */
export const workspaceGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const workspaceContext = inject(WorkspaceContextService);
  const workspaceService = inject(WorkspaceService);

  const workspaceId = route.paramMap.get('workspaceId');

  // Si no hay workspaceId en la ruta, denegar acceso
  if (!workspaceId) {
    console.warn('WorkspaceGuard: No workspaceId in route');
    router.navigate(['/workspaces']);
    return false;
  }

  // Si el workspace ya está en contexto y coincide el ID, permitir acceso
  const currentWorkspace = workspaceContext.getCurrentWorkspace();
  if (currentWorkspace && currentWorkspace.id === workspaceId) {
    return true;
  }

  // Cargar el workspace desde Firestore
  return workspaceService.getWorkspaceById(workspaceId).pipe(
    map(workspace => {
      if (workspace) {
        // Workspace válido, actualizar contexto y permitir acceso
        workspaceContext.selectWorkspace(workspace);
        return true;
      } else {
        // Workspace no encontrado, redirigir
        console.warn(`WorkspaceGuard: Workspace ${workspaceId} not found`);
        router.navigate(['/workspaces']);
        return false;
      }
    }),
    catchError(error => {
      console.error('WorkspaceGuard: Error loading workspace:', error);
      router.navigate(['/workspaces']);
      return of(false);
    })
  );
};
