import React from "react";
import { Route, Switch } from "react-router-dom";
import Welcome from "./containers/Welcome";
import Instructions from "./containers/Instructions";
import NotFound from "./containers/NotFound";
import Complete from "./containers/Complete";
import Continue from "./containers/Continue";
import Continue_rating from "./containers/Continue_rating";
import TrialQ from "./containers/TrialQ";
import Trial_P from "./containers/Trial_P";
import Trial_P_rating from "./containers/Trial_P_rating";
import OnceMore from "./containers/OnceMore";
import OnceMore_rating from "./containers/OnceMore_rating";
import Trial_TT_1 from "./containers/Trial_TT_1";
import Trial_TT_2 from "./containers/Trial_TT_2";
import Trial_TT_3 from "./containers/Trial_TT_3";
import Trial_TT_4 from "./containers/Trial_TT_4";
import Break1 from "./containers/Break1";
import Break2 from "./containers/Break2";
import Break3 from "./containers/Break3";
import ThankYou from "./containers/ThankYou";
import Error from "./containers/Error";


export default () =>
  <Switch>
    <Route path="/" exact component={Welcome} />
    <Route path="/Welcome" exact component={Welcome} />
    <Route path="/Instructions" exact component={Instructions} />
    <Route path="/Trial_P" exact component={Trial_P} />
    <Route path="/OnceMore" exact component={OnceMore} />
    <Route path="/Continue" exact component={Continue} />
    <Route path="/Trial_P_rating" exact component={Trial_P_rating} />
    <Route path="/OnceMore_rating" exact component={OnceMore_rating} />
    <Route path="/Continue_rating" exact component={Continue_rating} />
    <Route path="/TrialQ" exact component={TrialQ} />
    <Route path="/Complete" exact component={Complete} />
    <Route path="/Trial_TT_1" exact component={Trial_TT_1} />
    <Route path="/Break1" exact component={Break1} />
    <Route path="/Trial_TT_2" exact component={Trial_TT_2} />
    <Route path="/Break2" exact component={Break2} />
    <Route path="/Trial_TT_3" exact component={Trial_TT_3} />
    <Route path="/Break3" exact component={Break3} />
    <Route path="/Trial_TT_4" exact component={Trial_TT_4} />
    <Route path="/ThankYou" exact component={ThankYou} />
    <Route path="/Error" exact component={Error} />

        { /* Finally, catch all unmatched routes */ }
    <Route component={NotFound} />
  </Switch>;
