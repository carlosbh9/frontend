import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SpinnerService } from '../components/spinner/spinner.service';
import { finalize } from 'rxjs';

export const spinnerInterceptor: HttpInterceptorFn = (req, next) => {
  const spinnerSvc = inject(SpinnerService)
  spinnerSvc.show()
  return next(req).pipe(
    finalize(() => spinnerSvc.hide())
  );
};
