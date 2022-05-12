import { trigger, animate, transition, style, query } from '@angular/animations';

export const routeAnimation = trigger('routeAnimation', [
  // The '* => *' will trigger the animation to change between any two states
  transition('* => *', [
    // The query function has three params.
    // First is the event, so this will apply on entering or when the element is added to the DOM.
    // Second is a list of styles or animations to apply.
    // Third we add a config object with optional set to true, this is to signal
    // angular that the animation may not apply as it may or may not be in the DOM.
    query(':enter', [style({ opacity: 0 })], { optional: true }),
    query(
      ':leave',
      // here we apply a style and use the animate function to apply the style over 0.3 seconds
      [style({ opacity: 1 }), animate('0s', style({ opacity: 0 }))],
      { optional: true }
    ),
    query(
      ':enter',
      [style({ opacity: 0 }), animate('0.3s', style({ opacity: 1 }))],
      { optional: true }
    )
  ])
]);



export const fadeInOut = trigger("fadeInOut", [
  transition(":enter", [
    style({ opacity: 0 }),
    animate(200, style({ opacity: 1 }))
  ]),
  transition(":leave", [
    animate(200, style({ opacity: 0 }))
  ])

]);



export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate(200, style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate(0, style({ opacity: 0 }))
  ])
]);
