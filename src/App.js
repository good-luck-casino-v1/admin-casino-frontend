import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
      </Switch>
    </Router>
  );
}

export default App;