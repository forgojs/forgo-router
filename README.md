# forgo-router

A simple router for Forgo. Just about 1KB gzipped.

## Basic Example

It's fairly straight forward to use:

- Wrap your components with the Router component
- matchExactUrl() does an exact match
- matchUrl() just checks if the path starts with the specified pattern

Both functions take a callback as the second argument, which gets called if the match is a success.

Here's an example:

```tsx
import { Router, matchExactUrl, matchUrl } from "forgo-router";

function App() {
  return {
    render() {
      return (
        <Router>
          <Link href="/">Another Forgo App</Link>
          {matchExactUrl("/", () => <Home />) ||
            matchUrl("/customers", () => <Customers />) ||
            matchUrl("/about", () => <AboutPage />)}
        </Router>
      );
    },
  };
}
```

## Url Parameters

Sometimes you'd want to extract a parameter from a url, such as "103" from /customers/103. You can do that by defining a parameter in the pattern.

Your url pattern would now look like "/customers/:id", where id is the name of the captured parameter. The captured parameter is avalable in the callback, and can now be passed to the component to be rendered.

```tsx
function Customers() {
  return {
    render() {
      return (
        <div>
          <h1>Customers</h1>
          <div>
            {matchExactUrl("/customers", () => (
              <CustomerList customers={customers} />
            )) ||
              matchExactUrl("/customers/:id", (match) => (
                <CustomerDetails id={match.params.id} />
              ))}
          </div>
        </div>
      );
    },
  };
}
```

## Link

The Link component creates an anchor tag which can be used to navigate to a certain url. The reason to not use regular anchor tags (A tags) is that they will refresh the page - while the Link component merely changes the url via pushState APIs.

```tsx
function Home() {
  return {
    render() {
      return (
        <div>
          <h1>Home Page</h1>
          <p>Welcome to Forgo Examples Inc.</p>
          <ul>
            <li>
              Go to <Link href="/customers">Customers</Link>
            </li>
            <li>
              Go to the <Link href="/about">About Page</Link>
            </li>
          </ul>
        </div>
      );
    },
  };
}
```

## MatchResult

The callback used with matchUrl and matchExactUrl is of the type given below:

```ts
type MatchResult = {
  matchedPath: string;
  params: { [key: string]: string };
  remainingPath: string;
};
```

- matchedPath refers to the part of the path that matched the pattern.
- remainingPath refers to the part which follows the matched pattern.
- params is an object containing captured parameters.

## A Complete Example

Here's a more complete example. You can [try it on CodeSandbox](https://codesandbox.io/s/forgo-router-typescript-px4sg).

```tsx
import { mount } from "forgo";
import { Router, matchUrl, matchExactUrl, Link } from "forgo-router";

type Customer = {
  id: number;
  name: string;
  age: number;
};

const customers = [
  { id: 1, name: "Kai", age: 3 },
  { id: 2, name: "Jeswin", age: 40 },
  { id: 3, name: "Deepsta", age: 42 },
];

function App() {
  return {
    render() {
      return (
        <Router>
          <Link href="/">Home Page</Link>
          {matchExactUrl("/", () => <Home />) ||
            matchUrl("/customers", (match) => <Customers />) ||
            matchUrl("/about", () => <AboutPage />)}
        </Router>
      );
    },
  };
}

function Home() {
  return {
    render() {
      return (
        <div>
          <h1>Home Page</h1>
          <p>Welcome to Forgo Examples Inc.</p>
          <ul>
            <li>
              Go to <Link href="/customers">Customers</Link>
            </li>
            <li>
              Go to the <Link href="/about">About Page</Link>
            </li>
          </ul>
        </div>
      );
    },
  };
}

function Customers() {
  return {
    render() {
      return (
        <div>
          <h1>Customers Module</h1>
          <div>
            {matchExactUrl("/customers", () => (
              <CustomerList customers={customers} />
            )) ||
              matchExactUrl("/customers/:id", (match) => (
                <CustomerDetails id={match.params.id} />
              ))}
          </div>
        </div>
      );
    },
  };
}

type CustomersProps = {
  customers: Customer[];
};

export function CustomerList(props: CustomersProps) {
  return {
    render(props: CustomersProps) {
      return (
        <div>
          <h2>List of Customers</h2>
          <ul>
            {props.customers.map((c) => (
              <li>
                <Link href={`/customers/${c.id}`}>
                  {c.name}({c.age})
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );
    },
  };
}

type CustomerDetailsProps = {
  id: string;
};

export function CustomerDetails(props: CustomerDetailsProps) {
  return {
    render(props: CustomerDetailsProps) {
      const customer = customers.find((c) => c.id.toString() === props.id);
      return (
        <div>
          <h2>Customer Details</h2>
          {customer ? (
            <p>
              Details for {customer.name}. Id: {customer.id}, Age:{" "}
              {customer.age}
            </p>
          ) : (
            <p>Missing customer.</p>
          )}
        </div>
      );
    },
  };
}

export function AboutPage() {
  return {
    render() {
      return (
        <div>
          <h1>About Page</h1>
          <p>Hello, world</p>
        </div>
      );
    },
  };
}

function ready(fn: any) {
  if (document.readyState != "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

ready(() => {
  mount(<App />, document.getElementById("root"));
});
```
