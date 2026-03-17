import { findClosestElement } from "../../components/drag-drop/block/drop/helpers";

export class DragAndDrop {
  private _activeId: string | undefined = undefined;
  private _closestId: string | undefined = undefined;
  private _listeners: Set<() => void> = new Set();

  public get activeId(): string | undefined {
    return this._activeId;
  }

  public get closestId(): string | undefined {
    return this._closestId;
  }

  private set closestId(id: string | undefined) {
    this._closestId = id;
    this._listeners.forEach((listener) => listener());
  }

  public dragStart(id: string) {
    this._activeId = id;
    this.closestId = undefined;
  }

  public dragOver(y: number, container: HTMLElement) {
    if (this._activeId == null) {
      return;
    }

    const closestEl = findClosestElement(container, y);
    const closestId = closestEl?.id || undefined;

    if (this._closestId !== closestId) {
      this.closestId = closestId;
    }
  }

  public dragEnd() {
    this._activeId = undefined;
    this.closestId = undefined;
  }

  public dragLeave() {
    if (this._closestId != null) {
      this.closestId = undefined;
    }
  }

  public subscribe = (listener: () => void) => {
    this._listeners.add(listener);

    return () => {
      this._listeners.delete(listener);
    };
  };
}
