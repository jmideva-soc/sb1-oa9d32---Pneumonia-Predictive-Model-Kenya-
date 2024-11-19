// Runge-Kutta 4th Order Implementation
export function rungeKutta4(
  f: (t: number, y: number) => number,
  t0: number,
  y0: number,
  h: number,
  n: number
): { t: number[]; y: number[] } {
  const t: number[] = new Array(n + 1);
  const y: number[] = new Array(n + 1);
  
  t[0] = t0;
  y[0] = y0;
  
  for (let i = 0; i < n; i++) {
    const k1 = f(t[i], y[i]);
    const k2 = f(t[i] + h/2, y[i] + (h/2)*k1);
    const k3 = f(t[i] + h/2, y[i] + (h/2)*k2);
    const k4 = f(t[i] + h, y[i] + h*k3);
    
    t[i + 1] = t[i] + h;
    y[i + 1] = y[i] + (h/6)*(k1 + 2*k2 + 2*k3 + k4);
  }
  
  return { t, y };
}