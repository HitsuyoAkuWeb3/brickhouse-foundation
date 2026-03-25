import { describe, it, expect, beforeEach } from 'vitest';
import { useOnboardingStore } from './onboardingStore';

describe('useOnboardingStore (MVP 6-Step Compliance)', () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it('initializes at step 1', () => {
    expect(useOnboardingStore.getState().step).toBe(1);
  });

  it('caps the maximum steps at 6', () => {
    const store = useOnboardingStore.getState();
    // Fast forward to step 6
    store.setStep(6);
    expect(useOnboardingStore.getState().step).toBe(6);

    // Try to go beyond 6
    useOnboardingStore.getState().nextStep();
    expect(useOnboardingStore.getState().step).toBe(6);
  });

  it('prevents going below step 1', () => {
    useOnboardingStore.getState().prevStep();
    expect(useOnboardingStore.getState().step).toBe(1);
  });

  it('stores zodiac sign properly', () => {
    useOnboardingStore.getState().setZodiacSign('Aries');
    expect(useOnboardingStore.getState().zodiacSign).toBe('Aries');
  });

  it('enforces a single goal selection', () => {
    const store = useOnboardingStore.getState();
    
    // Select first goal
    store.toggleGoal('Heal and reclaim my power');
    expect(useOnboardingStore.getState().goals).toEqual(['Heal and reclaim my power']);

    // Select second goal - it should REPLACE the first goal
    store.toggleGoal('Create peace and joy in my everyday life');
    expect(useOnboardingStore.getState().goals).toEqual(['Create peace and joy in my everyday life']);

    // Toggle the SAME goal - it should clear it
    store.toggleGoal('Create peace and joy in my everyday life');
    expect(useOnboardingStore.getState().goals).toEqual([]);
  });
});
