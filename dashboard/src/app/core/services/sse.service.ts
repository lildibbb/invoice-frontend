import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SseService {
  constructor(private zone: NgZone) {}

  connect(url: string): Observable<any> {
    return new Observable(observer => {
      const source = new EventSource(url, { withCredentials: true });

      source.onmessage = (event) => {
        this.zone.run(() => {
          try {
            observer.next(JSON.parse(event.data));
          } catch {
            observer.next(event.data);
          }
        });
      };

      source.onerror = (error) => {
        this.zone.run(() => {
          if (source.readyState === EventSource.CLOSED) {
            observer.complete();
          } else {
            observer.error(error);
          }
        });
      };

      return () => source.close();
    });
  }
}
