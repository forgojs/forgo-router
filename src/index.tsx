import * as forgo from "forgo";
import { rerender, ForgoNode, Component } from "forgo";
import type { JSX } from "forgo";

/*
  To be called when the url needs to be changed.
  You'd usually not call this directly; instead use the <Link /> component which will internally call this.
*/
export function navigateTo(url: string) {
  window.history.pushState({}, "", url);
  updateRoute();
}

/*
  Fixme - this is all messed up.
*/
export function goBack(steps = -1) {
  if (window.history.length > 1) {
    window.history.go(steps);
    updateRoute();
  }
}

/*
  We have to re-render Router's parent.
  So we go up on componentIndex
*/
export function updateRoute() {
  const elem = {
    ...component.__internal.element,
    componentIndex: component.__internal.element.componentIndex - 1,
  };
  rerender(elem);
}

export type RouterProps = {
  skipHistoryEventRegistration?: boolean;
};

let component: Component;

export const Router = (props: RouterProps) => {
  if (!props.skipHistoryEventRegistration) {
    window.addEventListener("popstate", () => {
      updateRoute();
    });

    window.addEventListener("load", () => {
      updateRoute();
    });
  }

  return new Component({
    render(props, component_) {
      component = component_;
      return <div>{props.children}</div>;
    },
  });
};

export interface LinkProps
  // We deny the onclick attribute because we set our own click handler and
  // don't presently support merging click handlers
  extends Omit<JSX.HTMLAttributes<HTMLAnchorElement>, "onclick"> {
  // Override HTMLAnchorElement's href attribute to be mandatory
  href: string;
  key?: any;
  children?: ForgoNode | ForgoNode[];
}

export const Link = () => {
  return new Component({
    render({ children, ...props }: LinkProps) {
      return (
        <a {...props} onclick={createClickHandler(props.href)}>
          {children}
        </a>
      );
    },
  });
};

/*
  Useful for navigating to a url when a link or a button is clicked.
  But instead of using this directly, us the <Link /> component.
*/
function createClickHandler(url: string) {
  return (ev: MouseEvent) => {
    window.history.pushState({}, "", url);
    updateRoute();
    ev.preventDefault();
  };
}

/*
  Check if the url starts with a prefix.
*/

export type MatchResult = {
  matchedPath: string;
  params: { [key: string]: string };
  remainingPath: string;
};

export function matchExactUrl(
  pattern: string,
  fn: (match: MatchResult) => ForgoNode
): ForgoNode | false {
  const result = match(pattern, { exact: true });
  return result === false ? false : fn(result);
}

export function matchUrl(
  pattern: string,
  fn: (match: MatchResult) => ForgoNode
): ForgoNode | false {
  const result = match(pattern, { exact: false });
  return result === false ? false : fn(result);
}

export type MatchOptions = {
  exact: boolean;
};

export function match(
  pattern: string,
  options: MatchOptions = { exact: true }
): MatchResult | false {
  const url = window.location.href;

  const lcaseUrl = url.toLowerCase();

  const fixedUrl = ["http://", "https://"].some((prefix) =>
    lcaseUrl.startsWith(prefix)
  )
    ? lcaseUrl
    : `${
        typeof window === "undefined"
          ? "http://localhost"
          : `${window.location.protocol}//${window.location.hostname}`
      }${lcaseUrl.startsWith("/") ? lcaseUrl : `/${lcaseUrl}`}`;

  const urlObject = new URL(fixedUrl);

  const pathnameParts = urlObject.pathname
    .split("/")
    .slice(1, urlObject.pathname.endsWith("/") ? -1 : undefined);

  const patternParts = pattern
    .toLowerCase()
    .split("/")
    .slice(1, pattern.endsWith("/") ? -1 : undefined);

  if (
    pathnameParts.length < patternParts.length ||
    (options.exact && pathnameParts.length !== patternParts.length)
  ) {
    return false;
  } else {
    const match: MatchResult = {
      params: {},
      matchedPath: "",
      remainingPath: urlObject.pathname,
    };

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathnamePart = pathnameParts[i];

      if (patternPart.startsWith(":")) {
        const paramName = patternPart.substring(1);
        match.params[paramName] = pathnamePart;
        match.matchedPath += `/${pathnamePart}`;
      } else {
        if (patternPart === pathnamePart) {
          match.matchedPath += `/${pathnamePart}`;
        } else {
          return false;
        }
      }
    }

    match.remainingPath = `/${pathnameParts
      .slice(patternParts.length)
      .join("/")}`;

    return match;
  }
}
