export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  let lastCallTime = 0;
  
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - lastCallTime);
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        window.clearTimeout(timeout);
        timeout = null;
      }
      lastCallTime = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = window.setTimeout(() => {
        lastCallTime = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    
    const callNow = immediate && !timeout;
    if (timeout) window.clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
    
    if (callNow) func.apply(this, args);
  };
}

export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    if (rafId !== null) return;
    
    rafId = requestAnimationFrame(() => {
      func.apply(this, args);
      rafId = null;
    });
  };
}