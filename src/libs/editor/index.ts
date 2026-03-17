import { EditorRepository } from "../../repository/editor/index";
import {
  Block,
  BlockType,
  ImageBlock,
  Node,
  State,
} from "../../types/editor/index";
import { generateId } from "../../utils/id";

export class Editor {
  private _state: State;

  private readonly blockListeners: Set<() => void> = new Set();

  private readonly repository = new EditorRepository();

  constructor() {
    const savedData = this.repository.get();

    this._state =
      savedData?.rootIds && savedData?.nodes
        ? savedData
        : { nodes: {}, rootIds: [] };
  }

  public get state(): State {
    return this._state;
  }

  private set state(value: State) {
    this._state = value;
    this.repository.update(value);
    this.blockListeners.forEach((listener) => listener());
  }

  /**
   * 이미지 업로드가 시작될 때, 화면에 먼저 로딩 창을 띄우기 위해 임시 블록을 만듭니다.
   *
   * @returns 생성된 임시 이미지 블록의 ID
   */
  public addPendingImage = (): string => {
    const id = generateId();
    const block: ImageBlock = { type: "image", value: "", isLoading: true };
    const update: Node = { id, block, parentId: null, childrenIds: [] };

    // 새 노드를 nodes 객체에 추가하고, rootIds 배열의 맨 끝에 배치합니다.
    this.state = {
      nodes: { ...this._state.nodes, [id]: update },
      rootIds: [...this._state.rootIds, id],
    };

    return id;
  };

  /**
   * 이미지 업로드가 완료되면, 실제 URL을 넣고 로딩 상태를 해제합니다.
   *
   * @param blockId 업데이트할 이미지 블록의 ID
   * @param url 업로드 완료된 이미지의 실제 URL
   */
  public updateImageBlock = (blockId: string, url: string) => {
    this.updateBlock(blockId, {
      value: url,
      isLoading: false,
    } as Partial<ImageBlock>);
  };

  /**
   * 유저가 엔터를 입력하여 새로운 블록을 생성하고 특정 위치에 삽입합니다.
   *
   * @param next? 새롭게 생성될 블록의 ID
   * @param prev? 기준이 되는 현재 블록의 ID
   * @param type? 생성할 블록의 타입 (기본값: text)
   */
  public enter = (
    option: { next?: string; prev?: string; type?: BlockType } = {},
  ) => {
    const { next, prev, type = "text" } = option;
    const id = next || generateId();

    const block = { type, value: "" } as Block;
    let updateNode: Node = { id, block, parentId: null, childrenIds: [] };

    const updateNodes = { ...this._state.nodes, [id]: updateNode };

    // prev가 없는 경우, 문서의 최상단에 새로운 블록을 추가합니다.
    if (prev == null) {
      this.state = {
        nodes: updateNodes,
        rootIds: [id, ...this._state.rootIds],
      };
      return;
    }

    const prevNode = this._state.nodes[prev];

    if (prevNode == null) {
      return;
    }

    // 기준 노드가 부모를 가지고 있는지 확인하여 삽입 위치를 결정합니다.
    if (prevNode.parentId) {
      // 부모가 존재한다면, 부모의 childrenIds 배열에서 기준 노드의 다음 위치에 삽입합니다.
      const parent = this._state.nodes[prevNode.parentId];
      const updateChildrenIds = [...parent.childrenIds];
      const prevIndex = updateChildrenIds.indexOf(prev);

      updateChildrenIds.splice(prevIndex + 1, 0, id);
      updateNode.parentId = prevNode.parentId;

      updateNodes[parent.id] = { ...parent, childrenIds: updateChildrenIds };
      this.state = { ...this._state, nodes: updateNodes };
    } else {
      // 기준 노드가 최상위 루트 블록이라면, rootIds 배열의 기준 노드 다음 위치에 삽입합니다.
      const updateRootIds = [...this._state.rootIds];
      const prevIndex = updateRootIds.indexOf(prev);

      updateRootIds.splice(prevIndex + 1, 0, id);
      this.state = { nodes: updateNodes, rootIds: updateRootIds };
    }
  };

