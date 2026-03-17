export const findClosestElement = (
  element: HTMLElement,
  y: number,
): Element | undefined => {
  const elements = element.querySelectorAll("[data-dragging='false']");

  let closestElement: Element | undefined = undefined;
  let closestOffset = -Infinity;

  Array.from(elements).forEach((element) => {
    const { top, height } = element.getBoundingClientRect();
    const offset = y - top - height / 2;

    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closestElement = element;
    }
  });

  return closestElement;
};
