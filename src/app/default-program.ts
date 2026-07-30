import { Program } from './models';

export const DEFAULT_PROGRAM: Program = {
  home: {
    label: 'Home',
    sub: 'bodyweight + optional bands',
    push: {
      label: 'Push', day: 'Tuesday',
      exercises: [
        { name: 'Push-ups', target: '4×12-15', note: 'feet elevated for more difficulty', load: 0 },
        { name: 'Pike push-ups', target: '3×10-12', note: 'targets shoulders', load: 0 },
        { name: 'Diamond push-ups', target: '3×12', note: 'triceps focus', load: 0 },
        { name: 'Dips (chair/bench)', target: '3×12-15', note: '', load: 0 },
        { name: 'Tricep bench dips / close-grip push-ups', target: '3×12', note: '', load: 0 },
        { name: 'Plank-to-push-up', target: '3×10', note: 'shoulder burnout', load: 0 },
      ]
    },
    pull: {
      label: 'Pull', day: 'Wednesday',
      exercises: [
        { name: 'Pull-ups (bar/door frame)', target: '4×8-10', note: 'or negative pull-ups if not yet full reps', load: 0 },
        { name: 'Doorway/towel rows', target: '3×12', note: 'feet braced, lean back', load: 0 },
        { name: 'Superman holds', target: '3×15', note: 'back activation', load: 0 },
        { name: 'Bicep curls (water bottles/backpack)', target: '3×12-15', note: '', load: 0 },
        { name: 'Reverse snow angels', target: '3×15', note: 'rear delts', load: 0 },
        { name: 'Isometric bicep hold', target: '3×20-30 sec', note: 'hold heavy bag/backpack at 90°', load: 0 },
      ]
    },
    core: {
      label: 'Core', day: 'Friday',
      exercises: [
        { name: 'Hanging/lying leg raises', target: '3×12-15', note: '', load: 0 },
        { name: 'Russian twists', target: '3×15/side', note: 'use a weight or backpack', load: 0 },
        { name: 'Plank variations', target: '3 rounds', note: 'standard, side, shoulder taps', load: 0 },
        { name: 'Bicycle crunches', target: '3×15/side', note: '', load: 0 },
        { name: 'Mountain climbers', target: '3×20', note: '', load: 0 },
        { name: 'Burpees / high-knee sprints', target: 'optional', note: 'conditioning finisher', load: 0 },
      ]
    }
  },
  gym: {
    label: 'Gym',
    sub: 'dumbbells, cables, machines',
    push: {
      label: 'Push', day: 'Tuesday',
      exercises: [
        { name: 'Incline dumbbell press', target: '3×10-12', note: '', load: 0 },
        { name: 'Flat dumbbell press / machine press', target: '3×10-12', note: '', load: 0 },
        { name: 'Overhead press', target: '3×10', note: '', load: 0 },
        { name: 'Lateral raises', target: '3×12-15', note: '', load: 0 },
        { name: 'Tricep pushdowns', target: '3×12', note: '', load: 0 },
        { name: 'Overhead tricep extension', target: '3×12', note: '', load: 0 },
      ]
    },
    pull: {
      label: 'Pull', day: 'Wednesday',
      exercises: [
        { name: 'Pull-ups or lat pulldown', target: '4×8-10', note: '', load: 0 },
        { name: 'Seated row', target: '3×10-12', note: '', load: 0 },
        { name: 'Face pulls', target: '3×15', note: '', load: 0 },
        { name: 'Bicep curls', target: '3×12', note: '', load: 0 },
        { name: 'Hammer curls', target: '3×12', note: '', load: 0 },
        { name: 'Rear delt flyes', target: '3×15', note: '', load: 0 },
      ]
    },
    core: {
      label: 'Core', day: 'Friday',
      exercises: [
        { name: 'Hanging leg raises', target: '3×12', note: '', load: 0 },
        { name: 'Cable woodchoppers', target: '3×12/side', note: '', load: 0 },
        { name: 'Plank variations', target: '3 rounds', note: '', load: 0 },
        { name: 'Ab wheel or weighted crunches', target: '3×12-15', note: '', load: 0 },
        { name: 'Sled pushes or sprints', target: 'optional', note: 'conditioning finisher', load: 0 },
      ]
    }
  }
};
