import React from 'react';
import { Route, Switch } from 'react-router-dom';
import MainNavbar from './MainNavbar';
import Home from './pages/Home';
import TripDetail from './pages/TripDetail';
import AddCountry from './pages/AddCountry';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Test from './pages/Test';

export default function App() {
	return (
		<div className="App">
			<MainNavbar />
			<Switch>
				<Route path="/" exact component={Home} />
				<Route path="/add-country" component={AddCountry} />
				<Route path="/:trip-detail" component={TripDetail} />
				<Route path="/signup" component={Signup} />
				<Route path="/login" component={Login} />
				<Route path="/profile" component={Profile} />
				<Route path="/test" component={Test} />
				<Route render={() => <h2>404</h2>} />
			</Switch>
		</div>
	);
}
