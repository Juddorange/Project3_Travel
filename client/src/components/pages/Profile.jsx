import React, { useState, useEffect } from 'react'

import api from '../../api'
import GraphCarbonOverTime from './GraphCarbonOverTime'
import GraphTripsDoughnut from './GraphTripsDoughnut'

export default function Profile(props) {
  //edit profile
  const [user, setUser] = useState({
    email: '',
    name: '',
    picture: '',
    msg: '',
  })

  const [UIMessage, setUIMessage] = useState('')

  //saved trips

  const [trip, setTrip] = useState([])
  const [statistics, setStatistics] = useState({
    carbonEmittedPerTrip: [],
    average: [],
    lineLabels: [],
    numberOfTrips: 0,
    tripsByMode: { train: 0, car: 0, foot: 0, bicycle: 0 },
  })

  //update profile
  useEffect(() => {
    api
      .getProfile()
      .then(res => {
        setUser(res)
      })
      .catch(err => console.log(err))
  }, [])

  function handleOnChange(e) {
    e.preventDefault()
    let value = e.target.value
    if (e.target.name === 'picture') {
      setUser({
        ...user,
        pictureToUpdate: e.target.files[0],
      })
    } else setUser({ ...user, [e.target.name]: value })
  }

  function handleClickButton(e) {
    e.preventDefault()
    // e.target.parentElement.previousSibling.getAttribute('name')
    let name = e.target.parentElement.parentElement.childNodes[1].getAttribute(
      'name'
    )
    if (name === 'name') {
      api
        .updateProfile('name', user.name)
        .then(res => {
          setUIMessage(res.msg)
          setUser({ ...user, name: user.name })
        })
        .catch(err => console.log(err))
    }
    if (name === 'email') {
      api
        .updateProfile('email', user.email)
        .then(res => {
          setUIMessage(res.msg)
          setUser({ ...user, email: user.email })
        })
        .catch(err => console.log(err))
    }
    if (name === 'picture') {
      api
        .updatePicture(user.pictureToUpdate)
        .then(res => {
          setUser({ ...user, picture: res.dbRes.picture })
          setUIMessage(res.msg)
        })
        .catch(err => console.log(err))
    }
  }

  //delete profile
  function handleDelete() {
    api
      .deleteProfile()
      .then(res => {
        props.history.push('/signup')
      })
      .catch(err => console.log(err))
  }

  //delete trip
  function deleteTrip(_id) {
    api
      .deleteTrip(_id)
      .then(res => {
        api
          .getSavedTrip()
          .then(res => {
            setTrip(res)
            formatStats(res)
          })
          .catch(err => console.log(err))
        /* eslint-disable */
      })
      .catch(err => console.log(err))
  }

  //charts
  function formatStats(arr) {
    console.log(arr)
    let bicycleTravels = 0,
      trainTravels = 0,
      carTravels = 0,
      footTravels = 0

    for (let element of arr) {
      if (element.transport === 'BICYCLE') bicycleTravels += 1
      else if (element.transport === 'CAR') carTravels += 1
      else if (element.transport === 'TRAIN') trainTravels += 1
      else footTravels += 1
    }
    let tripsByMode = {
      train: trainTravels,
      car: carTravels,
      foot: footTravels,
      bicycle: bicycleTravels,
    }

    let carbonEmittedPerTrip = arr.map(v => v.carbon)
    let averageNumber =
      Math.round(
        (carbonEmittedPerTrip.reduce((acc, cv) => acc + cv, 0) /
          carbonEmittedPerTrip.length) *
          100
      ) / 100
    let lineLabels = []
    let average = []
    for (let i = 1; i < arr.length + 1; i++) {
      lineLabels.push(i)
      average.push(averageNumber)
    }

    setStatistics({
      ...statistics,
      carbonEmittedPerTrip,
      average,
      lineLabels,
      tripsByMode,
    })
  }

  useEffect(() => {
    api
      .getSavedTrip()
      .then(res => {
        console.log(res)
        setTrip(res)
        formatStats(res)
      })
      .catch(err => console.log(err))
    /* eslint-disable */
  }, [])

  let labelounes = [1, 2, 3]

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
            <input
              className="input_profile"
              type="file"
              name="picture"
              onChange={handleOnChange}
            />{' '}
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
          <div className="line">
            <GraphCarbonOverTime
              title={'Carbon emitted by travel'}
              max-width={'30vw'}
              height={'30vh'}
              labels={statistics.labels}
              data={{
                carbonEmittedPerTrip: statistics.carbonEmittedPerTrip,
                average: statistics.average,
              }}
            />
          </div>

          <div className="doughnut">
            <GraphTripsDoughnut
              width={'50vw'}
              height={'50vh'}
              labels={['train', 'car', 'foot', 'bicycle']}
              data={statistics.tripsByMode}
            />
          </div>
        </div>
        <div className="profile_trips">
          <h1 style={{ textAlign: 'center' }}>Your trips</h1>
          <div className="trip_details">
            {trip.map((trips, i) => (
              <div className="div-ul" key={i}>
                <h2>Trip n° {[i + 1]}</h2>
                <ul>
                  <li>
                    <strong className="title_detail">Departure : </strong>{' '}
                    {trips.departure}
                  </li>
                  <li>
                    <strong className="title_detail">Arrival : </strong>
                    {trips.arrival}
                  </li>
                  <li>
                    <strong className="title_detail">Transport : </strong>
                    {trips.transport}
                  </li>
                  <li>
                    <strong className="title_detail">Duration : </strong>
                    {trips.duration}
                  </li>
                  <li>
                    <strong className="title_detail">Distance : </strong>
                    {trips.distance} km
                  </li>
                  <li>
                    <strong className="title_detail">
                      Carbon footprint :{' '}
                    </strong>
                    {trips.carbon} kg
                  </li>
                  <li>
                    <strong className="title_detail">
                      One way / Two way ?{' '}
                    </strong>
                    {trips.returnTrip}
                  </li>
                  <li>
                    <strong className="title_detail">
                      Recurrence of your trip :{' '}
                    </strong>
                    {trips.frequency.number} / {trips.frequency.period}
                  </li>
                  <li>
                    <button
                      className="btn-delete"
                      onClick={() => deleteTrip(trips._id)}
                    >
                      Delete Trip
                    </button>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
