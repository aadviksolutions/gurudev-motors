import type { ShowroomVehicle } from './showroom';

export const ROAD_HOLD_MS = 2000;
export const ROAD_ENTER_MS = 650;
export const ROAD_EXIT_MS = 600;
export const ROAD_IMAGE_SIZES = '(max-width: 600px) 72vw, (max-width: 1100px) 400px, 520px';

const brands = ['TVS', 'Honda', 'Suzuki', 'Hero', 'Bajaj'];
const sampleImages: Record<string, string> = {
  'draft-raider': '/images/hero/tvs-raider-right.webp',
  'draft-activa': '/images/hero/honda-activa-right.webp',
  'draft-access': '/images/hero/suzuki-access-right.webp',
  'draft-splendor': '/images/hero/hero-splendor-right.webp',
  'draft-pulsar': '/images/hero/bajaj-pulsar-right.webp',
};

export function getRoadSlides(vehicles: ShowroomVehicle[]) {
  return brands.flatMap((brand) => {
    const vehicle = vehicles.find((item) => item.brand === brand && item.category === 'NEW' && item.imageUrl);
    return vehicle ? [{ ...vehicle, imageUrl: sampleImages[vehicle.id] || vehicle.imageUrl }] : [];
  });
}

export type RoadPhase = 'hold' | 'exit' | 'enter';
export type RoadState = { index: number; phase: RoadPhase; paused: boolean };
export type RoadAction =
  | { type: 'advance'; count: number }
  | { type: 'select'; index: number; count: number }
  | { type: 'pause' | 'play' | 'settle' };

export const initialRoadState: RoadState = { index: 0, phase: 'hold', paused: false };

export function roadReducer(state: RoadState, action: RoadAction): RoadState {
  switch (action.type) {
    case 'select':
      return { index: action.count ? ((action.index % action.count) + action.count) % action.count : 0, phase: 'hold', paused: true };
    case 'pause':
      return { ...state, phase: 'hold', paused: true };
    case 'play':
      return { ...state, phase: 'hold', paused: false };
    case 'settle':
      return { ...state, phase: 'hold' };
    case 'advance':
      if (action.count < 2 || state.paused) return state;
      if (state.phase === 'exit') return { ...state, index: (state.index + 1) % action.count, phase: 'enter' };
      return { ...state, phase: state.phase === 'enter' ? 'hold' : 'exit' };
  }
}
