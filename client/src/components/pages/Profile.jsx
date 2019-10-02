import React, { useState, useEffect } from 'react';

import api from '../../api';
import CarbonOverTime from './CarbonOverTime';
import TripsDoughnut from './TripsDoughnut';

export default function Profile(props) {
	//edit profile
	const [ user, setUser ] = useState({
		email: '',
		name: '',
		picture: '',
		msg: ''
	});

	const [ UIMessage, setUIMessage ] = useState('');

	//saved trips

	const [ trip, setTrip ] = useState([]);
	const [ statistics, setStatistics ] = useState({
		each: [],
		average: [],
		labels: []
	});

	//update profile
	useEffect(() => {
		api
			.getProfile()
			.then((res) => {
				setUser(res);
			})
			.catch((err) => console.log(err));
	}, []);

	function handleOnChange(e) {
		e.preventDefault();
		let value = e.target.value;
		if (e.target.name === 'picture') {
			setUser({
				...user,
				pictureToUpdate: e.target.files[0]
			});
		} else setUser({ ...user, [e.target.name]: value });
	}

	function handleClickButton(e) {
		e.preventDefault();
		// e.target.parentElement.previousSibling.getAttribute('name')
		let name = e.target.parentElement.parentElement.childNodes[1].getAttribute('name');
		if (name === 'name') {
			api
				.updateProfile('name', user.name)
				.then((res) => {
					setUIMessage(res.msg);
					setUser({ ...user, name: user.name });
				})
				.catch((err) => console.log(err));
		}
		if (name === 'email') {
			api
				.updateProfile('email', user.email)
				.then((res) => {
					setUIMessage(res.msg);
					setUser({ ...user, email: user.email });
				})
				.catch((err) => console.log(err));
		}
		if (name === 'picture') {
			api
				.updatePicture(user.pictureToUpdate)
				.then((res) => {
					setUser({ ...user, picture: res.dbRes.picture });
					setUIMessage(res.msg);
				})
				.catch((err) => console.log(err));
		}
	}

	//delete profile
	function handleDelete() {
		api
			.deleteProfile()
			.then((res) => {
				props.history.push('/signup');
			})
			.catch((err) => console.log(err));
	}

	//delete trip
	function deleteTrip(_id) {
		api
			.deleteTrip(_id)
			.then((res) => {
				api
					.getSavedTrip()
					.then((res) => {
						setTrip(res);
						formatStates(res);
					})
					.catch((err) => console.log(err));
				/*Eslint-disabled */
			})
			.catch((err) => console.log(err));
	}

	//charts
	function formatStates(arr) {
		let each = arr.map((v) => v.carbon);
		let averageNumber = Math.round(each.reduce((acc, cv) => acc + cv, 0) / each.length * 100) / 100;
		let labels = [];
		let average = [];
		for (let i = 1; i < arr.length + 1; i++) {
			labels.push(i);
			average.push(averageNumber);
		}

		setStatistics({ ...statistics, each, average, labels });
	}

	useEffect(() => {
		api
			.getSavedTrip()
			.then((res) => {
				setTrip(res);
				formatStates(res);
			})
			.catch((err) => console.log(err));
		/*Eslint-disabled */
	}, []);

	let labelounes = [ 1, 2, 3 ];

	//display transport mode
	function displayMode(mode) {
		if (mode === 'CAR') return 'fas fa-car';
		else if (mode === 'TRAIN') return 'fas fa-train';
		else if (mode === 'BICYCLE') return 'fas fa-biking';
		else return 'fas fa-walking';
	}

	return (
		<div className="profile">
			<div className="profile_info">
				<h1>Profile</h1>
				<br />
				<div className="profile_image">
					<img style={{ width: '100%' }} src={user.picture} alt="img" />
				</div>
				<div>
					{UIMessage && (
						<p className="msg-edit">
							<strong>{UIMessage}</strong>
						</p>
					)}
				</div>
				<div className="profile_detail_info">
					<div className="edit_items">
						<label>
							<strong>Name </strong>
						</label>
						<input
							className="input_profile"
							type="text"
							name="name"
							value={user.name}
							onChange={handleOnChange}
						/>
						<button onClick={handleClickButton} className="edit-btn">
							<i className="fas fa-pencil-alt" />
						</button>
					</div>
					<div className="edit_items">
						<label>
							<strong>Email</strong>
						</label>
						<input
							className="input_profile"
							type="text"
							name="email"
							value={user.email}
							onChange={handleOnChange}
						/>
						<button onClick={handleClickButton} className="edit-btn">
							<i className="fas fa-pencil-alt" />
						</button>
					</div>
					<div className="edit_items">
						<label>
							<strong>Profile picture</strong>
							<br />
						</label>
						<input className="input_profile" type="file" name="picture" onChange={handleOnChange} />{' '}
						<button onClick={handleClickButton} className="edit-btn">
							<i className="fas fa-pencil-alt" />
						</button>
					</div>
				</div>
				<button className="btn-delete" onClick={handleDelete}>
					Delete account
				</button>
			</div>
			<div className="trip-charts">
				<div className="charts">
					{/* 
      <CarbonOverTime
        title={'Carbon stack'}
        width={'50vw'}
        height={'50vh'}
        labels={labelounes}
        // data={statistics}
      /> */}
					<div className="line">
						<CarbonOverTime
							title={'Carbon stack'}
							max-width={'30vw'}
							height={'30vh'}
							labels={statistics.labels}
							data={{
								each: statistics.each,
								average: statistics.average
							}}
						/>
					</div>
					<div className="carbon-projects">
						<div className="doughnut">
							<TripsDoughnut width={'30vw'} height={'30vh'} labels={labelounes} data={[ 1, 2, 3 ]} />
						</div>
						<div className="projects">
							<h2>Carbon offset projects</h2>
							<a
								href="https://offset.climateneutralnow.org/allprojects"
								target="_blank"
								rel="noopener noreferrer"
							>
								United Nations
							</a>
							<a
								href="https://www.climatepartner.com/en/carbon-offset-projects"
								target="_blank"
								rel="noopener noreferrer"
							>
								Climate Partner
							</a>
							<a
								href="https://www.carbonfootprint.com/carbonoffsetprojects.html"
								target="_blank"
								rel="noopener noreferrer"
							>
								Carbon Footprint
							</a>
							<a
								href="https://www.goldstandard.org/take-action/offset-your-emissions"
								target="_blank"
								rel="noopener noreferrer"
							>
								Gold Standard
							</a>
							<a href="https://eco-act.com/our-projects/" target="_blank" rel="noopener noreferrer">
								Ecoact
							</a>
							<a href="https://climatecare.org/project-map/" target="_blank" rel="noopener noreferrer">
								Climate Care
							</a>
						</div>
					</div>
				</div>
				<div className="profile_trips">
					<h1 style={{ textAlign: 'center' }}>Your trips</h1>
					<div className="trip_details">
						{trip
							.sort((t1, t2) => {
								if (t1.timestamps > t2.timestamps) return 1;
								return -1;
							})
							.map((trips, i) => (
								<div className="div-ul" key={i}>
									<h2>
										<i className={displayMode(trips.transport)} />
										{'  '}
										{trips.departure}{' '}
										{trips.returnTrip === 'ONE WAY' ? (
											<i class="fas fa-long-arrow-alt-right" />
										) : (
											<i class="fas fa-arrows-alt-h" />
										)}{' '}
										{trips.arrival}
									</h2>
									<ul>
										<li>
											<strong className="title_detail">Duration : </strong>
											{trips.duration}
										</li>
										<li>
											<strong className="title_detail">Distance : </strong>
											{trips.distance} km
										</li>
										<li>
											<strong className="title_detail">Carbon footprint : </strong>
											{trips.carbon} kg
										</li>
										<li>
											<strong className="title_detail">Recurrence of your trip : </strong>
											{trips.frequency.number} / {trips.frequency.period}
										</li>
									</ul>
									<button className="btn-delete" onClick={() => deleteTrip(trips._id)}>
										<i class="fas fa-times" />
									</button>
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	);
}
