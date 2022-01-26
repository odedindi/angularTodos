import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewContainerRef,
} from '@angular/core';
import gsap from 'gsap';

@Directive({
  selector: '[appCoreAnimation]',
})
export class CoreAnimationDirective {
  @Input() duration = 1;
  @Input() delay = 0;

  @Output() complete: EventEmitter<null> = new EventEmitter();
  @Output() reverseComplete: EventEmitter<null> = new EventEmitter();
  protected timeline: gsap.core.Timeline;

  constructor(protected element: ElementRef) {
    this.element.nativeElement.addEventListener(
      'animate-out',
      ({ detail }: any) => {
        this.animateOut(detail.parentViewRef);
      }
    );
    this.timeline = gsap.timeline({
      onComplete: (_) => this.complete.emit(),
      onReverseComplete: (_) => this.reverseComplete.emit(),
      paused: true,
      reversed: true,
    });
  }

  protected animateIn() {
    if (this.timeline.isActive()) {
      this.timeline.kill();
    }
    this.timeline.play();
  }

  protected animateOut(parentViewRef: ViewContainerRef) {
    if (this.timeline.isActive()) {
      this.timeline.kill();
    }
    setTimeout(() => {
      this.timeline.timeScale(this.duration).delay(0).reverse();
      setTimeout((_: any) => {
        if (parentViewRef) {
          parentViewRef.clear();
        }
      }, this.duration * 1000);
    }, this.delay * 1000);
  }
}
