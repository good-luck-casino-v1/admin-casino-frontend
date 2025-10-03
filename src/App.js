import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminResetPassword from './components/AdminResetPassword'; //  import
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Switch>
        {/* Admin Login */}
        <Route exact path="/" component={AdminLogin} />

        {/* Admin Dashboard */}
        <Route path="/admin/dashboard" component={AdminDashboard} />

        {/* Admin Reset Password Page */}
        <Route path="/admin/reset-password" component={AdminResetPassword} /> 
      </Switch>
    </Router>
  );
}

export default App;
