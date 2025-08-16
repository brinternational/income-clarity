/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveStyle(css: string | object): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveValue(value: string | number): R;
      toBeChecked(): R;
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R;
      toBeEmptyDOMElement(): R;
      toBeInvalid(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(htmlText: string): R;
      toHaveAccessibleDescription(expectedAccessibleDescription?: string | RegExp): R;
      toHaveAccessibleName(expectedAccessibleName?: string | RegExp): R;
      toHaveDescription(text?: string | RegExp): R;
      toHaveErrorMessage(text?: string | RegExp): R;
      toHaveFocus(): R;
      toHaveFormValues(expectedValues: Record<string, unknown>): R;
      toBePartiallyChecked(): R;
      toHaveRole(expectedRole: string): R;
      toHaveSelectedOptions(selectedOptions: string | Array<string | HTMLElement>): R;
    }
  }
}

export {};