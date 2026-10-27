export const FX = {
  sparkCount: 6,
  sparkLifeMs: 170,
  impactLifeMs: 90,
  muzzleLifeMs: 70,
  pickupLifeMs: 220,
  deathLifeMs: 280,
  shakeHit: { duration: 55, intensity: 0.0028 },
  shakeDeath: { duration: 90, intensity: 0.0045 },
  shakeMelee: { duration: 40, intensity: 0.002 },
  shakeHurt: { duration: 70, intensity: 0.0032 },
  flashHurtMs: 50,
  poolSize: 28,
} as const;

export function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}
