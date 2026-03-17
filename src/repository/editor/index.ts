import { BrowserStorage } from "../../libs/storage/index";
import { State } from "../../types/editor/index";

const STORAGE_KEY = "markdown_editor_contents";

export class EditorRepository {
  private readonly storage: BrowserStorage<State> = new BrowserStorage(
    window.localStorage,
  );

  public get(): State | undefined {
    return this.storage.get(STORAGE_KEY) ?? undefined;
  }

  public update(state: State): void {
    this.storage.set(STORAGE_KEY, state);
  }

  clear(): void {
    this.storage.set(STORAGE_KEY, undefined);
  }
}
