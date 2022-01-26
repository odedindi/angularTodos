import { Directive, ElementRef, OnInit } from '@angular/core';
import { CoreAnimationDirective } from './core-animation.directive';

@Directive({
  selector: '[fadeInAnimation]',
})
export class FadeInAnimationDirective
  extends CoreAnimationDirective
  implements OnInit
{
  constructor(protected override element: ElementRef) {
    super(element);
  }

  protected override animateIn() {
    this.timeline
      .from(
        this.element.nativeElement,
        { opacity: '0', ease: 'Expo.easeInOut' },
        this.delay
      )
      .duration(this.duration);
    super.animateIn();
  }
  ngOnInit() {
    // perform animation
    this.animateIn();
  }
}