  /**
   * 시각적 기준으로 현재 블록의 바로 이전 줄에 해당하는 블록의 ID를 찾습니다.
   *
   * @param id 기준이 되는 현재 블록의 ID
   *
   * @returns 이전 블록의 ID를 반환하며, 이전 블록이 없으면 undefined를 반환합니다.
   */
  public getPrevId = (id: string): string | undefined => {
    const node = this._state.nodes[id];
    if (!node) return undefined;

    // 현재 블록이 속해있는 배열(부모의 자식 배열 또는 루트 배열)을 가져옵니다.
    const list = node.parentId
      ? this._state.nodes[node.parentId].childrenIds
      : this._state.rootIds;

    const index = list.indexOf(id);

    // 현재 블록이 배열의 첫 번째 요소인 경우
    if (index === 0) {
      // 부모가 존재하면 부모의 ID를 반환하여 포커스를 위로 올립니다.
      return node.parentId ? node.parentId : undefined;
    }

    // 배열 내에 이전 형제 블록이 존재하는 경우, 먼저 그 형제를 타겟으로 잡습니다.
    let targetId = list[index - 1];
    let targetNode = this._state.nodes[targetId];

    // 이전 형제가 자식을 가지고 있다면, 가장 깊고 마지막에 있는 자식을 찾아 내려갑니다.
    while (
      targetNode &&
      targetNode.childrenIds &&
      targetNode.childrenIds.length > 0
    ) {
      const lastChildId =
        targetNode.childrenIds[targetNode.childrenIds.length - 1];

      targetId = lastChildId;
      targetNode = this._state.nodes[targetId];
    }

    // 더 이상 하위 자식이 없는 가장 깊은 노드의 ID를 반환합니다.
    return targetId;
  };

  /**
   * 문서 전체에서 가장 마지막에 위치한 최상단 블록의 ID를 반환합니다.
   *
   * @returns 마지막 루트 블록의 ID, 문서가 비어있으면 undefined
   */
  public getLastId = (): string | undefined => {
    const rootIds = this._state.rootIds;
    if (rootIds.length === 0) return undefined;

    return rootIds[rootIds.length - 1];
  };

  /**
   * 특정 ID를 가진 블록의 데이터를 부분적으로 업데이트합니다.
   *
   * @param id 업데이트할 블록의 ID
   * @param data 덮어씌울 블록 데이터
   */
  public updateBlock = (id: string, data: Partial<Block>) => {
    const node = this._state.nodes[id];
    if (node == null) {
      return;
    }

    // 해당 노드의 block 객체만 새로운 데이터로 병합하여 상태를 업데이트합니다.
    this.state = {
      ...this._state,
      nodes: {
        ...this._state.nodes,
        [id]: {
          ...node,
          block: { ...node.block, ...data } as Block,
        },
      },
    };
  };

  /**
   * 특정 부모 블록의 하위에 새로운 자식 블록(들여쓰기)을 추가합니다.
   *
   * @param parentId 자식을 추가할 부모 블록의 ID
   * @param childBlock 추가할 자식 블록의 데이터 객체
   * @param childId? 추가할 자식 블록의 ID
   */
  public addChild = (parentId: string, childBlock: Block, childId?: string) => {
    const parent = this._state.nodes[parentId];
    if (parent == null) return;

    const id = childId || generateId();
    const updateNode: Node = {
      id,
      block: childBlock,
      parentId,
      childrenIds: [],
    };

    // 새로운 노드를 생성하고 부모의 childrenIds 배열 끝에 추가합니다.
    this.state = {
      ...this._state,
      nodes: {
        ...this._state.nodes,
        [id]: updateNode,
        [parentId]: { ...parent, childrenIds: [...parent.childrenIds, id] },
      },
    };
  };

