import {
  QWidget,
  NodeWidget,
  WidgetAttribute,
  WindowType
} from "@nodegui/nodegui";
import { registerComponent } from "../config";

export interface ListenerMap {
  [key: string]: (payload?: any) => void;
}
export interface ViewProps {
  id?: string;
  style?: string; // Inline style from NodeGui
  styleSheet?: string;
  visible?: boolean;
  ref?: any;
  on?: ListenerMap;
  mouseTracking?: boolean;
  enabled?: boolean;
  attributes?: WidgetAttribute[];
  windowFlags?: WindowType[];
  windowOpacity?: Number;
}

export const setProps = (
  widget: NodeWidget,
  newProps: ViewProps,
  oldProps: ViewProps
) => {
  const setter: ViewProps = {
    set visible(shouldShow: boolean) {
      shouldShow ? widget.show() : widget.hide();
    },
    set style(inlineStyle: string) {
      if (newProps.styleSheet) {
        console.warn("Both styleSheet and inlineStyle can't be used together");
      }
      widget.setInlineStyle(inlineStyle);
    },
    set styleSheet(styleSheet: string) {
      widget.setStyleSheet(styleSheet);
    },
    set id(id: string) {
      widget.setObjectName(id);
    },
    set mouseTracking(isMouseTracked: boolean) {
      widget.setMouseTracking(isMouseTracked); //TODO: add a getter for this in nodegui
    },
    set enabled(enable: boolean) {
      widget.setEnabled(enable);
    },
    set on(listenerMap: ListenerMap) {
      const listenerMapLatest = Object.assign({}, listenerMap);
      const oldListenerMap = Object.assign({}, oldProps.on);

      Object.entries(oldListenerMap).forEach(([eventType, oldEvtListener]) => {
        const newEvtListener = listenerMapLatest[eventType];
        if (oldEvtListener !== newEvtListener) {
          widget.removeEventListener(eventType, oldEvtListener);
        } else {
          delete listenerMapLatest[eventType];
        }
      });

      Object.entries(listenerMapLatest).forEach(
        ([eventType, newEvtListener]) => {
          widget.addEventListener(eventType, newEvtListener);
        }
      );
    },
    set attributes(attributes: WidgetAttribute[]) {
      const oldAttributes = oldProps.attributes || [];
      const newAttributes = attributes || [];
      oldAttributes.forEach(eachOldAttribute => {
        widget.setAttribute(eachOldAttribute, false);
      });
      newAttributes.forEach(eachNewAttribute => {
        widget.setAttribute(eachNewAttribute, true);
      });
    },
    set windowFlags(windowTypes: WindowType[]) {
      const oldFlags = oldProps.windowFlags || [];
      const newFlags = windowTypes || [];
      oldFlags.forEach(eachOldFlag => {
        widget.setWindowFlag(eachOldFlag, false);
      });
      newFlags.forEach(eachNewWindowFlag => {
        widget.setWindowFlag(eachNewWindowFlag, true);
      });
    },
    set windowOpacity(opacity: Number) {
      widget.setWindowOpacity(opacity);
    }
  };
  Object.assign(setter, newProps);
};

export const View = registerComponent<ViewProps>({
  id: "view",
  getContext() {
    return {};
  },
  shouldSetTextContent: () => {
    return false;
  },
  createInstance: (
    newProps,
    rootInstance,
    currentHostContext,
    workInProgress
  ) => {
    const widget = new QWidget();
    setProps(widget, newProps, {});
    return widget;
  },
  finalizeInitialChildren: (instance, newProps, rootInstance, context) => {
    return false;
  },
  commitMount: (instance, newProps, internalInstanceHandle) => {
    return;
  },
  prepareUpdate: (
    instance,
    oldProps,
    newProps,
    rootContainerInstance,
    hostContext
  ) => {
    return true;
  },
  commitUpdate: (instance, updatePayload, oldProps, newProps, finishedWork) => {
    setProps(instance, newProps, oldProps);
  }
});
