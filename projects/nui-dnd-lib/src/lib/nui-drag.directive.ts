import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil, tap } from 'rxjs';
import { fromEvent } from 'rxjs';

export interface IDOMRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IPageCoord {
  x: number;
  y: number;
}

@Directive({
  selector: '[nuiDrag]'
})
export class NuiDragDirective implements OnInit, OnDestroy {

  private dragElInitialPosition!: IPageCoord;
  private dragElLastPosition!: IPageCoord;
  private dragStartPosition!: IPageCoord;

  private get dragEl(): HTMLElement {
    return this.el.nativeElement;
  }

  private isDragInitiated = false;
  private destroy$ = new Subject();
  private document: Document;

  constructor(
    private el: ElementRef,
    @Inject(DOCUMENT) document: Document
  ) {
    this.document = document;
  }

  ngOnInit(): void {
    this.init();
    if (!this.dragElInitialPosition) {
      this.dragElInitialPosition = this.getElCoordinate(this.dragEl);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }


  // private methods

  private init() {
    this.attachListeners();
  }

  private attachListeners() {
    fromEvent<MouseEvent>(this.el.nativeElement, 'mousedown')
      .pipe(takeUntil(this.destroy$))
      .subscribe(evt => {
        this.onPointerDown(evt);
        this.initializeDragging();
      });
  }

  private initializeDragging() {
    const upEvent = fromEvent<MouseEvent>(this.document, 'mouseup')
      .pipe(
        takeUntil(this.destroy$),
        tap(evt => {
          this.onPointerUp(evt);
        })
      );

    fromEvent<MouseEvent>(this.document, 'mousemove')
      .pipe(takeUntil(upEvent))
      .subscribe(evt => {
        this.onPointerMove(evt);
      });

  }

  private onPointerDown(evt: MouseEvent) {
    this.isDragInitiated = true;
    this.dragElLastPosition = this.getElCoordinate(this.dragEl);
    this.dragStartPosition = { x: evt.pageX, y: evt.pageY };
  }

  private onPointerMove(evt: MouseEvent) {
    if (this.isDragInitiated) {
      this.moveElement(evt);
    }
  }

  private onPointerUp(evt: MouseEvent) {
    this.isDragInitiated = false;
    this.removeMoveStyle();
  }

  private moveElement(evt: MouseEvent) {
    if (this.isDragInitiated) {
      const distanceMoved = {
        x: evt.pageX - this.dragStartPosition.x,
        y: evt.pageY - this.dragStartPosition.y
      };

      const lastDistanceMoved = {
        x: this.dragElLastPosition.x - this.dragElInitialPosition.x,
        y: this.dragElLastPosition.y - this.dragElInitialPosition.y
      };

      const newPosition = {
        x: distanceMoved.x + lastDistanceMoved.x,
        y: distanceMoved.y + lastDistanceMoved.y
      };

      this.dragEl.style.transform = `translate3d(${newPosition.x}px, ${newPosition.y}px, 0px)`;
      this.setStyleOnMove();
    }
  }

  private getElCoordinate(el: HTMLElement) {
    const { left, top, width, height } = el.getBoundingClientRect();
    return { x: left, y: top, width, height };
  }

  private setStyleOnMove() {
    this.dragEl.style.setProperty('user-select', 'none');
  }

  private removeMoveStyle() {
    this.dragEl.style.removeProperty('user-select');
  }
}
