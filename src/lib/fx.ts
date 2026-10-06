"use client";

import { useEffect, type DependencyList, type RefObject } from "react";

/**
 * Шар анімацій (GSAP + плагіни) вантажиться окремим чанком уже після гідратації:
 * контент сторінки рендериться сервером і читається без нього, а критичний шлях
 * першого кадру не чекає на ~55 КБ JS.
 */
export type FxLib = typeof import("./gsap");

let promise: Promise<FxLib> | null = null;

export function loadFx(): Promise<FxLib> {
  if (!promise) promise = import("./gsap");
  return promise;
}

type Cleanup = void | (() => void);

/**
 * Аналог useGSAP з ледачим завантаженням: усе, що створено в `setup`,
 * записується в gsap.context і відкочується при демонтажі.
 */
export function useFx(
  scope: RefObject<Element | null> | null,
  setup: (lib: FxLib, ctx: gsap.Context) => Cleanup,
  deps: DependencyList = [],
) {
  useEffect(() => {
    let ctx: gsap.Context | undefined;
    let dead = false;
    loadFx().then((lib) => {
      if (dead) return;
      ctx = lib.gsap.context((self) => setup(lib, self), scope?.current ?? undefined);
    });
    return () => {
      dead = true;
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
