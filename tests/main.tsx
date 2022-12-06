import * as forgo from "forgo";
import { Router, matchExactUrl, Link } from "../src/index.js";

const App: forgo.ForgoNewComponentCtor = () => {
  return new forgo.Component({
    render() {
      // TODO: The router doesn't accept all Forgo child types, such as strings
      // and nulls
      return (
        <Router>
          <nav style="display: flex; flex-direction: column;">
            <Link href="/">Home</Link>
          </nav>

          <div id="content">
            {matchExactUrl("/", () => {
              return "Please navigate to a test page";
            }) ||
              matchExactUrl("/params/:foo", (match) => {
                return <Params match={match} />;
              }) || <p>Fallthrough Route</p>}
          </div>
        </Router>
      );
    },
  });
};

const Params: forgo.ForgoNewComponentCtor<{ match: any }> = () => {
  return new forgo.Component({
    render({ match }) {
      const { params } = match;
      const { foo } = params;
      return foo;
    },
  });
};

// Wait for the page DOM to be ready for changes
function ready(fn: any) {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

ready(() => {
  // Attach your app's root component to a specific DOM element
  forgo.mount(<App />, document.getElementById("root"));
});
