export const ENEMY_HP = 3;

export const ENEMY_AI = {
  patrolSpeed: 90,
  chaseSpeed: 165,
  detectRange: 430,
  attackRange: 300,
  hearRange: 520,
  perceptionMs: 120,
  alertMs: 2800,
  reactionMs: 280,
  arriveDistance: 18,
  stuckMs: 800,
  losStep: 16,
} as const;
