import { HttpInterceptorFn,HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError , EMPTY} from 'rxjs';
import { toast } from 'ngx-sonner';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {


  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error instanceof HttpErrorResponse) {
        let message = 'Ocurrió un error inesperado en el servidor.';


        switch (error.status) {
          case 401:
            // Error de autorización, como "Contraseña inválida"
            message = error.error?.error || 'No estás autorizado. Por favor, inicia sesión.';
            break;

          case 404:
            // Error de "No encontrado"
            message = error.error?.message || 'Recurso no encontrado.';
            break;

          case 500:
            // Error interno del servidor
            message = error.error?.message || 'Error del servidor. Intenta más tarde.';
            break;

          case 400:
            // Error de solicitud incorrecta (bad request)
            message = error.error?.message || 'Solicitud incorrecta.';
            break;

          default:
            // Para otros errores, usamos el mensaje proporcionado por el servidor o un mensaje genérico
            message = error.error?.message || message;
            break;
        }
        // Mostrar la notificación de error usando ngx-sonner
        toast.error(message, {
          duration: 3000, // Duración en milisegundos
          position: 'top-right', // Posición de la notificación
          style: {
            backgroundColor: '#f8d7da', // Fondo rojo claro
            color: '#721c24', // Texto rojo oscuro
          },
       
        });
      }

      // Completar el observable sin propagar el error
      return EMPTY;
    })
  );
};