  /**
   * 특정 블록을 삭제하고, 해당 블록에 속한 모든 하위 자식 노드들도 재귀적으로 삭제합니다.
   *
   * @param targetId 삭제할 타겟 블록의 ID
   */
  public deleteBlock = (targetId: string) => {
    const getDescendantIds = (id: string): string[] => {
      const node = this._state.nodes[id];

      if (node == null) {
        return [];
      }

      // 배열이 반환되기에, 배열이 중첩되는 상황이 생기므로 flatMap을 통하여 배열 평탄화를 진행합니다.
      return [
        id,
        ...node.childrenIds.flatMap((childId) => getDescendantIds(childId)),
      ];
    };

    const target = this._state.nodes[targetId];

    if (target == null) {
      return;
    }

    const idsToDelete = new Set(getDescendantIds(targetId));

    // 객체를 복사한 후 삭제해야 하는 노드들을 기존의 리스트에서 필터링합니다.
    const updateNodes = { ...this._state.nodes };

    idsToDelete.forEach((id) => {
      delete updateNodes[id];
    });

    let updateRootIds = [...this._state.rootIds];

    // 타겟 블록이 부모를 가지고 있다면, 부모의 자식 요소 배열에서 삭제할 블럭의 아이디를 제거합니다.
    if (target.parentId != null) {
      const parent = this._state.nodes[target.parentId];

      updateNodes[target.parentId] = {
        ...parent,
        childrenIds: parent.childrenIds.filter((id) => id !== targetId),
      };
    } else {
      // 기준 노드가 최상위 루트 블록이라면, rootIds 배열에서 타겟 ID를 제거합니다.
      updateRootIds = updateRootIds.filter((id) => id !== targetId);
    }

    this.state = { nodes: updateNodes, rootIds: updateRootIds };
  };

  /**
   * 드래그 앤 드롭을 통해 블록의 위치를 이동시킵니다.
   *
   * @param activeId 드래그 중인 블록의 ID
   * @param overId 드롭 대상 위치에 있는 기준 블록의 ID
   */
  public moveTo = (activeId: string, overId: string) => {
    if (activeId === overId) {
      return;
    }

    const activeNode = this._state.nodes[activeId];
    const overNode = this._state.nodes[overId];

    if (activeNode == null || overNode == null) {
      return;
    }

    const update = { ...this._state.nodes };
    let roots = [...this._state.rootIds];

    // 기존 위치에서 activeId를 제거합니다.
    if (activeNode.parentId != null) {
      const oldParent = update[activeNode.parentId];

      update[activeNode.parentId] = {
        ...oldParent,
        childrenIds: oldParent.childrenIds.filter((id) => id !== activeId),
      };
    } else {
      roots = roots.filter((id) => id !== activeId);
    }

    // 이동할 블록의 부모 ID를 타겟 블록의 부모 ID로 변경합니다.
    update[activeId] = {
      ...activeNode,
      parentId: overNode.parentId,
    };

    // 타겟 블록이 속한 배열의 해당 위치에 activeId를 삽입합니다.
    if (overNode.parentId != null) {
      const updateParent = update[overNode.parentId];
      const updateChildrenIds = [...updateParent.childrenIds];
      const insertIndex = updateChildrenIds.indexOf(overId);

      const targetIndex =
        insertIndex !== -1 ? insertIndex : updateChildrenIds.length;
      updateChildrenIds.splice(targetIndex, 0, activeId);

      update[overNode.parentId] = {
        ...updateParent,
        childrenIds: updateChildrenIds,
      };
    } else {
      const insertIndex = roots.indexOf(overId);
      const targetIndex = insertIndex !== -1 ? insertIndex : roots.length;

      roots.splice(targetIndex, 0, activeId);
    }

    this.state = { nodes: update, rootIds: roots };
  };

  public subscribe = (listener: () => void) => {
    this.blockListeners.add(listener);

    return () => {
      this.blockListeners.delete(listener);
    };
  };
}
