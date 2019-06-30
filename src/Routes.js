import React from "react";
import { Route, Switch } from "react-router-dom";
import Welcome from "./containers/Welcome";
import Instructions from "./containers/Instructions";
import NotFound from "./containers/NotFound";
import Complete from "./containers/Complete";
import TrialQ from "./containers/TrialQ";


export default () =>
  <Switch>
    <Route path="/" exact component={Welcome} />
    <Route path="/Welcome" exact component={Welcome} />
    <Route path="/Instructions" exact component={Instructions} />
    <Route path="/TrialQ" exact component={TrialQ} />
    <Route path="/Complete" exact component={Complete} />
        { /* Finally, catch all unmatched routes */ }
    <Route component={NotFound} />
  </Switch>;
